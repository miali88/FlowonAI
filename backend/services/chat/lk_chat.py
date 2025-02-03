import json
from typing import Dict, Annotated, AsyncGenerator, Any
from dataclasses import dataclass, field
from typing import List, Optional
import pickle
from pathlib import Path
from uuid import uuid4
from datetime import datetime

from livekit.agents import llm
from livekit.plugins import openai, anthropic
from livekit.agents.llm.chat_context import ChatMessage

from services.cache import get_agent_metadata
from services.chat.chat import similarity_search
from services.voice.tool_use import trigger_show_chat_input
from services.composio import get_calendar_slots
from services.db.supabase_services import supabase_client
from services.helper import format_transcript_messages
from services.conversation import transcript_summary

import logging
import asyncio

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

    # Initialize the LLM instance first
    llm_instance = openai.LLM(
        model="gpt-4o",
    )

    # Store the llm_instance in chat history immediately
    chat_histories[agent_id][room_name].llm_instance = llm_instance

    # Fetch agent configuration
    agent_metadata = await get_agent_metadata(agent_id)
    print(f"agent_metadata: {agent_metadata['agentName']}")
    if not agent_metadata:
        raise ValueError(f"Agent {agent_id} not found")

    # Create chat context with history
    chat_ctx = llm.ChatContext()
    chat_histories[agent_id][room_name].chat_ctx = chat_ctx  # Store chat_ctx immediately
    
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
            response_id = str(uuid4())

            print(f"response_id in question_and_answer : {response_id}")

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

            results: list[dict] = await similarity_search(question, data_source=data_source, user_id=user_id)
            # Extract source of data from the list of results
            rag_results = []
            for result in results:
                result_dict = dict(result)
                if 'url' in result:
                    result_dict['source_url'] = result['url']
                else:
                    result_dict['source_file'] = result['title']
                print(f"result_dict: {result_dict}")
                rag_results.append(result_dict)
                
            # Store RAG results immediately in chat history
            print(f"\n=== Storing RAG Results in question_and_answer ===")
            print(f"Response ID: {response_id}")
            # print(f"RAG Results: {results_with_urls}")
            
            # Get the chat history for this room
            if agent_id in chat_histories and room_name in chat_histories[agent_id]:
                chat_history = chat_histories[agent_id][room_name]
                if rag_results:   
                    chat_history.add_rag_results(response_id, rag_results)
                else:
                    chat_history.add_rag_results(response_id, rag_results)
                # print(f"Stored RAG results. Current metadata: {chat_history.response_metadata}")

            # Yield the RAG results marker for downstream processing
            yield f"[RAG_RESULTS]: "
            yield json.dumps({"response_id": response_id})

            ## TODO: each agent has a different rag_prompt. 
            rag_prompt = f"""   
            # User's query
            ## User Query: {question}
            # Retrieved context
            ## {agent_metadata['company_name']} Information: {results}
            """

            # Add instructions only if showSourcesInChat is False
            if not agent_metadata.get('showSourcesInChat', True):
                rag_prompt += """
                ## Instructions
                - Respond as a representative of {agent_metadata['company_name']}, like "we" or "our"
                - Show interest in the user's business
                - Use markdown, bullet points, and line breaks to make the response more readable
                """

            # Use existing chat context from chat history
            if agent_id in chat_histories and room_name in chat_histories[agent_id]:
                chat_ctx = chat_histories[agent_id][room_name].chat_ctx
            else:
                chat_ctx = llm.ChatContext()
            
            chat_ctx.append(
                role="user",
                text=rag_prompt
            )

            # Add debug logging to see full chat context
            print("\n=== Chat Context Before RAG Response ===")
            for msg in chat_ctx.messages:
                print(f"Role: {msg.role}")
                print(f"Content: {msg.content}")
                print("---")

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
class ResponseMetadata:
    response_id: str
    rag_results: List[dict] = field(default_factory=list)

