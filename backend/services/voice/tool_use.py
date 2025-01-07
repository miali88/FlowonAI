from typing import Annotated, Optional, Literal, Union, Dict, List
import aiohttp, os, logging, asyncio, json
from dotenv import load_dotenv

from livekit.agents import llm

from services.chat.chat import similarity_search
from services.cache import get_agent_metadata, calendar_cache, agent_metadata_cache
from services.composio import book_appointment_composio
from services.voice.livekit_helper import detect_call_type_and_get_agent_id

# Update logger configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

API_BASE_URL = os.getenv("DOMAIN")

""" QUESTION & ANSWER """
@llm.ai_callable(
    name="question_and_answer",
    description="Extract user's question and perform information retrieval search to provide relevant answers",
    auto_retry=True
)
async def question_and_answer(
    question: Annotated[
        str,
        llm.TypeInfo(
            description="The user's question that needs to be answered"
        )
    ]
) -> str:
    """
    Takes the user's question and performs information retrieval search based on the user's question.
    Returns relevant information found in the knowledge base.
    """
    print("\n\n Processing Q&A tool")
    try:
        # Get the room_name from the current AgentFunctions instance
        room_name = AgentFunctions.current_room_name
        
        logger.info(f"Processing Q&A for question: {question}")
        print(f"Processing Q&A for question: {question}")

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
            results = await similarity_search(question, data_source=data_source, user_id=user_id)
        else:
            data_source = {"web": ["all"], "text_files": ["all"]}
            results = await similarity_search(question, data_source=data_source, user_id=user_id)

        rag_prompt = f"""
        ## User Query: {question}
        ## Found matching products/services: {results}
        """

        return f"Found matching products/services: {results}"

    except Exception as e:
        logger.error(f"Error in question_and_answer: {str(e)}", exc_info=True)
        return "I apologize, but I encountered an error while searching for an answer to your question."

""" LEAD GENERATION """
### TODO: rename to present_form
@llm.ai_callable(
    name="request_personal_data",
    description="Call this function when the assistant requests the user's personal details, or the user wishes to speak to someone, or the user has requested a callback",
    auto_retry=False
)
async def request_personal_data(
    message: Annotated[
        str,
        llm.TypeInfo(
            description="The message from the assistant requesting the user's personal details, or the user wishing to speak to someone, or the user requesting a callback"
        )
    ]
) -> str:
    logger.info(f"Personal data request triggered with message: {message}")
    """ Call this function when the assistant requests the user's personal details, or the user wishes to speak to someone, or the user has requested a callback """
    
    return "Form presented to user. Waiting for user to complete and submit form."

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
        # Get the room_name from the current AgentFunctions instance
        room_name = AgentFunctions.current_room_name
        agent_id = room_name.split('_')[1]  # Extract agent_id from room name
        agent_metadata: Dict = await get_agent_metadata(agent_id)

        user_id: str = agent_metadata['userId']

        free_slots = calendar_cache[user_id]

        return f"Available slots found: {free_slots}"
        
    except Exception as e:
        logger.error(f"Error in fetch_calendar: {str(e)}", exc_info=True)
        return "I apologize, but I encountered an error while checking the calendar availability."

@llm.ai_callable(
    name="book_appointment",
    description="Once user has confirmed appointment details, book an appointment on the user's calendar",
    auto_retry=True
)
async def book_appointment(
    appointment_details: Annotated[
        str,
        llm.TypeInfo(
            description="The details of the appointment to book, including the date, time, and type of appointment"
        )
    ]
) -> str:
    """
    Once user has confirmed appointment details, book an appointment on the user's calendar.
    Returns a confirmation message about the booked appointment.
    """
    logger.info(f"Booking appointment with details: {appointment_details}")
        # Get the room_name from the current AgentFunctions instance
    room_name = AgentFunctions.current_room_name
    agent_id = room_name.split('_')[1]  # Extract agent_id from room name
    agent_metadata: Dict = await get_agent_metadata(agent_id)

    user_id: str = agent_metadata['userId']

    print(f"user_id: {user_id}")
    print("about to call book_appointment_composio")
    result = await book_appointment_composio(appointment_details, user_id)
    print(f"book_appointment_composio result: {result}")
    return result

