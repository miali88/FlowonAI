from typing import Annotated
import aiohttp
import os
from dotenv import load_dotenv
import logging

from livekit.agents import llm

logger = logging.getLogger(__name__)

load_dotenv()

API_BASE_URL = os.getenv("DOMAIN")

class AgentFunctions(llm.FunctionContext):
    @llm.ai_callable(
        name="request_personal_data",
        description="Called when the agent requests personal data from the user or when the user needs human assistance",
        auto_retry=False  # Since this is a user interaction, we don't want automatic retries
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
        print(f"Triggering request personal data: {message}")
        return "Form now presented to caller"

async def trigger_show_chat_input(room_name: str, job_id: str):
    print("\n\n\n\n shutting down workeb:", job_id)
    async with aiohttp.ClientSession() as session:
        try:
            await session.post(f'{API_BASE_URL}/conversation/trigger_show_chat_input', json={'room_name': room_name, 'job_id': job_id})
            print("\n\n\n post /conversation/trigger_show_chat_input", job_id)
            
            response = await session.get(f'{API_BASE_URL}/conversation/chat_message', json={'room_name': room_name, 'job_id': job_id})
            response_data = await response.json()
            
            if response_data and isinstance(response_data, list) and len(response_data) > 0:
                chat_message = {
                    'full_name': response_data[0].get('full_name'),
                    'email': response_data[0].get('email'),
                    'contact_number': response_data[0].get('contact_number')
                }
                print("\n\n\n Processed chat_message:", chat_message)
                
                # Send email notification
                await send_lead_notification(chat_message)
                
                return chat_message                
            else:
                print("\n\n\n No valid chat message data received")
            
        except Exception as e:
            logger.error(f"Error triggering show_chat_input: {str(e)}", extra={'room_name': room_name, 'job_id': job_id})


async def send_lead_notification(chat_message: dict):
    """ nylas email send here """
    pass