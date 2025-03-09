import json
from typing import Dict, Annotated, AsyncGenerator, Any
from dataclasses import dataclass, field, asdict
from typing import List, Optional
import pickle
from pathlib import Path
from uuid import uuid4
from datetime import datetime, timedelta
import os 
from dotenv import load_dotenv
import logging
import asyncio
import httpx

from livekit.agents import llm
from livekit.plugins import openai
from livekit.agents.llm.chat_context import ChatMessage

from app.services.cache import get_agent_metadata
from app.services.chat.chat import similarity_search
from app.services.voice.tool_use import trigger_show_chat_input
from app.clients.supabase_client import get_supabase
from app.services.helper import format_transcript_messages
from app.services.conversation import transcript_summary
from app.services.redis_service import RedisChatStorage

load_dotenv()

os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")

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


async def init_new_chat(agent_id: str, room_name: str):
    # Initialize new ChatHistory
    chat_history = ChatHistory()
    
    # Initialize the LLM instance
    llm_instance = openai.LLM(
        model="gpt-4o",
    )
    chat_history.llm_instance = llm_instance

    # Check for existing chat history in Redis
    existing_chat = await RedisChatStorage.get_chat(agent_id, room_name)
    
    # Fetch agent configuration
    agent_metadata = await get_agent_metadata(agent_id)
    if not agent_metadata:
        raise ValueError(f"Agent {agent_id} not found")

    # Create chat context with history
    chat_ctx = llm.ChatContext()
    chat_history.chat_ctx = chat_ctx
    
    # Add system instructions
    if agent_metadata.get('instructions'):
        chat_ctx.append(
            role="system",
            text=agent_metadata['instructions']
        )
    else:
        raise ValueError(f"Instructions are empty for agent {agent_id}")

    # If we have existing chat history, reconstruct it
    if existing_chat and existing_chat.get("messages"):
        # Add all existing messages to the context
        for msg in existing_chat["messages"]:
            chat_ctx.append(
                role=msg["role"],
                text=msg["content"]
            )
            chat_history.add_message(
                role=msg["role"],
                content=msg["content"],
                name=msg.get("name"),
                response_id=msg.get("response_id")
            )
        
        # Restore response metadata if it exists
        if "response_metadata" in existing_chat:
            for response_id, metadata in existing_chat["response_metadata"].items():
                chat_history.response_metadata[response_id] = ResponseMetadata(
                    response_id=metadata['response_id'],
                    rag_results=metadata.get('rag_results', [])
                )
    else:
        # Only add opening line for new chats
        if agent_metadata.get('openingLine'):
            chat_ctx.append(
                role="assistant",
                text=agent_metadata['openingLine']
            )
            chat_history.add_message(
                role="assistant",
                content=agent_metadata['openingLine']
            )

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
            data_source: str = agent_metadata.get('dataSource', '{}')
            print("data_source from get_agent_metadata:", data_source)
            response_id = str(uuid4())

            print(f"response_id in question_and_answer : {response_id}")

            # Handle empty or invalid data_source
            if not data_source or data_source.strip() == '':
                data_source = '{}'
                
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
            
            # Get the chat history from Redis
            chat_data = await RedisChatStorage.get_chat(agent_id, room_name)
            if chat_data:
                # Update the response metadata
                if "response_metadata" not in chat_data:
                    chat_data["response_metadata"] = {}
                chat_data["response_metadata"][response_id] = {
                    "response_id": response_id,
                    "rag_results": rag_results
                }
                # Save back to Redis
                await RedisChatStorage.save_chat(agent_id, room_name, chat_data)

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

            # Get chat context from Redis
            chat_data = await RedisChatStorage.get_chat(agent_id, room_name)
            if not chat_data:
                chat_ctx = llm.ChatContext()
            else:
                # Reconstruct chat context from messages
                chat_ctx = llm.ChatContext()
                for msg in chat_data.get("messages", []):
                    chat_ctx.append(
                        role=msg["role"],
                        text=msg["content"]
                    )
            
            chat_ctx.append(
                role="user",
                text=rag_prompt
            )

            # # Add debug logging to see full chat context
            # print("\n=== Chat Context Before RAG Response ===")
            # for msg in chat_ctx.messages:
            #     print(f"Role: {msg.role}")
            #     print(f"Content: {msg.content}")
            #     print("---")

            response_stream = llm_instance.chat(chat_ctx=chat_ctx)
            
            # Then yield the actual response chunks
            async for chunk in response_stream:
                if not hasattr(chunk, 'choices') or not chunk.choices:
                    logger.debug(f"Skipping empty chunk: {chunk}")
                    continue
                    
                if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            logger.error(f"Error in question_and_answer: {str(e)}", exc_info=True)
            yield "I apologize, but I encountered an error while searching for an answer to your question."


    """ CALENDAR MANAGEMENT """
    @llm.ai_callable(
        name="fetch_calendar",
        description="Schema for retrieving available calendar slots for a specific agent and property",
        auto_retry=True
    )
    async def fetch_calendar(
        agent_name: Annotated[
            str,
            llm.TypeInfo(
                description="Name of the agent whose calendar slots are being queried"
            )
        ],
        property_id: Annotated[
            str,
            llm.TypeInfo(
                description="Unique identifier for the property being scheduled"
            )
        ],
        start_date: Annotated[
            str,
            llm.TypeInfo(
                description="Start date in YYYY-MM-DD format. Defaults to current date if not provided"
            )
        ] = None,
        end_date: Annotated[
            str,
            llm.TypeInfo(
                description="End date in YYYY-MM-DD format. Defaults to 30 days from start if not provided"
            )
        ] = None,
    ) -> str:
        """
        Fetches available calendar slots based on the specified agent, property, and date range.
        Returns formatted information about available time slots.
        """
        try:
            logger.info("fetch_calendar func triggered")
            print("\n\nfetch_calendar func triggered")
            
            # Log input parameters
            logger.info(f"Parameters - agent_name: {agent_name}, property_id: {property_id}, start_date: {start_date}, end_date: {end_date}")
            
            # Use provided dates or defaults
            start_date = start_date or datetime.now().strftime('%Y-%m-%d')
            end_date = end_date or (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
            
            # Ensure end_date is after start_date
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')
            
            if end_dt <= start_dt:
                end_dt = start_dt + timedelta(days=30)
                end_date = end_dt.strftime('%Y-%m-%d')
            
            logger.info(f"Processed dates - start_date: {start_date}, end_date: {end_date}")
            
            # # Get agent metadata for agent_name
            # logger.info(f"Attempting to get agent metadata for: {agent_name}")
            # agent_metadata: Dict = await get_agent_metadata(agent_name)
            # logger.info(f"Retrieved agent metadata: {agent_metadata}")
            
            # if not agent_metadata:
            #     logger.error(f"No agent metadata found for agent_name: {agent_name}")
            #     return "I apologize, but I couldn't access the agent information. I can flag this issue to the agent for you after this call and have them get back to you."

            ### TODO: get workflow_id from agent_metadata
            workflow_id = "3483c1df-fe57-4935-a804-b0261ec39639"
            logger.info(f"Using workflow_id: {workflow_id}")

            # Construct API URL
            base_url = f"http://localhost:5678/webhook/{workflow_id}"
            url = f"{base_url}/{agent_name}/{property_id}/{start_date}/{end_date}"
            logger.info(f"Constructed URL: {url}")

            print(f"Attempting to fetch calendar slots from URL: {url}")
            
            async with httpx.AsyncClient() as client:
                try:
                    response = await client.get(url)
                    logger.info(f"Calendar API response status: {response.status_code}")
                    
                    if response.status_code == 200:
                        unavailable_slots = response.json()
                        logger.info(f"Successfully fetched unavailable slots: {unavailable_slots}")

                        # Initialize Groq
                        chat_model = ChatGroq(model_name="Llama-3.3-70b-Specdec")

                        # Prepare the system and user prompts
                        cal_system_prompt = """
                        You are helpful assistant that helps me find available slots for my calendar.
                        You must only respond with the available slots, no other text.
                        """

                        cal_user_prompt = f"""
                        # instructions 
                        I will provide the start and end dates (window), along with the unavailable slots in between. 
                        You must respond with two available 30 minutes slots in between this window, ideally spread out.
                        You must only respond with the available slots, no other text.

                        ## start and end dates:
                        {{'start': {{'dateTime': '{start_date}', 'timeZone': 'Europe/London'}}, 
                          'end': {{'dateTime': '{end_date}', 'timeZone': 'Europe/London'}}}}

                        ## unavailable slots:
                        {unavailable_slots}

                        ## available slots:
                        """

                        # Create messages and get response
                        messages = [
                            SystemMessage(content=cal_system_prompt),
                            HumanMessage(content=cal_user_prompt)
                        ]   
                        
                        available_slots = await chat_model.ainvoke(messages)
                        
                        # Instead of returning directly, add to chat context and process through main LLM
                        calendar_info = f"The following slots are available for booking: {available_slots.content}"
                        print(f"calendar_info: {calendar_info}")
                        # Add to chat context - fixing the append method call
                        chat_ctx.messages.append(
                            ChatMessage(
                                role="function",
                                content=calendar_info,
                                name="fetch_calendar"  # Add the required name parameter
                            )
                        )
                        
                        # Get response from main LLM to maintain conversation consistency
                        response_stream = llm_instance.chat(chat_ctx=chat_ctx)
                        response = ""
                        async for chunk in response_stream:
                            if hasattr(chunk, 'choices') and chunk.choices:
                                if chunk.choices[0].delta.content:
                                    response += chunk.choices[0].delta.content
                        
                        return response 
                        
                    else:
                        logger.error(f"Calendar API error: Status={response.status_code}, URL={url}, Response={response.text}")
                        return "I apologize, but I encountered an error while fetching calendar slots."
                        
                except httpx.RequestError as e:
                    logger.error(f"Network error while fetching calendar slots: {str(e)}, URL={url}", exc_info=True)
                    return "I apologize, but I encountered a network error while checking the calendar."

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

    # Save initial chat state to Redis
    await RedisChatStorage.save_chat(agent_id, room_name, chat_history.to_dict())
    logger.info(f"lk_chat_process: chat_history saved to redis: {chat_history.to_dict()}")
    
    return llm_instance, chat_ctx, fnc_ctx

@dataclass
class ResponseMetadata:
    response_id: str
    rag_results: list = field(default_factory=list)

    def to_dict(self):
        """Convert the ResponseMetadata instance to a dictionary"""
        return asdict(self)

@dataclass
class ChatMessage:
    role: str
    content: str
    name: str = None
    response_id: str = None
    timestamp: str = None  # Add timestamp field

    def __init__(self, role: str, content: str, name: str = None, response_id: str = None):
        self.role = role
        self.content = content
        self.name = name
        self.response_id = response_id
        self.timestamp = datetime.utcnow().isoformat()  # Set timestamp on creation

    def to_dict(self):
        """Convert the ChatMessage instance to a dictionary"""
        return {
            "role": self.role,
            "content": self.content,
            "name": self.name,
            "response_id": self.response_id,
            "timestamp": self.timestamp
        }

@dataclass
class ChatHistory:
    def __init__(self):
        self.messages: List[ChatMessage] = []
        self.response_metadata: Dict[str, ResponseMetadata] = {}
        self.llm_instance = None
        self.chat_ctx = None
        self.fnc_ctx = None
        print("ChatHistory initialized")

    def to_dict(self):
        """Convert the ChatHistory instance to a dictionary"""
        result = {
            "messages": [msg.to_dict() for msg in self.messages],
            "response_metadata": {
                k: v.to_dict() if hasattr(v, 'to_dict') else v 
                for k, v in self.response_metadata.items()
            }
        }
        print(f"ChatHistory.to_dict() called. Result: {json.dumps(result, indent=2)}")
        return result

    def add_message(self, role: str, content: str, name: str = None, response_id: str = None):
        """Add a message to the chat history"""
        # Check for duplicates
        for msg in self.messages:
            if (msg.role == role and 
                msg.content == content and 
                msg.name == name and 
                msg.response_id == response_id):
                print(f"Skipping duplicate message: {content[:50]}...")
                return
                
        message = ChatMessage(role=role, content=content, name=name, response_id=response_id)
        self.messages.append(message)
        print(f"Added message to ChatHistory: role={role}, content={content[:50]}..., response_id={response_id}")

    def add_rag_results(self, response_id: str, rag_results: List[dict]):
        """Add RAG results to the response metadata"""
        print(f"Adding RAG results for response_id {response_id}: {json.dumps(rag_results, indent=2)}")
        
        if response_id not in self.response_metadata:
            print(f"Creating new ResponseMetadata for {response_id}")
            self.response_metadata[response_id] = ResponseMetadata(response_id=response_id)
        
        if isinstance(self.response_metadata[response_id], dict):
            print(f"Converting dict to ResponseMetadata for {response_id}")
            self.response_metadata[response_id] = ResponseMetadata(
                response_id=response_id,
                rag_results=rag_results
            )
        else:
            print(f"Updating existing ResponseMetadata for {response_id}")
            self.response_metadata[response_id].rag_results = rag_results
        
        print(f"Current response_metadata state: {json.dumps(self.response_metadata, default=lambda x: x.to_dict() if hasattr(x, 'to_dict') else str(x), indent=2)}")

# Global chat history store
# chat_histories: Dict[str, Dict[str, ChatHistory]] = {}  # nested dict for agent_id -> room_name -> history

async def get_chat_rag_results(agent_id: str, room_name: str, response_id: str) -> List[dict]:
    """
    Retrieve RAG results for a specific chat response from Redis.
    Returns a list of dictionaries containing unique source_urls.
    """
    chat_data = await RedisChatStorage.get_chat(agent_id, room_name)
    if not chat_data:
        raise ValueError("Chat history not found")
    
    response_metadata = chat_data.get("response_metadata", {})
    if response_id not in response_metadata:
        raise ValueError("Response ID not found")
    
    # Get original RAG results and extract unique sources
    rag_results = response_metadata[response_id].get("rag_results", [])
    unique_sources = {
        result.get('source_url') or result.get('source_file') 
        for result in rag_results 
        if (result.get('source_url') or result.get('source_file'))
    }
    
    # Return list of dictionaries with source information
    return [
        {"source_url": source} if "http" in str(source) else {"source_file": source} 
        for source in unique_sources
    ]

async def lk_chat_process(message: str, agent_id: str, room_name: str):
    print(f"\n=== Chat Process Debug ===")
    print(f"Processing message: {message}")
    print(f"Agent ID: {agent_id}")
    print(f"Room name: {room_name}")

    # Get existing chat from Redis or create new
    chat_data = await RedisChatStorage.get_chat(agent_id, room_name)
    print(f"Retrieved chat data from Redis: {bool(chat_data)}")

    chat_history = ChatHistory()
    
    if chat_data:
        print("Reconstructing existing chat history...")
        # Reconstruct messages with proper role handling
        for msg in chat_data.get("messages", []):
            if msg["role"] == "function":
                # Ensure function messages have the required 'name' parameter
                chat_history.add_message(
                    role="function",
                    content=msg["content"],
                    name=msg.get("name", "tool_response"),  # Default name if missing
                    response_id=msg.get("response_id")
                )
            else:
                chat_history.add_message(
                    role=msg["role"],
                    content=msg["content"],
                    response_id=msg.get("response_id")
                )

    # Initialize LLM and contexts if they don't exist
    if not chat_history.llm_instance or not chat_history.chat_ctx:
        print("Initializing LLM and contexts...")
        llm_instance, chat_ctx, fnc_ctx = await init_new_chat(agent_id, room_name)
        chat_history.llm_instance = llm_instance
        chat_history.chat_ctx = chat_ctx
        chat_history.fnc_ctx = fnc_ctx
        
    try:
        current_assistant_message = ""
        chunk_count = 0
        response_id = str(uuid4())
        print(f"Generated response_id: {response_id}")

        # Add the new message to chat history
        chat_history.add_message("user", message)
        print("Added user message to chat history")
        
        # Save to Redis after adding user message
        await RedisChatStorage.save_chat(agent_id, room_name, chat_history.to_dict())
        print("Saved updated chat history to Redis")

        logger.info("Starting LLM response stream")
        response_stream = chat_history.llm_instance.chat(
            chat_ctx=chat_history.chat_ctx,
            fnc_ctx=chat_history.fnc_ctx
        )

        # First yield the response_id separately
        yield json.dumps({"type": "response_id", "response_id": response_id})
        
        # Create the response metadata entry
        chat_history.response_metadata[response_id] = ResponseMetadata(response_id=response_id)
        
        async for chunk in response_stream:
            chunk_count += 1
            try:
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
                                # Parse and store RAG results
                                try:
                                    rag_data = json.loads(result.replace("[RAG_RESULTS]: ", ""))
                                    chat_history.add_rag_results(rag_data["response_id"], rag_data.get("results", []))
                                except json.JSONDecodeError:
                                    logger.error(f"Failed to parse RAG results: {result}")
                                continue
                            
                            yield result
                            chat_history.add_message("function", result, name="tool_response")
                        else:
                            tool_response = ""
                            async for result_chunk in result:
                                if isinstance(result_chunk, str) and result_chunk.startswith("[RAG_RESULTS]:"):
                                    # Parse and store RAG results
                                    try:
                                        rag_data = json.loads(result_chunk.replace("[RAG_RESULTS]: ", ""))
                                        chat_history.add_rag_results(rag_data["response_id"], rag_data.get("results", []))
                                    except json.JSONDecodeError:
                                        logger.error(f"Failed to parse RAG results: {result_chunk}")
                                    continue
                                tool_response += result_chunk
                                yield result_chunk
                            chat_history.add_message("function", tool_response, name="tool_response")

            except Exception as chunk_error:
                logger.error(f"Error processing chunk #{chunk_count}: {str(chunk_error)}", exc_info=True)
                logger.error(f"Problematic chunk: {chunk}")
                yield f"[Error processing chunk: {str(chunk_error)}]"

        # Save the final assistant message
        if current_assistant_message:
            chat_history.add_message("assistant", current_assistant_message, response_id=response_id)
            # Final save to Redis
            await RedisChatStorage.save_chat(agent_id, room_name, chat_history.to_dict())
            print(f"Final chat history saved to Redis with message: {current_assistant_message[:100]}...")

    except Exception as e:
        logger.error(f"Error in lk_chat_process: {str(e)}", exc_info=True)
        if current_assistant_message:
            chat_history.add_message("assistant", current_assistant_message + " [Message interrupted due to error]", response_id=response_id)
            await RedisChatStorage.save_chat(agent_id, room_name, chat_history.to_dict())
        raise Exception(f"Failed to process chat message: {str(e)}")


async def save_chat_history_to_supabase(agent_id: str, room_name: str) -> None:
    """Save chat history to Supabase and clean up Redis when chat ends"""
    try:
        # Get chat history from Redis
        chat_data = await RedisChatStorage.get_chat(agent_id, room_name)
        if not chat_data:
            logger.warning(f"No chat history found for agent_id: {agent_id}, room_name: {room_name}")
            return

        # Use the helper function to format the transcript
        formatted_transcript = format_transcript_messages(chat_data["messages"])

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
        
        supabase = await get_supabase()
        response = await supabase.table("conversation_logs").insert(conversation_data).execute()
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
            await RedisChatStorage.delete_chat(agent_id, room_name)
            
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