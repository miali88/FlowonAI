import asyncio
import json
from typing import Dict, Annotated, AsyncGenerator, Any
from dataclasses import dataclass, field
from typing import List, Optional, Union
import pickle
from pathlib import Path

from livekit.agents import llm
from livekit.plugins import openai, anthropic
from livekit.agents.llm import USE_DOCSTRING

from services.cache import get_agent_metadata
from services.chat.chat import similarity_search
from services.voice.tool_use import trigger_show_chat_input
from services.composio import get_calendar_slots

import logging
logger = logging.getLogger(__name__)

@dataclass
class ChatScenario:
    name: str
    description: str
    messages: List[dict]
    expected_function_calls: List[str] = None
    actual_function_calls: List[str] = None

class ChatTester:
    def __init__(self, scenarios_dir: str = "chat_scenarios"):
        self.scenarios_dir = Path(scenarios_dir)
        self.scenarios_dir.mkdir(exist_ok=True)
        self.current_scenario = None
    
    def save_scenario(self, scenario: ChatScenario):
        with open(self.scenarios_dir / f"{scenario.name}.pkl", "wb") as f:
            pickle.dump(scenario, f)
    
    def load_scenario(self, name: str) -> Optional[ChatScenario]:
        try:
            with open(self.scenarios_dir / f"{name}.pkl", "rb") as f:
                return pickle.dump(f)
        except FileNotFoundError:
            return None

class DataSource:
    id: int
    title: str
    data_type: str

async def init_new_chat(agent_id: str, room_name: str):
    chat_histories[agent_id][room_name] = ChatHistory()

    llm_instance = openai.LLM(
        model="gpt-4o",
    )

    # Fetch agent configuration
    agent_metadata = await get_agent_metadata(agent_id)
    print(f"agent_metadata: {agent_metadata['agentName']}")
    if not agent_metadata:
        raise ValueError(f"Agent {agent_id} not found")

    # Create chat context with history
    chat_ctx = llm.ChatContext()
    chat_ctx.append(
        role="system",
        text=agent_metadata['instructions']
    )

    features = agent_metadata.get('features', [])
    fnc_ctx = llm.FunctionContext()

    @llm.ai_callable(
        name="question_and_answer",
        description="Extract user's question and perform information retrieval search to provide relevant answers",
        auto_retry=True
    )
    async def question_and_answer(
        question: Annotated[
            str,
            llm.TypeInfo(
                description="The user's point or query to perform RAG search on"
            )
        ]
    ) -> AsyncGenerator[str, None]:
        """
        Perform RAG search on each user point or query.
        Returns relevant information found in the knowledge base.
        """
        try:
            agent_metadata: Dict = await get_agent_metadata(agent_id)
    
            user_id: str = agent_metadata['userId']
            data_source: str = agent_metadata.get('dataSource', None)
            
            if data_source != "all":
                data_source: Dict = json.loads(data_source)
                data_source: Dict = {
                    "web": [item['title'] for item in data_source if item['data_type'] == 'web'],
                    "text_files": [item['id'] for item in data_source if item['data_type'] != 'web']
                }

                print("data_source:", data_source)
                results: List[Dict] = await similarity_search(question, data_source=data_source, user_id=user_id)
                # print(f"\n\n RAG: results: {results[0]}\n\n")

                # Extract URLs from results and include them in the RAG results
                results_with_urls = []
                for result in results:
                    result_dict = dict(result)
                    if 'url' in result:
                        result_dict['source_url'] = result['url']
                    results_with_urls.append(result_dict)

                # Yield the enhanced RAG results with URLs
                # print(f"\n\n RAG: results_with_urls: {results_with_urls}\n\n")
                # yield f"[RAG_RESULTS]: {json.dumps(results_with_urls)}"

            else:
                data_source = {"web": ["all"], "text_files": ["all"]}
                results = await similarity_search(question, data_source=data_source, user_id=user_id)

            rag_prompt = f"""            
            ## User Query: {question}
            ## WeCreate Information: {results}
            """

            chat_ctx = llm.ChatContext()
            chat_ctx.append(
                role="user",
                text=rag_prompt
            )

            # Create LLM instance and get response
            llm_instance = openai.LLM(model="gpt-4o")
            response_stream = llm_instance.chat(chat_ctx=chat_ctx)
            
            # Then yield the actual response chunks
            async for chunk in response_stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
            
        except Exception as e:
            logger.error(f"Error in question_and_answer: {str(e)}", exc_info=True)
            yield "I apologize, but I encountered an error while searching for an answer to your question."

    """ CALENDAR MANAGEMENT """
    @llm.ai_callable(
        name="fetch_calendar",
        description="Fetch available calendar slots for booking appointments or meetings",
        auto_retry=True
    )
    async def fetch_calendar(
        date_range: Annotated[
            str,
            llm.TypeInfo(
                description="The date range to search for available slots (e.g., 'next week', '2024-03-20 to 2024-03-25')"
            )
        ],
    ) -> str:
        """
        Fetches available calendar slots based on the specified date range and appointment type.
        Returns formatted information about available time slots.
        """
        logger.info(f"Fetching calendar slots for date range: {date_range}")
        
        try:
            print("\n\nfetch calendar func triggered")

            agent_metadata: Dict = await get_agent_metadata(agent_id)
            logger.info(f"Retrieved agent metadata: {bool(agent_metadata)}")

            if not agent_metadata:
                logger.error("Agent metadata is None or empty")
                return "I apologize, but I couldn't access the agent information. Please try again later."

            user_id: str = agent_metadata['userId']
            logger.info(f"User ID: {user_id}")

            print("have user_id, now fetching calendar slots")
            try:
                free_slots = await get_calendar_slots(user_id, "googlecalendar")
                logger.info(f"Calendar slots retrieved: {free_slots}")
                print(f"free_slots: {free_slots}")
                return f"Available slots found: {free_slots}"
            except Exception as calendar_error:
                logger.error(f"Error fetching calendar slots: {str(calendar_error)}", exc_info=True)
                return "I apologize, but I encountered an error while fetching calendar slots. Please try again later."
            
        except Exception as e:
            logger.error(f"Error in fetch_calendar: {str(e)}", exc_info=True)
            return "I apologize, but I encountered an error while checking the calendar availability."

    @llm.ai_callable(
        name="request_personal_data",
        description="Call this function when the assistant has provided product information to the user, or the assistant requests the user's personal data, or the user wishes to speak to someone, or wants to bring their vehicle in to the garage, or the user has requested a callback",
        auto_retry=False
    )
    async def request_personal_data(
        message: Annotated[
            str,
            llm.TypeInfo(
                description="Call this function when the assistant has provided product information to the user, or the assistant requests the user's personal data, or the user wishes to speak to someone, or the user has requested a callback"
            )
        ]
    ) -> str:
        logger.info(f"Personal data request triggered with message: {message}")
        print(f"Personal data request triggered with message: {message}")
        return "Form presented to user. Waiting for user to complete and submit form."


    # Always register Q&A function
    fnc_ctx._register_ai_function(question_and_answer)
    print(f"Registered Q&A function")
    logger.info(f"Registered Q&A function")

    if 'lead_gen' in features:
        fnc_ctx._register_ai_function(request_personal_data)
        print(f"Registered lead generation function")
        logger.info(f"Registered lead generation function")

    if 'app_booking' in features:
        fnc_ctx._register_ai_function(fetch_calendar)
        print(f"Registered calendar function")
        logger.info(f"Registered calendar function")

    return llm_instance, chat_ctx, fnc_ctx


