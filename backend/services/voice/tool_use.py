from typing import Annotated
import aiohttp
import os
from dotenv import load_dotenv
import logging

from livekit.agents import llm

# Update logger configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

API_BASE_URL = os.getenv("DOMAIN")

class AgentFunctions(llm.FunctionContext):
    @llm.ai_callable(
        name="request_personal_data",
        description="Called when the agent requests personal data from the user or when the user needs human assistance",
        auto_retry=False
    )
    async def request_personal_data(
        self,
        message: Annotated[
            str,
            llm.TypeInfo(
                description="The message explaining what personal information is needed and why"
            )
        ]
    ) -> str:
        logger.info(f"Personal data request triggered with message: {message}")
        return "Form now presented to caller"

async def trigger_show_chat_input(room_name: str, job_id: str):
    logger.info(f"Triggering chat input for room={room_name}, job_id={job_id}")
    async with aiohttp.ClientSession() as session:
        try:
            logger.debug("Sending POST request to trigger_show_chat_input endpoint")
            await session.post(f'{API_BASE_URL}/conversation/trigger_show_chat_input', 
                             json={'room_name': room_name, 'job_id': job_id})
            
            logger.debug("Fetching chat message")
            response = await session.get(f'{API_BASE_URL}/conversation/chat_message', 
                                      json={'room_name': room_name, 'job_id': job_id})
            response_data = await response.json()
            
            if response_data:
                chat_message = {
                    'full_name': response_data[0].get('full_name'),
                    'email': response_data[0].get('email'),
                    'contact_number': response_data[0].get('contact_number')
                }
                logger.info(f"Successfully processed chat message for {chat_message.get('full_name')}")
                await send_lead_notification(chat_message)
                return chat_message
            else:
                logger.warning("No valid chat message data received")
            
        except Exception as e:
            logger.error(f"Error in trigger_show_chat_input: {str(e)}", 
                        extra={'room_name': room_name, 'job_id': job_id}, 
                        exc_info=True)
            raise


async def send_lead_notification(chat_message: dict):
    """ nylas email send here """
    pass
