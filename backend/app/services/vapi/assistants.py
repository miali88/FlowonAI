"""
VAPI Assistant Management Module

This module provides functions to create and manage VAPI AI phone assistants.
It includes:
- A default system prompt for a business phone assistant
- Function to create assistants with default configuration
- Function to update existing assistants
- Direct execution with hard-coded variables

Usage:
    # As a module import
    from app.services.vapi.assistants import create_assistant, update_assistant
    
    # Or just run the file directly
    python -m app.services.vapi.assistants
"""

import os
import requests
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv

from app.services.vapi.constants.voice_ids import voice_ids
load_dotenv()

logger = logging.getLogger(__name__)

async def create_assistant(business_name: str, sys_prompt: str = None,
                           voice_id: str = voice_ids["british_male"], 
                           first_message: Optional[str] = None) -> Dict[str, Any]:
    """
    Create a new VAPI assistant using the guided setup template.
    
    Args:
        business_name: The name of the business to use in the assistant's configuration
        sys_prompt: Optional custom system prompt. If not provided, uses the default template
        voice_id: Optional voice ID. Defaults to British male voice
        first_message: Optional custom first message. If not provided, uses default template
        
    Returns:
        The response data from the VAPI API
    """
    logger.info(f"[SERVICE] create_assistant: Creating new assistant for {business_name}")
    
    # Use the provided token or get from environment
    token = os.getenv("VAPI_API_PRIVATE_KEY")
    if not token:
        logger.error("[SERVICE] create_assistant: No VAPI API token provided")
        raise ValueError("VAPI API token is required")
    
    # Create assistant payload based on the guided_setup_assistant template
    logger.debug(f"[SERVICE] create_assistant: Building payload for {business_name}")
    payload = {
        "name": f"{business_name} Phone Assistant",
        "voice": {
            "model": "eleven_multilingual_v2",
            "speed": 0.9,
            "voiceId": voice_id,
            "provider": "11labs",
            "stability": 0.5,
            "similarityBoost": 0.75
        },
        "model": {
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "system",
                    "content": sys_prompt
                }
            ],
            "provider": "openai",
            "temperature": 0.3
        },
        "firstMessage": first_message or f"Hello, thank you for calling {business_name}, this is Alex, calls may be recorded for quality purposes, how can I help you today?",
        "endCallFunctionEnabled": True,
        "transcriber": {
            "model": "nova-3",
            "language": "en",
            "numerals": True,
            "provider": "deepgram"
        },
        "clientMessages": [
            "transcript",
            "hang",
            "function-call",
            "speech-update",
            "metadata",
            "transfer-update",
            "conversation-update",
            "function-call-result",
            "model-output",
            "status-update",
            "tool-calls",
            "tool-calls-result",
            "voice-input"
        ],
        "serverMessages": [
            "end-of-call-report",
            "status-update",
            "hang",
            "function-call"
        ],
        "hipaaEnabled": False,
        "backchannelingEnabled": False,
        "backgroundDenoisingEnabled": False,
        "compliancePlan": {
            "hipaaEnabled": False,
            "pciEnabled": False
        }
    }
    
    logger.debug(f"[SERVICE] create_assistant: Payload prepared for {business_name}")
    
    # Make the POST request to VAPI
    url = "https://api.vapi.ai/assistant"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        logger.info(f"[SERVICE] create_assistant: Sending request to VAPI for {business_name}")
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        
        assistant_data = response.json()
        logger.info(f"[SERVICE] create_assistant: Successfully created assistant {assistant_data.get('id')} for {business_name}")
        return assistant_data
    
    except requests.exceptions.HTTPError as e:
        logger.error(f"[SERVICE] create_assistant: HTTP error creating assistant: {e}")
        logger.error(f"[SERVICE] create_assistant: Response: {e.response.text if hasattr(e, 'response') else 'No response'}")
        raise
    except Exception as e:
        logger.error(f"[SERVICE] create_assistant: Error creating assistant: {e}")
        raise