@dataclass
class ChatHistory:
    messages: List[Dict[str, str]] = field(default_factory=list)
    llm_instance: Any = None
    chat_ctx: Any = None
    fnc_ctx: Any = None
    
    def add_message(self, role: str, content: str, name: str = None):
        message = {"role": role, "text": content}
        if name:
            message["name"] = name
        self.messages.append(message)
      
    def get_messages(self) -> List[Dict[str, str]]:
        return self.messages

# Global chat history store
chat_histories: Dict[str, Dict[str, ChatHistory]] = {}  # nested dict for agent_id -> room_name -> history

async def lk_chat_process(message: str, agent_id: str, room_name: str):
    print(f"lk_chat_process called with message: {message}, agent_id: {agent_id}, room_name: {room_name}")
    
    try:
        # Initialize or get existing chat history using both agent_id and room_name
        if agent_id not in chat_histories:
            print(f"Initializing new chat history for agent_id: {agent_id}")
            chat_histories[agent_id] = {}
        if room_name not in chat_histories[agent_id]:
            print(f"Initializing new chat history for room_name: {room_name}")
            llm_instance, chat_ctx, fnc_ctx = await init_new_chat(agent_id, room_name)
            chat_histories[agent_id][room_name] = ChatHistory()
            chat_histories[agent_id][room_name].llm_instance = llm_instance
            chat_histories[agent_id][room_name].chat_ctx = chat_ctx
            chat_histories[agent_id][room_name].fnc_ctx = fnc_ctx

        chat_history = chat_histories[agent_id][room_name]
        llm_instance = chat_history.llm_instance
        chat_ctx = chat_history.chat_ctx
        fnc_ctx = chat_history.fnc_ctx
        
        # Add historical messages
        for hist_message in chat_history.get_messages():
            if "name" in hist_message:
                chat_ctx.append(
                    role=hist_message["role"],
                    text=hist_message["text"],
                    name=hist_message["name"]
                )
            else:
                chat_ctx.append(
                    role=hist_message["role"],
                    text=hist_message["text"]
                )
        
        # Add current message
        chat_ctx.append(
            role="user",
            text=message
        )
        chat_history.add_message("user", message)
        print("\n\nchat_history.get_messages():", chat_history.get_messages())

        current_assistant_message = ""
        
        response_stream = llm_instance.chat(
            chat_ctx=chat_ctx,
            fnc_ctx=fnc_ctx
        )

        # Stream response back
        async for chunk in response_stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
                current_assistant_message += chunk.choices[0].delta.content
            elif chunk.choices[0].delta.tool_calls:
                # Tool calls handling...
                if current_assistant_message:
                    chat_history.add_message("assistant", current_assistant_message)
                    current_assistant_message = ""
                
                for tool_call in chunk.choices[0].delta.tool_calls:
                    called_function = tool_call.execute()
                    result = await called_function.task
                    
                    # Handle both string and generator responses
                    if isinstance(result, str):
                        tool_response = result
                        yield tool_response
                        chat_history.add_message("function", tool_response, name=tool_call.name)
                    else:
                        tool_response = ""
                        async for result_chunk in result:
                            tool_response += result_chunk
                            yield result_chunk
                        chat_history.add_message("function", tool_response, name=tool_call.name)
                    
                    # Add tool call and its response to chat history
                    # chat_history.add_message("assistant", f"Using tool: {tool_call.name}")
                    chat_history.add_message("function", tool_response)

        if current_assistant_message:
            chat_history.add_message("assistant", current_assistant_message)

    except Exception as e:
        logger.error(f"Error in lk_chat_process: {str(e)}", exc_info=True)
        if current_assistant_message:
            # Save partial message if we have one during error
            chat_history.add_message("assistant", current_assistant_message + " [Message interrupted due to error]")
        raise Exception("Failed to process chat message")