@dataclass
class ChatHistory:
    messages: List[ChatMessage] = field(default_factory=list)
    llm_instance: Any = None
    chat_ctx: Any = None
    fnc_ctx: Any = None
    response_metadata: Dict[str, ResponseMetadata] = field(default_factory=dict)
    
    def add_message(self, role: str, content: str, name: str = None, response_id: str = None):
        message = ChatMessage(
            role=role,
            content=content,
            name=name
        )
        self.messages.append(message)
        if self.chat_ctx:
            self.chat_ctx.messages.append(message)
        
        # Store metadata if this is an assistant message
        if role == "assistant" and response_id:
            self.response_metadata[response_id] = ResponseMetadata(response_id=response_id)

    def add_rag_results(self, response_id: str, rag_results: List[dict]):
        """
        Add RAG results to the response metadata, creating the entry if it doesn't exist.
        """
        if not response_id:
            logger.error("Attempted to add RAG results with empty response_id")
            return
        
        print(f"\n=== Adding RAG Results ===")
        print(f"Response ID: {response_id}")
        # print(f"Current metadata state: {self.response_metadata}")
        
        # Create or update ResponseMetadata
        if response_id not in self.response_metadata:
            print(f"Creating new ResponseMetadata for {response_id}")
            self.response_metadata[response_id] = ResponseMetadata(response_id=response_id)
        
        # Add the RAG results
        self.response_metadata[response_id].rag_results = rag_results
        
        # Verify storage
        # print(f"Updated metadata state: {self.response_metadata}")
        # print(f"Stored RAG results for {response_id}: {rag_results}")

# Global chat history store
chat_histories: Dict[str, Dict[str, ChatHistory]] = {}  # nested dict for agent_id -> room_name -> history

async def get_chat_rag_results(agent_id: str, room_name: str, response_id: str) -> List[dict]:
    """
    Retrieve RAG results for a specific chat response.
    Returns a list of dictionaries containing unique source_urls.
    """
    # Add debug logging
    print(f"\n=== Debug Chat Histories ===")
    print(f"Looking for agent_id: {agent_id}")
    print(f"Looking for room_name: {room_name}")
    print(f"Looking for response_id: {response_id}")
    print(f"Available agent_ids: {list(chat_histories.keys())}")
    
    # Check if agent exists
    if agent_id in chat_histories:
        print(f"Found agent. Available rooms: {list(chat_histories[agent_id].keys())}")
        
        if room_name in chat_histories[agent_id]:
            chat_history = chat_histories[agent_id][room_name]
            print(f"Found room. Available response_ids: {list(chat_history.response_metadata.keys())}")
            # print(f"Response metadata: {chat_history.response_metadata}")
    
    # Original validation
    if agent_id not in chat_histories or room_name not in chat_histories[agent_id]:
        raise ValueError("Chat history not found")
    
    chat_history = chat_histories[agent_id][room_name]
    
    if response_id not in chat_history.response_metadata:
        raise ValueError("Response ID not found")
    
    # Get original RAG results and extract unique sources (either URLs or files)
    unique_sources = {
        result.get('source_url') or result.get('source_file') 
        for result in chat_history.response_metadata[response_id].rag_results 
        if (result.get('source_url') or result.get('source_file'))
    }
    
    # Return list of dictionaries with source information
    return [
        {"source_url": source} if "http" in str(source) else {"source_file": source} 
        for source in unique_sources
    ]


async def lk_chat_process(message: str, agent_id: str, room_name: str):
    print(f"lk_chat_process called with message: {message}, agent_id: {agent_id}, room_name: {room_name}")
    current_assistant_message = ""
    chunk_count = 0
    response_id = str(uuid4())
    print(f"response_id in lk_chat_process : {response_id}")

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

        # First yield the response_id separately
        yield json.dumps({"type": "response_id", "response_id": response_id})
        
        # Create the response metadata entry immediately
        chat_history.response_metadata[response_id] = ResponseMetadata(response_id=response_id)
        print(f"Created new response entry with ID: {response_id}")

        async for chunk in response_stream:
            chunk_count += 1
            try:
                # Add defensive checks
                if not hasattr(chunk, 'choices') or not chunk.choices:
                    logger.warning(f"Received chunk without choices: {chunk}")
                    continue
                    
                choice = chunk.choices[0]
                if not hasattr(choice, 'delta'):
                    logger.warning(f"Choice missing delta attribute: {choice}")
                    continue

                if hasattr(choice.delta, 'content') and choice.delta.content:
                    content = choice.delta.content
                    if content:
                        current_assistant_message += content
                        yield content

                elif hasattr(choice.delta, 'tool_calls') and choice.delta.tool_calls:
                    for tool_call in choice.delta.tool_calls:
                        called_function = tool_call.execute()
                        result = await called_function.task
                        
                        if isinstance(result, str):
                            if result.startswith("[RAG_RESULTS]:"):
                                continue
                            
                            yield result
                            chat_history.add_message("function", result, name="tool_response")
                        else:
                            tool_response = ""
                            async for result_chunk in result:
                                tool_response += result_chunk
                                yield result_chunk
                            chat_history.add_message("function", tool_response, name="tool_response")

            except Exception as chunk_error:
                logger.error(f"Error processing chunk #{chunk_count}: {str(chunk_error)}", exc_info=True)
                logger.error(f"Problematic chunk: {chunk}")  # Add this for debugging
                yield f"[Error processing chunk: {str(chunk_error)}]"

        # Save the final message
        if current_assistant_message:
            chat_history.add_message("assistant", current_assistant_message, response_id=response_id)

    except Exception as e:
        logger.error(f"Error in lk_chat_process: {str(e)}", exc_info=True)
        if current_assistant_message:
            chat_history.add_message("assistant", current_assistant_message + " [Message interrupted due to error]", response_id=response_id)
        raise Exception(f"Failed to process chat message: {str(e)}")