async def update_assistant(
    assistant_id: str,
    business_name: Optional[str] = None,
    sys_prompt: Optional[str] = None,
    voice_id: Optional[str] = voice_ids["british_male"],
    first_message: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update an existing VAPI assistant.
    
    Args:
        assistant_id: The ID of the assistant to update
        business_name: Optional new business name to update in the assistant's configuration
        sys_prompt: Optional new system prompt
        voice_id: Optional new voice ID
        first_message: Optional new first message
        
    Returns:
        The response data from the VAPI API with the updated assistant
    """
    logger.info(f"[SERVICE] update_assistant: Updating assistant {assistant_id}")
    
    # Use the provided token or get from environment
    token = os.getenv("VAPI_API_PRIVATE_KEY")
    if not token:
        logger.error("[SERVICE] update_assistant: No VAPI API token provided")
        raise ValueError("VAPI API token is required")
    
    # Create update payload with only the fields that need to be updated
    logger.debug(f"[SERVICE] update_assistant: Building update payload for assistant {assistant_id}")
    payload = {}
    
    # Update name if business_name is provided
    if business_name:
        payload["name"] = f"{business_name} Phone Assistant"
    
    # Update voice if voice_id is provided
    if voice_id:
        payload["voice"] = {
            "model": "eleven_multilingual_v2",
            "speed": 0.9,
            "voiceId": voice_id,
            "provider": "11labs",
            "stability": 0.5,
            "similarityBoost": 0.75
        }
    
    # Update system prompt if sys_prompt is provided
    if sys_prompt:
        payload["model"] = {
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "system",
                    "content": sys_prompt
                }
            ],
            "provider": "openai",
            "temperature": 0.3
        }
    
    # Update first message if provided
    if first_message:
        payload["firstMessage"] = first_message
    elif business_name:  # Update first message if business_name is provided but first_message is not
        payload["firstMessage"] = f"Hello, thank you for calling {business_name}, this is Alex, calls may be recorded for quality purposes, how can I help you today?"
    
    # Skip the update if there's nothing to update
    if not payload:
        logger.info("[SERVICE] update_assistant: No updates provided, skipping VAPI update request")
        return {"id": assistant_id, "message": "No updates provided"}
    
    logger.debug(f"[SERVICE] update_assistant: Update payload prepared for assistant {assistant_id}")
    
    # Make the PATCH request to VAPI
    url = f"https://api.vapi.ai/assistant/{assistant_id}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        logger.info(f"[SERVICE] update_assistant: Sending update request to VAPI for assistant {assistant_id}")
        response = requests.patch(url, headers=headers, json=payload)
        response.raise_for_status()
        
        assistant_data = response.json()
        logger.info(f"[SERVICE] update_assistant: Successfully updated assistant {assistant_id}")
        return assistant_data
    
    except requests.exceptions.HTTPError as e:
        logger.error(f"[SERVICE] update_assistant: HTTP error updating assistant: {e}")
        logger.error(f"[SERVICE] update_assistant: Response: {e.response.text if hasattr(e, 'response') else 'No response'}")
        raise
    except Exception as e:
        logger.error(f"[SERVICE] update_assistant: Error updating assistant: {e}")
        raise

if __name__ == "__main__":
    """ testing the create_assistant and update_assistant functions """
    import asyncio
    from backend.app.services.vapi.constants.inbound_sys_prompt import SYS_PROMPT_TEMPLATE
    from app.services.vapi.constants.voice_ids import voice_ids
    
    # Set up logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Set your variables here
    BUSINESS_NAME = "FlowOn AI"  # Change this to your business name
    
    # Run the function
    async def main():
        try:
            print(f"Creating assistant for {BUSINESS_NAME}...")
            # result = await create_assistant(
            #     business_name=BUSINESS_NAME,
            #     sys_prompt=SYS_PROMPT_TEMPLATE.format(business_name=BUSINESS_NAME),
            #     voice_id=voice_ids["british_male"]
            # )

            result = await update_assistant(
                assistant_id="5d19926e-b350-404b-975c-d80aa4054432",
                business_name=BUSINESS_NAME,
                sys_prompt=SYS_PROMPT_TEMPLATE.format(business_name=BUSINESS_NAME),
                voice_id=voice_ids["british_male"]
            )
            print(f"Assistant created successfully!")
            print(f"Assistant ID: {result.get('id')}")
            print(f"Assistant Name: {result.get('name')}")
        except Exception as e:
            print(f"Error creating assistant: {e}")
            import traceback
            traceback.print_exc()
            exit(1)
    
    # Run the async main function
    asyncio.run(main())




