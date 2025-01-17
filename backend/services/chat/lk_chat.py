import json
from typing import Dict, Annotated, AsyncGenerator, Any, TypedDict, Union, Set, Literal, Optional, Tuple
from dataclasses import dataclass, field
from typing import List, Optional
from pathlib import Path
from uuid import uuid4
from datetime import datetime

from livekit.agents import llm
from livekit.plugins import openai
from livekit.agents.llm.chat_context import ChatMessage

from services.cache import get_agent_metadata
from services.chat.chat import similarity_search
from services.composio import get_calendar_slots
from services.db.supabase_services import supabase_client
from services.voice.tool_use import trigger_show_chat_input

import logging
logger = logging.getLogger(__name__)


@dataclass
class ChatScenario:
    name: str
    description: str
    messages: List[dict]
    expected_function_calls: List[str] = field(default_factory=list)
    actual_function_calls: List[str] = field(default_factory=list)


class ChatTester:
    def __init__(self, scenarios_dir: str = "chat_scenarios"):
        self.scenarios_dir = Path(scenarios_dir)
        self.scenarios_dir.mkdir(exist_ok=True)
        self.current_scenario = None

    def save_scenario(self, scenario: ChatScenario):
        scenario_dict = {
            "name": scenario.name,
            "description": scenario.description,
            "messages": scenario.messages,
            "expected_function_calls": scenario.expected_function_calls,
            "actual_function_calls": scenario.actual_function_calls
        }
        with open(self.scenarios_dir / f"{scenario.name}.json", "w") as f:
            json.dump(scenario_dict, f)

    def load_scenario(self, name: str) -> Optional[ChatScenario]:
        try:
            with open(self.scenarios_dir / f"{name}.json", "r") as f:
                data = json.load(f)
                return ChatScenario(
                    name=data["name"],
                    description=data["description"],
                    messages=data["messages"],
                    expected_function_calls=data["expected_function_calls"],
                    actual_function_calls=data["actual_function_calls"]
                )
        except FileNotFoundError:
            return None


class DataSource:
    id: int
    title: str
    data_type: str