""" CALL TRANSFER """
@llm.ai_callable(
    name="transfer_call",
    description="""Transfer the call to a specialist. Use this when:
    1. Caller has completed the online quote form and needs to speak with a specialist
    2. There is an urgent situation requiring immediate specialist attention
    3. Caller is ready to discuss their business situation with the team""",
    auto_retry=True
)
async def transfer_call(
    transfer_reason: Annotated[
        str,
        llm.TypeInfo(
            description="Brief description of why the call is being transferred (e.g., 'Completed quote form', 'Urgent situation', 'Ready for specialist consultation')"
        )
    ],
    caller_name: Annotated[
        str,
        llm.TypeInfo(
            description="The name of the caller"
        )
    ],
    business_name: Annotated[
        str,
        llm.TypeInfo(
            description="The name of the caller's business"
        )
    ]
) -> str:
    """
    Transfers the call to an available specialist based on the caller's situation.
    Returns a confirmation message about the call transfer.
    """
    caller_details = {
        "transfer_reason": transfer_reason,
        "name": caller_name,
        "business_name": business_name
    }
    print(f"\n\n\n\n tool transfer_call invoked - caller_details: {caller_details}")

    logger.info(f"tool transfer_call invoked")
    from services.initiate_outbound import create_sip_participant

    room_name = AgentFunctions.current_room_name
    outbound_room_name = f"outbound_{room_name}"
    agent_id = await detect_call_type_and_get_agent_id(room_name)

    agent_metadata: Dict = await get_agent_metadata(agent_id)

    if not agent_metadata:
        logger.error(f"Failed to get agent metadata for agent_id: {agent_id}")
        return "Error: Could not retrieve agent configuration"
        
    transfer_number: str = agent_metadata.get('features', {}).get('callTransfer', {}).get('number')
    if not transfer_number:
        logger.error(f"No transfer number configured for agent_id: {agent_id}")
        return "Error: No transfer number configured for this agent"
    print(f"transfer_number: {transfer_number}")

    print(f"\nInitiating call transfer - Reason: {transfer_reason}")

    print(f"about to create sip participant for room_name: {room_name}")
    await create_sip_participant(transfer_number, room_name)

    """ to make sure the agent has mentioned the callee will be placed on hold """
    """ to put callee on hold, and isolate agent and callee """

    return f"Call transfer initiated to {transfer_number}"

class AgentFunctions(llm.FunctionContext):
    current_room_name = None
    current_job_ctx = None
    
    def __init__(self, job_ctx):
        super().__init__()
        self.job_ctx = job_ctx
        self.room_name = job_ctx.room.name
        AgentFunctions.current_room_name = self.room_name
        AgentFunctions.current_job_ctx = job_ctx
        # Initialize functions immediately in constructor
        asyncio.create_task(self.initialize_functions())

    async def initialize_functions(self):
        print("Initializing functions for agent")
        features = {}
        agent_id = None

        try:
            # Get agent ID and metadata
            agent_id, call_type = await detect_call_type_and_get_agent_id(self.room_name)
            agent_metadata: Dict = await get_agent_metadata(agent_id)
            
            if agent_metadata:
                features = agent_metadata.get('features', {})
                print(f"Retrieved features for agent {agent_id}: {features}")
            else:
                logger.error(f"No agent metadata found for agent_id: {agent_id}")
                return

            # Register functions before they're needed
            await self._register_functions(features)
            
        except Exception as e:
            logger.error(f"Error in initialize_functions: {str(e)}", exc_info=True)

    async def _register_functions(self, features: Dict):
        """Helper method to register all functions"""
        # Always register Q&A function
        self._register_ai_function(question_and_answer)
        logger.info("Registered Q&A function")

        # Register optional functions based on features
        if features.get('lead_gen', {}).get('enabled', False):
            self._register_ai_function(request_personal_data)
            logger.info("Registered lead generation function")

        if features.get('appointmentBooking', {}).get('enabled', False):
            self._register_ai_function(fetch_calendar)
            self._register_ai_function(book_appointment)
            logger.info("Registered calendar functions")

        if features.get('callTransfer', {}).get('enabled', False):
            self._register_ai_function(transfer_call)
            logger.info("Registered call transfer function")

