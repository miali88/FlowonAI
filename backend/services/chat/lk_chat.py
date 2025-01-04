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
from livekit.agents.llm.chat_context import ChatMessage

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

    # llm_instance = openai.LLM(
    #     model="gpt-4o-",
    # )

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
    
    # Ensure system instructions are not empty
    if agent_metadata.get('instructions'):
        chat_ctx.append(
            role="system",
            text=agent_metadata['instructions']
        )
    else:
        raise ValueError(f"Instructions are empty for agent {agent_id}")
        # chat_ctx.append(
        #     role="system",
        #     text="You are a helpful AI assistant."
        # )

    # Ensure opening line is not empty
    if agent_metadata.get('openingLine'):
        chat_ctx.append(
            role="assistant",
            text=agent_metadata['openingLine']
        )
    else:
        print(f"Opening line is empty for agent {agent_id}")
        # chat_ctx.append(
        #     role="assistant",
        #     text="Hello! How can I help you today?"
        # )

    # Add null check for features
    features = agent_metadata.get('features', []) or []  # Default to empty list if None
    fnc_ctx = llm.FunctionContext()

    @llm.ai_callable(
        name="question_and_answer",
        description="The user's topic of question that needs to be answered i.e products/services, company, team etc.",
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
            print(f"\n\nquestion_and_answer func triggered with question: {question}")
            agent_metadata: Dict = await get_agent_metadata(agent_id)
            user_id: str = agent_metadata['userId']
            data_source: str = agent_metadata.get('dataSource', '{}')  # Default to empty JSON if not found
            print("data_source from get_agent_metadata:", data_source)

            # Handle empty or invalid data_source
            if not data_source or data_source.strip() == '':
                data_source = '{}'  # Default empty JSON object
                
            try:
                data_source: Dict = json.loads(data_source)
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON in data_source, using empty dict instead")
                data_source = {}

            # Check if data_source is "all" or has specific sources
            if isinstance(data_source, str) and data_source == "all":
                data_source = {"web": ["all"], "text_files": ["all"]}
            else:
                data_source = {
                    "web": [item['title'].rstrip('/') for item in data_source if item['data_type'] == 'web'],
                    "text_files": [item['id'] for item in data_source if item['data_type'] != 'web' and item['data_type']],
                }

            results = await similarity_search(question, data_source=data_source, user_id=user_id)

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

            rag_prompt = f"""   
            # Consider the user's query in line with your system instructions and your goal.
            ## User Query: {question}
            # Retrieved context
            ## {agent_metadata['company_name']} Information: {results}
            """

            chat_ctx = llm.ChatContext()
            chat_ctx.append(
                role="user",
                text=rag_prompt
            )

            # Create LLM instance and get response
            # llm_instance = openai.LLM(model="gpt-4o")

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
        description="""Call this function BEFORE asking for any personal information. 
        DO NOT ask for personal information directly in your messages.
        This function will handle the entire data collection process automatically.
        IMPORTANT: After calling this function, wait for user's response without asking for information again.""",
        auto_retry=False
    )
    async def request_personal_data(
        message: Annotated[
            str,
            llm.TypeInfo(
                description="Message explaining why you need their details (e.g., 'To help you with your £15k website project, we'll need your contact information')"
            )
        ]
    ) -> AsyncGenerator[str, None]:
        logger.info(f"Personal data request triggered with message: {message}")
        print(f"Personal data request triggered with message: {message}")
        
        yield message

        print(f"triggering show_chat_input in request_personal_data for room_name: {room_name}")
        await trigger_show_chat_input(room_name, room_name, room_name)

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
    messages: List[ChatMessage] = field(default_factory=list)
    llm_instance: Any = None
    chat_ctx: Any = None
    fnc_ctx: Any = None
    
    def add_message(self, role: str, content: str, name: str = None):
        message = ChatMessage(
            role=role,
            content=content,
            name=name
        )
        self.messages.append(message)
        if self.chat_ctx:
            self.chat_ctx.messages.append(message)
      
    def get_messages(self) -> List[ChatMessage]:
        return self.messages

# Global chat history store
chat_histories: Dict[str, Dict[str, ChatHistory]] = {}  # nested dict for agent_id -> room_name -> history


async def lk_chat_process(message: str, agent_id: str, room_name: str):
    # print(f"lk_chat_process called with message: {message}, agent_id: {agent_id}, room_name: {room_name}")
    current_assistant_message = ""
    chunk_count = 0
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
        
        # Add the new message directly through chat_history
        chat_history.add_message("user", message)

        logger.info("Starting LLM response stream")
        response_stream = llm_instance.chat(
            chat_ctx=chat_ctx,
            fnc_ctx=fnc_ctx
        )

        async for chunk in response_stream:
            chunk_count += 1
            try:
                logger.debug(f"Processing LLM chunk #{chunk_count}")
                
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    if content:
                        logger.debug(f"Content chunk: {content[:50]}...")  # First 50 chars
                        current_assistant_message += content
                        yield content
                elif chunk.choices[0].delta.tool_calls:
                    logger.info("Tool call detected")
                    if current_assistant_message:
                        chat_history.add_message("assistant", current_assistant_message)
                        current_assistant_message = ""
                    
                    # Log tool execution
                    for tool_call in chunk.choices[0].delta.tool_calls:
                        logger.info(f"Executing tool: {tool_call}")
                        called_function = tool_call.execute()
                        result = await called_function.task
                        
                        if isinstance(result, str):
                            logger.debug(f"Tool returned string result: {result[:50]}...")
                            yield result
                            chat_history.add_message("function", result, name="unknown")
                        else:
                            tool_response = ""
                            async for result_chunk in result:
                                tool_response += result_chunk
                                yield result_chunk
                            logger.debug(f"Tool returned streaming result: {tool_response[:50]}...")
                            chat_history.add_message("function", tool_response, name="unknown")

            except Exception as chunk_error:
                logger.error(f"Error processing chunk #{chunk_count}: {str(chunk_error)}", exc_info=True)
                yield f"[Error processing chunk: {str(chunk_error)}]"

        logger.info(f"Stream completed. Total chunks: {chunk_count}")
        
        # Ensure the final message is added to history
        if current_assistant_message:
            logger.info(f"Adding final message to history: {current_assistant_message[:50]}...")
            chat_history.add_message("assistant", current_assistant_message)

    except Exception as e:
        logger.error(f"Error in lk_chat_process: {str(e)}", exc_info=True)
        if current_assistant_message:
            chat_history.add_message("assistant", current_assistant_message + " [Message interrupted due to error]")
        # Re-raise with more context
        raise Exception(f"Failed to process chat message: {str(e)}")