class ChatInitializer:
    def __init__(self, agent_id: str, room_name: str):
        self.agent_id = agent_id
        self.room_name = room_name
        self.llm_instance: Optional[openai.LLM] = None
        self.chat_ctx: Optional[llm.ChatContext] = None
        self.fnc_ctx: Optional[llm.FunctionContext] = None
        self.agent_metadata: Optional[Dict[str, Any]] = None

    async def initialize(self) -> Tuple[openai.LLM, llm.ChatContext, llm.FunctionContext]:
        chat_histories[self.agent_id][self.room_name] = ChatHistory()
        self.llm_instance = openai.LLM(model="gpt-4o")
        await self._setup_agent_metadata()
        await self._setup_contexts()
        self._register_functions()
        return self.llm_instance, self.chat_ctx, self.fnc_ctx

    async def _setup_agent_metadata(self) -> None:
        self.agent_metadata = await get_agent_metadata(self.agent_id)
        if not self.agent_metadata:
            raise ValueError(f"Agent {self.agent_id} not found")
        print(f"agent_metadata: {self.agent_metadata['agentName']}")

    async def _setup_contexts(self) -> None:
        self.chat_ctx = llm.ChatContext()
        self.fnc_ctx = llm.FunctionContext()

        # Setup system instructions
        if self.agent_metadata.get('instructions'):
            self.chat_ctx.append(
                role="system",
                text=self.agent_metadata['instructions']
            )
        else:
            raise ValueError(f"Instructions are empty for agent {self.agent_id}")

        # Setup opening line
        if self.agent_metadata.get('openingLine'):
            self.chat_ctx.append(
                role="assistant",
                text=self.agent_metadata['openingLine']
            )
        else:
            print(f"Opening line is empty for agent {self.agent_id}")

    def _register_functions(self) -> None:
        if not self.fnc_ctx:
            raise ValueError("Function context not initialized")
            
        # Register base Q&A function
        self.fnc_ctx._register_ai_function(self._question_and_answer)
        print("Registered Q&A function")
        logger.info("Registered Q&A function")

        # Register optional functions based on features
        if not self.agent_metadata:
            raise ValueError("Agent metadata not initialized")
            
        features = self.agent_metadata.get('features', []) or []

        if 'lead_gen' in features:
            self.fnc_ctx._register_ai_function(self._request_personal_data)
            print("Registered lead generation function")
            logger.info("Registered lead generation function")

        if 'app_booking' in features:
            self.fnc_ctx._register_ai_function(self._fetch_calendar)
            print("Registered calendar function")
            logger.info("Registered calendar function")

    @llm.ai_callable(
        name="question_and_answer",
        description=(
            "The user's topic of question that needs to be answered i.e "
            "products/services, company, team etc."
        ),
        auto_retry=True
    )
    async def _question_and_answer(
        self, 
        question: Annotated[
            str, llm.TypeInfo(
                description="The user's point or query to perform RAG search on"
            )
        ],
    ) -> AsyncGenerator[str, None]:
        """
        Perform RAG search on each user point or query.
        Returns relevant information found in the knowledge base.
        
        Args:
            question: The user's query to search for
        """
        try:
            print(f"\n\nquestion_and_answer func triggered with question: {question}")
            agent_metadata = await get_agent_metadata(self.agent_id)
            if not agent_metadata:
                raise ValueError("Failed to get agent metadata")
                
            user_id: str = agent_metadata['userId']  
            data_source_str: str = agent_metadata.get('dataSource', '{}')
            
            # First handle the data source parsing
            data_source_dict: Dict[str, Any] = {}
            if isinstance(data_source_str, str):
                try:
                    data_source_dict = json.loads(data_source_str)
                except json.JSONDecodeError:
                    logger.warning("Invalid JSON in data_source, using empty dict")

            # Now handle the "all" case and data source processing
            if isinstance(data_source_dict, dict):
                if data_source_dict == "all":
                    search_params = {"web": ["all"], "text_files": ["all"]}
                else:
                    web_urls = []
                    text_files = []
                    
                    # Safely process items if they're in a list
                    items = data_source_dict if isinstance(data_source_dict, list) else []
                    for item in items:
                        if not isinstance(item, dict):
                            continue
                            
                        data_type = item.get('data_type')
                        if data_type == 'web':
                            title = str(item.get('title', '')).rstrip('/')
                            if title:
                                web_urls.append(title)
                        elif data_type:  # Only add if data_type exists and isn't web
                            item_id = str(item.get('id', ''))
                            if item_id:
                                text_files.append(item_id)
                    
                    search_params = {
                        "web": web_urls,
                        "text_files": text_files
                    }
            else:
                search_params = {"web": [], "text_files": []}

            # Use the properly structured search params
            results = await similarity_search(
                question,
                data_source=search_params,
                user_id=user_id
            )

            # Store RAG results immediately in chat history
            print("\n=== Storing RAG Results in question_and_answer ===")

            response_id = str(uuid4())
            print(f"response_id in question_and_answer : {response_id}")
            # print(f"RAG Results: {results_with_urls}")

            # Get the chat history for this room
            chat_history = None
            if self.agent_id in chat_histories:
                agent_histories = chat_histories[self.agent_id]
                if self.room_name in agent_histories:
                    chat_history = agent_histories[self.room_name]
            
            if chat_history is not None and results:
                chat_history.add_rag_results(response_id, results)

            # Yield the RAG results marker for downstream processing
            yield "[RAG_RESULTS]: "
            yield json.dumps({"response_id": response_id})

            company_name = self.agent_metadata.get('company_name', 'Company') if self.agent_metadata else 'Company'
            show_sources = self.agent_metadata.get('showSourcesInChat', False) if self.agent_metadata else False

            # Rest of the code using company_name and show_sources
            rag_prompt = f"""
            # User's query
            ## User Query: {question}
            # Retrieved context
            ## {company_name} Information: {results}
            """

            # Add instructions only if showSourcesInChat is False
            if not show_sources:
                rag_prompt += """
                ## Instructions
                - Respond as a representative of {self.agent_metadata['company_name']},
                 like "we" or "our"
                - Show interest in the user's business
                - Use markdown, bullet points, and line breaks to make the
                 response more readable
                """

            # Use existing chat context from chat history
            if self.agent_id in chat_histories and self.room_name in chat_histories[
                self.agent_id
            ]:
                chat_ctx = chat_histories[self.agent_id][self.room_name].chat_ctx
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

            if not self.llm_instance:
                raise ValueError("LLM instance not initialized")

            response_stream = self.llm_instance.chat(
                chat_ctx=chat_ctx,
            )

            # Then yield the actual response chunks
            async for chunk in response_stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            logger.error(f"Error in question_and_answer: {str(e)}", exc_info=True)
            yield (
                "I apologize, but I encountered an error while searching "
                "for an answer to your question."
            )

    """ CALENDAR MANAGEMENT """
    @llm.ai_callable(
        name="fetch_calendar",
        description=(
            "Fetch available calendar slots for booking appointments or meetings"
        ),
        auto_retry=True
    )
    async def _fetch_calendar(
        self, date_range: Annotated[
            str, llm.TypeInfo(
                description="The date range to search for available slots"
            )
        ]
    ) -> str:
        """
        Fetches available calendar slots based on the specified date range
         and appointment type.
        Returns formatted information about available time slots.
        """
        logger.info(f"Fetching calendar slots for date range: {date_range}")

        try:
            print("\n\nfetch calendar func triggered")

            agent_metadata_result = await get_agent_metadata(self.agent_id)
            logger.info(f"Retrieved agent metadata: {bool(agent_metadata_result)}")

            if not agent_metadata_result:
                logger.error("Agent metadata is None or empty")
                return (
                    "I apologize, but I couldn't access the agent information. "
                    "Please try again later."
                )
                
            # Now we know agent_metadata_result is not None
            agent_metadata: Dict[str, Any] = agent_metadata_result
            user_id: str = agent_metadata['userId']
            logger.info(f"User ID: {user_id}")

            print("have user_id, now fetching calendar slots")
            try:
                free_slots = await get_calendar_slots(user_id, "googlecalendar")
                logger.info(f"Calendar slots retrieved: {free_slots}")
                print(f"free_slots: {free_slots}")
                return f"Available slots found: {free_slots}"
            except Exception as calendar_error:
                logger.error(
                    f"Error fetching calendar slots: {str(calendar_error)}",
                    exc_info=True
                )
                return (
                    "I apologize, but I encountered an error while "
                    "fetching calendar slots. "
                    "Please try again later."
                )
        except Exception as e:
            logger.error(f"Error in fetch_calendar: {str(e)}", exc_info=True)
            return (
                "I apologize, but I encountered an error while checking the calendar "
                "availability."
            )

    @llm.ai_callable(
        name="request_personal_data",
        description=(
            "Call this function BEFORE asking for any personal information. "
            "DO NOT ask for personal information directly in your messages. "
            "This function will handle the entire data collection process automatically. "
            "IMPORTANT: After calling this function, wait for user's response without asking for information again."
        ),
        auto_retry=False
    )
    async def _request_personal_data(
        self, message: Annotated[
            str, llm.TypeInfo(
                description="Message explaining why you need their details (e.g., 'To help you with your £15k website project, we'll need your contact information')"
            )
        ]
    ) -> AsyncGenerator[str, None]:
        logger.info(f"Personal data request triggered with message: {message}")
        print(f"Personal data request triggered with message: {message}")

        yield message

        print(
            f"triggering show_chat_input in request_personal_data for room_name: "
            f"{self.room_name}"
        )
        await trigger_show_chat_input(self.room_name, self.room_name, self.room_name)


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

    def add_message(
        self,
        role: str,
        content: str,
        name: Optional[str] = None,
        response_id: Optional[str] = None
    ) -> None:
        # Validate role before creating message
        if role not in ('system', 'user', 'assistant', 'tool'):
            raise ValueError(f"Invalid role: {role}")
            
        message = ChatMessage(
            role=role,  # Now guaranteed to be a valid role
            content=content,
            name=name
        )
        self.messages.append(message)
        if self.chat_ctx:
            self.chat_ctx.messages.append(message)

        # Store metadata if this is an assistant message
        if role == "assistant" and response_id is not None:
            self.response_metadata[response_id] = ResponseMetadata(
                response_id=response_id
            )

    def add_rag_results(self, response_id: str, rag_results: List[dict]) -> None:
        """
        Add RAG results to the response metadata,
         creating the entry if it doesn't exist.
        """
        if not response_id:
            logger.error("Attempted to add RAG results with empty response_id")
            return

        print("\n=== Adding RAG Results ===")
        print(f"Response ID: {response_id}")
        # print(f"Current metadata state: {self.response_metadata}")

        # Create or update ResponseMetadata
        if response_id not in self.response_metadata:
            print(f"Creating new ResponseMetadata for {response_id}")
            self.response_metadata[response_id] = ResponseMetadata(
                response_id=response_id
            )

        # Add the RAG results
        self.response_metadata[response_id].rag_results = rag_results

        # Verify storage
        # print(f"Updated metadata state: {self.response_metadata}")
        # print(f"Stored RAG results for {response_id}: {rag_results}")