async def trigger_show_chat_input(room_name: str, job_id: str, participant_identity: str):
    logger.info(f"Triggering chat input for room={room_name}, job_id={job_id}")
    print(f"Triggering chat input for room={room_name}, job_id={job_id}")
    async with aiohttp.ClientSession() as session:
        try:
            # First, trigger the chat input form
            logger.debug("Sending POST request to trigger_show_chat_input endpoint")
            await session.post(f'{API_BASE_URL}/conversation/trigger_show_chat_input', 
                             json={'room_name': room_name, 'job_id': job_id, 'participant_identity': participant_identity})
            
            await asyncio.sleep(1)

            # Poll for the chat message with a timeout
            max_attempts = 60  # 60 seconds total (1 second intervals)
            attempt = 0
            

            while attempt < max_attempts:
                logger.debug(f"Polling for chat message, attempt {attempt + 1}")
                response = await session.get(
                    f'{API_BASE_URL}/conversation/chat_message',
                    params={'participant_identity': participant_identity}
                )
                response_data: List[Dict] = await response.json()

                if response_data and len(response_data) > 0:
                    print("response_data received from chat_message endpoint:", response_data)

                    chat_message: Dict = response_data[0]

                    # Filter out metadata fields from chat_message
                    metadata = ["user_id", "room_name", "participant_identity"]
                    filtered_chat_message = {k: v for k, v in chat_message.items() if k not in metadata}
                    await send_lead_notification(filtered_chat_message)
                    print("filtered_chat_message:", filtered_chat_message)
                    return filtered_chat_message
                
                await asyncio.sleep(1)
                attempt += 1
            
            logger.warning("Timeout waiting for chat message")
            return None
            
        except Exception as e:
            logger.error(f"Error in trigger_show_chat_input: {str(e)}", 
                        extra={'room_name': room_name, 'job_id': job_id}, 
                        exc_info=True)
            raise

async def send_lead_notification(chat_message: dict):
    """ nylas email send here """
    pass




# @llm.ai_callable(
#     name="search_products_and_services",
#     description="Search for products and services in the database when the user inquires about specific offerings, prices, or availability",
#     auto_retry=True
# )
# async def search_products_and_services(
#     query: Annotated[
#         str,
#         llm.TypeInfo(
#             description="The search query containing keywords about products or services"
#         )
#     ],
#     category: Annotated[
#         str,  # Changed from Optional[Literal["products", "services", "both"]]
#         llm.TypeInfo(
#             description="The category to search in: 'products', 'services', or 'both'"
#         )
#     ] = "both",
#     max_results: Annotated[
#         int,  # Changed from Optional[int]
#         llm.TypeInfo(
#             description="Maximum number of results to return (between 1 and 10)"
#         )
#     ] = 5
# ) -> str:
#     """
#     Performs a semantic search in the database for products and services based on the user's query.
#     Returns formatted information about matching products/services.
#     """
#     logger.info(f"Searching products/services with query: {query}, category: {category}")
#     job_id = job_ctx.job.id
#     room_name = job_ctx.room.name
#     user_id = '_'.join(room_name.split('_')[3:])  # Extract user_id from room name
#     agent_id = room_name.split('_')[1]  # Extract agent_id from room name

#     print("\n\n\n\n FUNCTION CALL: search_products_and_services")
#     print(f"job_id: {job_id}, room_name: {room_name}, user_id: {user_id}")
#     print(f"Searching products/services with query: {query}, category: {category}")

#     try:

#         data_source = await get_agent_metadata(agent_id)
#         data_source: str = data_source.get('dataSource', None)
#         if data_source != "all":
#             data_source: Dict = json.loads(data_source)
#             data_source: Dict = {
#                 "web": [item['title'] for item in data_source if item['data_type'] == 'web'],
#                 "text_files": [item['id'] for item in data_source if item['data_type'] != 'web']
#             }
#             # data_source: Dict[str, List[Union[str, int]]]
#             # data_source = {"web": "https://flowon.ai", "text_files": [59,61]}
#             results = await similarity_search(query, data_source=data_source, user_id=user_id)
#         elif data_source == "all":
#             data_source = {"web": ["all"], "text_files": ["all"]}
#             results = await similarity_search(query, data_source=data_source, user_id=user_id)

#         return f"Found matching products/services: {results}"
        
#     except Exception as e:
#         logger.error(f"Error in search_products_and_services: {str(e)}", exc_info=True)
#         return "Sorry, I encountered an error while searching for products and services."
