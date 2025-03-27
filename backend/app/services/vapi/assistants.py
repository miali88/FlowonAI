"""
VAPI Assistant Management Module

This module provides functions to create and manage VAPI AI phone assistants.
It includes:
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
from app.core.logging_setup import logger
from typing import Dict, Any, Optional
from dotenv import load_dotenv

from app.services.vapi.constants.voice_ids import voice_ids
from app.services.vapi.agent_config import build_assistant_payload, build_update_payload

load_dotenv()

async def create_assistant(business_name: str, voice_id: str,
                            sys_prompt: str = None,
                            first_message: Optional[str] = None,
                            **kwargs) -> Dict[str, Any]:
    """
    Create a new VAPI assistant using the guided setup template.
    
    Args:
        business_name: The name of the business to use in the assistant's configuration
        sys_prompt: Optional custom system prompt. If not provided, uses the default template
        voice_id: Optional voice ID. Defaults to British male voice
        first_message: Optional custom first message. If not provided, uses default template
        **kwargs: Additional configuration overrides
        
    Returns:
        The response data from the VAPI API
    """
    logger.info(f"[SERVICE] create_assistant: Creating new assistant for {business_name}")
    
    # Use the provided token or get from environment
    token = os.getenv("VAPI_API_PRIVATE_KEY")
    if not token:
        logger.error("[SERVICE] create_assistant: No VAPI API token provided")
        raise ValueError("VAPI API token is required")
    
    # Build the assistant payload using the configuration module
    logger.debug(f"[SERVICE] create_assistant: Building payload for {business_name}")
    payload = build_assistant_payload(
        business_name=business_name,
        voice_id=voice_id,
        sys_prompt=sys_prompt,
        first_message=first_message,
        **kwargs
    )
    
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
    voice_id: Optional[str] = None,
    sys_prompt: Optional[str] = None,
    first_message: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Update an existing VAPI assistant.
    
    Args:
        assistant_id: The ID of the assistant to update
        business_name: Optional new business name to update in the assistant's configuration
        sys_prompt: Optional new system prompt
        voice_id: Optional new voice ID
        first_message: Optional new first message
        **kwargs: Additional fields to update
        
    Returns:
        The response data from the VAPI API with the updated assistant
    """
    logger.info(f"[SERVICE] update_assistant: Updating assistant {assistant_id}")
    
    # Use the provided token or get from environment
    token = os.getenv("VAPI_API_PRIVATE_KEY")
    if not token:
        logger.error("[SERVICE] update_assistant: No VAPI API token provided")
        raise ValueError("VAPI API token is required")
    
    # Build the update payload using the configuration module
    logger.debug(f"[SERVICE] update_assistant: Building update payload for assistant {assistant_id}")
    payload = build_update_payload(
        business_name=business_name,
        voice_id=voice_id,
        sys_prompt=sys_prompt,
        first_message=first_message,
        **kwargs
    )
    
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