# Global chat history store / nested dict for agent_id -> room_name -> history
chat_histories: Dict[str, Dict[str, ChatHistory]] = {}


async def get_chat_rag_results(
    agent_id: str,
    room_name: str,
    response_id: str
) -> List[dict]:

    """
    Retrieve RAG results for a specific chat response.
    Returns a list of dictionaries containing unique source_urls.
    """
    # Add debug logging
    print("\n=== Debug Chat Histories ===")
    print(f"Looking for agent_id: {agent_id}")
    print(f"Looking for room_name: {room_name}")
    print(f"Looking for response_id: {response_id}")
    print(f"Available agent_ids: {list(chat_histories.keys())}")

    # Check if agent exists
    if agent_id in chat_histories:
        print(f"Found agent. Available rooms: {list(chat_histories[agent_id].keys())}")

        if room_name in chat_histories[agent_id]:
            chat_history = chat_histories[agent_id][room_name]
            print(
                f"Found room. Available response_ids: "
                f"{list(chat_history.response_metadata.keys())}"
            )

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


async def lk_chat_process(
    message: str,
    agent_id: str,
    room_name: str
) -> AsyncGenerator[str, None]:
    print(
        f"lk_chat_process called with message: {message}, agent_id: {agent_id}, "
        f"room_name: {room_name}"
    )

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
            chat_initializer = ChatInitializer(agent_id, room_name)
            llm_instance, chat_ctx, fnc_ctx = await chat_initializer.initialize()
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
        chat_history.response_metadata[response_id] = ResponseMetadata(
            response_id=response_id
        )
        print(f"Created new response entry with ID: {response_id}")

        async for chunk in response_stream:
            chunk_count += 1
            try:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    if content:
                        current_assistant_message += content
                        yield content

                elif chunk.choices[0].delta.tool_calls:
                    for tool_call in chunk.choices[0].delta.tool_calls:
                        called_function = tool_call.execute()
                        result = await called_function.task

                        if isinstance(result, str):
                            if result.startswith("[RAG_RESULTS]:"):
                                # RAG results are now stored in question_and_answer
                                # Just skip the RAG marker here
                                continue

                            yield result
                            chat_history.add_message(
                                "function",
                                result,
                                name="tool_response"
                            )

                        else:
                            tool_response = ""
                            async for result_chunk in result:
                                tool_response += result_chunk
                                yield result_chunk
                            chat_history.add_message(
                                "tool",
                                tool_response,
                                name="tool_response"
                            )

            except Exception as chunk_error:
                logger.error(
                    f"Error processing chunk #{chunk_count}: {str(chunk_error)}",
                    exc_info=True
                )
                yield f"[Error processing chunk: {str(chunk_error)}]"

        # Save the final message
        if current_assistant_message:
            chat_history.add_message(
                "assistant",
                current_assistant_message,
                response_id=response_id
            )

    except Exception as e:
        logger.error(f"Error in lk_chat_process: {str(e)}", exc_info=True)
        if current_assistant_message:
            chat_history.add_message(
                "assistant",
                current_assistant_message + " [Message interrupted due to error]",
                response_id=response_id
            )
        raise Exception(f"Failed to process chat message: {str(e)}")

