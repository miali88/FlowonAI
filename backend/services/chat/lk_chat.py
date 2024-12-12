import asyncio
import json
from typing import Dict, Annotated, AsyncGenerator
from dataclasses import dataclass, field
from typing import List, Optional, Union
import pickle
from pathlib import Path

from livekit.agents import llm
from livekit.plugins import openai, anthropic
from livekit.agents.llm import USE_DOCSTRING

from services.cache import get_agent_metadata
from services.chat.chat import similarity_search
from services.voice.tool_use import AgentFunctions
from services.voice.livekit_services import get_agent
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
        print("\n\n Processing Q&A tool")
        logger.info(f"Processing Q&A for question: {question}")
        room_name = "agent_1bf662cf-4d01-4c82-b919-8534ad071380_room_visitor_02c0f9d7-0343-4a18-9800-d74ae75df057"

        agent_id = room_name.split('_')[1]  # Extract agent_id from room name
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
            results = await similarity_search(question, data_source=data_source, user_id=user_id)
          
        else:
            data_source = {"web": ["all"], "text_files": ["all"]}
            results = await similarity_search(question, data_source=data_source, user_id=user_id)

        rag_prompt = f"""
        Based on the following information, please provide a comprehensive and accurate answer to the user's question.
        
        ## User Query: {question}
        ## Retrieved Information: {results}
        """

        chat_ctx = llm.ChatContext()
        chat_ctx.append(
            role="user",
            text=rag_prompt
        )

        # Create LLM instance and get response
        llm_instance = openai.LLM(model="gpt-4o")
        response_stream = llm_instance.chat(chat_ctx=chat_ctx)
        
        # Stream the response chunks directly instead of accumulating
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
        # Get the room_name from the current AgentFunctions instance
        room_name = AgentFunctions.current_room_name
        logger.info(f"Room name: {room_name}")
        
        if not room_name:
            logger.error("Room name is None or empty")
            return "I apologize, but I couldn't access the calendar system. Please try again later."
            
        agent_id = room_name.split('_')[1]  # Extract agent_id from room name
        logger.info(f"Agent ID: {agent_id}")
        
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
    return "Form presented to user. Waiting for user to complete and submit form."

@dataclass
class ChatHistory:
    messages: List[Dict[str, str]] = field(default_factory=list)
    
    def add_message(self, role: str, content: str):
        self.messages.append({"role": role, "text": content})
    
    def get_messages(self) -> List[Dict[str, str]]:
        return self.messages

# Global chat history store
chat_histories: Dict[str, ChatHistory] = {}

async def lk_chat_process(message: str, agent_id: str):
    try:
        # Initialize or get existing chat history
        if agent_id not in chat_histories:
            chat_histories[agent_id] = ChatHistory()
        
        chat_history = chat_histories[agent_id]
        
        # Fetch agent configuration

        agent_metadata = await get_agent_metadata(agent_id)
        print(f"agent_metadata: {agent_metadata['agentName']}")
        if not agent_metadata:
            raise ValueError(f"Agent {agent_id} not found")

        features = agent_metadata.get('features', [])
        fnc_ctx = llm.FunctionContext()
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

        # Create chat context with history
        chat_ctx = llm.ChatContext()
        chat_ctx.append(
            role="system",
            text=agent_metadata['instructions']
        )
        
        # Add historical messages
        for hist_message in chat_history.get_messages():
            chat_ctx.append(**hist_message)
        
        # Add current message
        chat_ctx.append(
            role="user",
            text=message
        )
        chat_history.add_message("user", message)
        
        # Get streaming response using agent-specific configuration
        llm_instance = openai.LLM(
            model="gpt-4o",
        )
        
        response_stream = llm_instance.chat(
            chat_ctx=chat_ctx,
            fnc_ctx=fnc_ctx
        )
        
        accumulated_response = ""
        async for chunk in response_stream:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                accumulated_response += content
                yield content
            elif chunk.choices[0].delta.tool_calls:
                for tool_call in chunk.choices[0].delta.tool_calls:
                    called_function = tool_call.execute()
                    result = await called_function.task
                    
                    # Handle both string and generator responses
                    if isinstance(result, str):
                        tool_response = result
                        yield tool_response
                    else:
                        tool_response = ""
                        async for result_chunk in result:
                            tool_response += result_chunk
                            yield result_chunk
                            
                    # Add tool response to history
                    chat_history.add_message(
                        "function", 
                        tool_response,
                        name=tool_call.name
                    )

        # Add assistant's response to history
        if accumulated_response:
            chat_history.add_message("assistant", accumulated_response)

    except Exception as e:
        logger.error(f"Error in lk_chat_process: {str(e)}", exc_info=True)
        raise Exception("Failed to process chat message")