# Add near other global variables
supabase = supabase_client()

async def save_chat_history_to_supabase(agent_id: str, room_name: str) -> None:
    """
    Save the chat history to Supabase conversation_logs table when a chat session ends.
    """
    print(f"save_chat_history_to_supabase called with agent_id: {agent_id}, room_name: {room_name}")
    try:
        if agent_id not in chat_histories or room_name not in chat_histories[agent_id]:
            logger.warning(f"No chat history found for agent_id: {agent_id}, room_name: {room_name}")
            return

        chat_history = chat_histories[agent_id][room_name]
        
        # Use the helper function to format the transcript
        formatted_transcript = format_transcript_messages(chat_history.messages)

        # Check if there are actual messages to save
        if not formatted_transcript:
            logger.warning(f"No messages to save for room: {room_name}")
            return

        # Get agent metadata for user_id
        agent_metadata = await get_agent_metadata(agent_id)
        user_id = agent_metadata['userId']

        # Prepare data for Supabase
        conversation_data = {
            "transcript": formatted_transcript,
            "job_id": room_name,
            "participant_identity": room_name,
            "room_name": room_name,
            "user_id": user_id,
            "agent_id": agent_id,
            "lead": "unknown",
            "call_duration": 0,
            "call_type": "text-chat"
        }

        # Save to Supabase and wait for completion
        print(f"Saving chat history to Supabase for room: {room_name}")
        print(f"Number of messages: {len(formatted_transcript)}")
        
        response = supabase.table("conversation_logs").insert(conversation_data).execute()
        print(f"Successfully saved chat history to Supabase")
        
        # Add error handling for empty transcripts
        if not formatted_transcript or len(formatted_transcript) < 2:
            logger.warning("Transcript too short or empty - skipping summary")
            return
            
        try:
            # Create a background task for the summary
            async def generate_summary_background():
                try:
                    summary = await transcript_summary(str(formatted_transcript), room_name)
                    if summary:
                        logger.info(f"Summary generated successfully in background: {summary[:100]}...")
                except Exception as e:
                    logger.error(f"Background summary generation failed: {str(e)}", exc_info=True)

            # Launch the summary generation in the background
            asyncio.create_task(generate_summary_background())
            
            # Continue with cleanup immediately
            print("deleting chat history", room_name)
            del chat_histories[agent_id][room_name]
            if not chat_histories[agent_id]:
                del chat_histories[agent_id]
            
        except Exception as e:
            logger.error(f"Error saving chat history: {str(e)}", exc_info=True)

    except Exception as e:
        logger.error(f"Error saving chat history: {str(e)}", exc_info=True)
        print(f"Error saving chat history: {str(e)}")

async def form_data_to_chat(
    room_name: str, 
    content: dict, 
) -> bool:
    try:
        # Extract agent_id from room_name and remove "agent_" prefix
        agent_id = room_name.split("_room_visitor_")[0].replace("agent_", "")
        if not agent_id:
            logger.warning(f"Could not extract agent_id from room_name: {room_name}")
            return False
            
        # Check if chat history exists
        if agent_id not in chat_histories or room_name not in chat_histories[agent_id]:
            logger.warning(f"Chat history not found for agent_id: {agent_id}, room_name: {room_name}")
            return False
            
        # Filter out metadata fields from content
        metadata = ["user_id", "room_name", "participant_identity"]
        filtered_content = {k: v for k, v in content.items() if k not in metadata}

        # Format the form data as a readable string
        formatted_content = "Form submitted with the following information:\n" + \
            "\n".join([f"{k}: {v}" for k, v in filtered_content.items()])
            
        chat_history = chat_histories[agent_id][room_name]
        print("adding message to chat history:", formatted_content)
        
        # Add the formatted string message
        chat_history.add_message(
            role="user",
            content=formatted_content,
            name="form_data",
        )

        # Add a system message to guide the AI's response
        chat_history.add_message(
            role="system",
            content="The user has submitted their contact information. Please acknowledge receipt of their information and ask how you can help them further.",
        )
        
        return True
        
    except Exception as e:
        logger.error(f"Error adding message to chat: {str(e)}", exc_info=True)
        return False