# Add near other global variables
supabase = supabase_client()


async def save_chat_history_to_supabase(agent_id: str, room_name: str) -> None:
    """
    Save the chat history to Supabase conversation_logs table when a chat session ends.
    """
    try:
        if agent_id not in chat_histories or room_name not in chat_histories[agent_id]:
            logger.warning(
                f"No chat history found for agent_id: {agent_id}, "
                f"room_name: {room_name}"
            )
            return

        chat_history = chat_histories[agent_id][room_name]

        # Format messages for storage
        formatted_transcript = []
        for msg in chat_history.messages:
            formatted_transcript.append({
                "role": msg.role,
                "content": msg.content,
                "name": msg.name if hasattr(msg, 'name') else None,
                "timestamp": datetime.now().isoformat()
                # Add timestamp for each message
            })
        agent_metadata_result = await get_agent_metadata(agent_id)
        if not agent_metadata_result:
            raise ValueError("Failed to get agent metadata")
            
        # Now we know agent_metadata_result is not None
        agent_metadata: Dict[str, Any] = agent_metadata_result
        user_id: str = agent_metadata['userId']

        # Prepare data for Supabase
        conversation_data = {
            "transcript": formatted_transcript,
            "job_id": room_name,  # Using room_name as job_id
            "participant_identity": room_name,
            # Using room_name as participant_identity
            "room_name": room_name,
            "user_id": user_id,
            "agent_id": agent_id,
            "lead": "unknown",  # Default value
            "call_duration": 0,  # Default value
            "call_type": "text-chat"  # Specify this is a chat conversation
        }

        # Save to Supabase
        print(f"Saving chat history to Supabase for room: {room_name}")
        print(f"Number of messages: {len(formatted_transcript)}")
        response = supabase.table("conversation_logs").insert(conversation_data).execute()

        print("Successfully saved chat history to Supabase")

        # Clean up the chat history
        del chat_histories[agent_id][room_name]
        if not chat_histories[agent_id]:
            del chat_histories[agent_id]

    except Exception as e:
        logger.error(f"Error saving chat history to Supabase: {str(e)}", exc_info=True)
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
            logger.warning(
                f"Chat history not found for agent_id: {agent_id}, "
                f"room_name: {room_name}"
            )
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
            content=(
                "The user has submitted their contact information."
                "Please acknowledge receipt of "
                "their information and ask how you can help them further."
            ),
        )

        return True

    except Exception as e:
        logger.error(f"Error adding message to chat: {str(e)}", exc_info=True)
        return False
