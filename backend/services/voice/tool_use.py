from typing import Annotated, Optional, Literal, Union, Dict, List
import json
import aiohttp, os, logging, asyncio
from dotenv import load_dotenv

from livekit.agents import llm

from services.chat.chat import similarity_search
from services.cache import get_agent_metadata

# Update logger configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

API_BASE_URL = os.getenv("DOMAIN")

class AgentFunctions(llm.FunctionContext):
    def __init__(self, job_ctx):
        self.job_ctx = job_ctx
        super().__init__()

    # @llm.ai_callable(
    #     name="request_personal_data",
    #     description="Call this function when the assistant has provided product information to the user, or the assistant requests the user's personal data, or the user wishes to speak to someone, or wants to bring their vehicle in to the garage, or the user has requested a callback",
    #     auto_retry=False
    # )
    # async def request_personal_data(
    #     self,
    #     message: Annotated[
    #         str,
    #         llm.TypeInfo(
    #             description="Call this function when the assistant has provided product information to the user, or the assistant requests the user's personal data, or the user wishes to speak to someone, or wants to bring their vehicle in to the garage, or the user has requested a callback"
    #         )
    #     ]
    # ) -> str:
    #     logger.info(f"Personal data request triggered with message: {message}")
    #     return "Form presented to user. Waiting for user to complete and submit form."

    # @llm.ai_callable(
    #     name="search_products_and_services",
    #     description="Search for products and services in the database when the user inquires about specific offerings, prices, or availability",
    #     auto_retry=True
    # )
    # async def search_products_and_services(
    #     self,
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
    #     job_id = self.job_ctx.job.id
    #     room_name = self.job_ctx.room.name
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

    @llm.ai_callable(
        name="verify_user_info",
        description="Verify user information based on provided form fields"
    )
    async def verify_user_info(
        form_fields: Annotated[
            str,
            llm.TypeInfo(
                description=f"JSON string containing user form fields to verify ('full name', 'organization', 'industry sector')"
            )
        ]
    ) -> str:
        """
        Verifies user information in the system.
        Returns confirmation message or error details.
        """
        try:
            # Parse the JSON string into a dictionary
            fields = json.loads(form_fields)
            
            # Store collected information in a global variable or database
            if not hasattr(verify_user_info, 'collected_user_info'):
                verify_user_info.collected_user_info = {}
            
            # Update the stored information with new fields
            verify_user_info.collected_user_info.update(fields)
            
            # Validate required fields (fixed version)
            required_fields = ['full name', 'organization', 'industry sector']
            missing_fields = [field for field in required_fields if field not in fields]
            if missing_fields:
                return f"Missing required fields: {', '.join(missing_fields)}"
            
            # Format collected information for display
            info_summary = "\n".join([f"{k.title()}: {v}" for k, v in verify_user_info.collected_user_info.items()])
            return (
                f"Here's what we have so far:\n{info_summary}\n\n"
                f"Great, now that we've collected your information, I'll redirect you to the dashboard."
            )
            
        except json.JSONDecodeError:
            return "Error: Invalid JSON format in form fields"
        except Exception as e:
            return f"Error verifying user information: {str(e)}"

    @llm.ai_callable(
        name="redirect_to_dashboard",
        description="Redirect user to dashboard after completing onboarding and verifying user information",
        auto_retry=True
    )
    async def redirect_to_dashboard(
        recommended_feature: Annotated[
            str,
            llm.TypeInfo(
                description="The recommended feature for the user to start with, based on the conversation"
            )
        ],
        use_case: Annotated[
            str,
            llm.TypeInfo(
                description="The specific use case identified during the conversation"
            )
        ]
    ) -> str:
        """
        Concludes the onboarding conversation and redirects user to dashboard.
        Should only be called after:
        1. User information has been collected and verified via verify_user_info
        2. The conversation has naturally concluded
        3. A clear use case and recommended feature have been identified

        Returns a farewell message with personalized feature recommendations.
        """
        return (
            f"Great! Now that we've collected your information and understood your needs, "
            f"I'll redirect you to the dashboard. Based on our conversation, "
            f"I recommend starting with the {recommended_feature} feature which aligns perfectly "
            f"with your {use_case} use case. You'll find it prominently displayed in the dashboard navigation. "
            f"Feel free to return here if you need any additional guidance. Good luck with your journey!"
        )


async def trigger_show_chat_input(room_name: str, job_id: str, participant_identity: str):
    logger.info(f"Triggering chat input for room={room_name}, job_id={job_id}")
    async with aiohttp.ClientSession() as session:
        try:
            # First, trigger the chat input form
            logger.debug("Sending POST request to trigger_show_chat_input endpoint")
            await session.post(f'{API_BASE_URL}/conversation/trigger_show_chat_input', 
                             json={'room_name': room_name, 'job_id': job_id, 'participant_identity': participant_identity})
            
            # Wait 2 seconds before starting to poll
            await asyncio.sleep(2)

            # Poll for the chat message with a timeout
            max_attempts = 45  # 45 seconds total (1 second intervals)
            attempt = 0
            
            while attempt < max_attempts:
                logger.debug(f"Polling for chat message, attempt {attempt + 1}")
                response = await session.get(
                    f'{API_BASE_URL}/conversation/chat_message',
                    params={'participant_identity': participant_identity}
                )
                response_data = await response.json()
                
                if response_data and len(response_data) > 0:
                    chat_message = {
                        'full_name': response_data[0].get('full_name'),
                        'email': response_data[0].get('email'),
                        'contact_number': response_data[0].get('contact_number')
                    }
                    #logger.info(f"Successfully received chat message for {chat_message.get('full_name')}")
                    await send_lead_notification(chat_message)
                    return chat_message
                
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


