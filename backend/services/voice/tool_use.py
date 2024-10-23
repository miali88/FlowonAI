from typing import Annotated
import aiohttp
import os
from dotenv import load_dotenv
import logging
import asyncio

from livekit.agents import llm

# Update logger configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

API_BASE_URL = os.getenv("DOMAIN")

class AgentFunctions(llm.FunctionContext):
    @llm.ai_callable(
        name="request_personal_data",
        description="Call this function when the assistant has provided product information to the user, or the user wishes to speak to someone, or wants to bring their vehicle in to the garage, or the user has requested a callback",
        auto_retry=False
    )
    async def request_personal_data(
        self,
        message: Annotated[
            str,
            llm.TypeInfo(
                description="Call this function when the assistant has provided product information to the user, or the user wishes to speak to someone, or wants to bring their vehicle in to the garage, or the user has requested a callback"
            )
        ]
    ) -> str:
        logger.info(f"Personal data request triggered with message: {message}")
        return "Form now presented to caller"


async def trigger_show_chat_input(room_name: str, job_id: str, participant_identity: str):
    logger.info(f"Triggering chat input for room={room_name}, job_id={job_id}")
    async with aiohttp.ClientSession() as session:
        try:
            # First, trigger the chat input form
            logger.debug("Sending POST request to trigger_show_chat_input endpoint")
            await session.post(f'{API_BASE_URL}/conversation/trigger_show_chat_input', 
                             json={'room_name': room_name, 'job_id': job_id, 'participant_identity': participant_identity})
            
            # Wait 3 seconds before starting to poll
            await asyncio.sleep(3)

            # Poll for the chat message with a timeout
            max_attempts = 60  # 30 seconds total (0.5 second intervals)
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
                    logger.info(f"Successfully received chat message for {chat_message.get('full_name')}")
                    await send_lead_notification(chat_message)
                    return chat_message
                
                await asyncio.sleep(0.5)
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
