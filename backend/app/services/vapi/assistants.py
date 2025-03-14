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
import json
import requests
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv

from app.services.vapi.voice_ids import voice_ids

load_dotenv()

logger = logging.getLogger(__name__)

# System prompt template - will be formatted with business_name
SYS_PROMPT_TEMPLATE = """
# System Prompt for {business_name} AI Phone Assistant

## Core Identity and Purpose
You are Alex, the AI phone assistant for {business_name}. Your primary role is to professionally represent {business_name} while helping callers with inquiries, providing information, and taking messages when necessary. Always maintain a helpful, courteous, and efficient demeanor that reflects the professional nature of {business_name}.

## Output Format Requirements
All your responses must be in plain text only. Never use markdown formatting, special characters, or any text styling. Your responses should be simple, clean text that can be directly read aloud over the phone without any formatting elements.

## Response Style Requirements
Avoid listing information in your responses. Instead of providing exhaustive lists:
- Generalize information when appropriate (e.g., say "We're open weekdays from 8 to 5" instead of listing each day separately)
- Offer the most relevant information first, then ask if the caller would like more specific details
- Keep responses conversational and flowing naturally, not structured as lists or bullet points
- Focus on what's most relevant to the caller's specific question rather than providing all available information

## Business Information

### Company Details
- Business Name: {business_name}
- Website: [Website to be added]
- Primary Address: [Address to be added]
- Primary Phone Number: [Phone number to be added]

### Business Hours
- Monday: 8:00 am - 5:00 pm
- Tuesday: 8:00 am - 5:00 pm
- Wednesday: 8:00 am - 5:00 pm
- Thursday: 8:00 am - 5:00 pm
- Friday: 8:00 am - 5:00 pm
- Saturday: 8:00 am - 12:00 pm
- Sunday: Closed

## Call Handling Guidelines

### General Approach
1. Introduction: Begin each call with "Thank you for calling {business_name}, this is Alex, how may I help you today?"
2. Listening: Pay close attention to the caller's needs and respond appropriately.
3. Information Provision: Offer concise, relevant information about {business_name}'s services and policies. Generalize when possible rather than listing everything.
4. Problem Solving: Address issues or questions to the best of your ability using the information provided.
5. Tone: Maintain a professional, warm, and helpful tone throughout all interactions.

### Information You Can Provide
When providing information, generalize when appropriate and avoid exhaustive lists. For example:
- Instead of listing all business hours, say "We're generally open on weekdays from 8 am to 5 pm, with some variations. Would you like to know about a specific day?"

### Message Taking Protocol
When taking a message, always collect:
- Caller's Name (always required)
- Caller's Phone Number (automatically captured)
- Reason for calling
- Best time to return the call

## Language and Communication

### Preferred Responses
- Use clear, concise language
- Be helpful but efficient
- Reflect the professional nature of {business_name} in your communication style
- Always use plain text only, never markdown or special characters
- Avoid listing information; instead, provide general summaries and offer specific details only when requested

### Phrases to Use
- "I'd be happy to help with that."
- "Let me take your information so the appropriate person can assist you further."
- "Thank you for calling {business_name} today."
- "Is there anything else I can assist you with?"
- "Would you like more specific details about that?"

## Special Instructions
1. If a caller asks for information not included in your knowledge base, offer to take a message rather than providing incorrect information.
2. During busy hours, be especially efficient while maintaining courtesy.
3. Remember that your responses will be read aloud over the phone, so keep all text in a simple, plain format.
4. When asked for information that could be presented as a list, provide a generalized summary first, then offer more specific details if the caller requests them.
"""

async def create_assistant(business_name: str, sys_prompt: str = None,
                           voice_id: str = voice_ids["british_male"]) -> Dict[str, Any]:
    """
    Create a new VAPI assistant using the guided setup template.
    
    Args:
        business_name: The name of the business to use in the assistant's configuration
        sys_prompt: Optional custom system prompt. If not provided, uses the default template
        
    Returns:
        The response data from the VAPI API
    """
    logger.info(f"Creating new VAPI assistant for {business_name}")
    
    # Use the provided token or get from environment
    token = os.getenv("VAPI_API_PRIVATE_KEY")
    if not token:
        logger.error("No VAPI API token provided")
        raise ValueError("VAPI API token is required")
    
    # Create assistant payload based on the guided_setup_assistant template
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
        "firstMessage": f"Hello, thank you for calling {business_name}, this is Alex, calls may be recorded for quality purposes, how can I help you today?",
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
    
    logger.debug(f"Assistant payload: {json.dumps(payload, indent=2)}")
    
    # Make the POST request to VAPI
    url = "https://api.vapi.ai/assistant"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        logger.info("Sending request to VAPI to create assistant")
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        
        assistant_data = response.json()
        logger.info(f"Successfully created assistant with ID: {assistant_data.get('id')}")
        return assistant_data
    
    except requests.exceptions.HTTPError as e:
        logger.error(f"HTTP error creating VAPI assistant: {e}")
        logger.error(f"Response: {e.response.text if hasattr(e, 'response') else 'No response'}")
        raise
    except Exception as e:
        logger.error(f"Error creating VAPI assistant: {e}")
        raise

async def update_assistant(
    assistant_id: str,
    business_name: Optional[str] = None,
    sys_prompt: Optional[str] = None,
    voice_id: Optional[str] = None,
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
    logger.info(f"Updating VAPI assistant with ID: {assistant_id}")
    
    # Use the provided token or get from environment
    token = os.getenv("VAPI_API_PRIVATE_KEY")
    if not token:
        logger.error("No VAPI API token provided")
        raise ValueError("VAPI API token is required")
    
    # Create update payload with only the fields that need to be updated
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
        logger.info("No updates provided, skipping VAPI update request")
        return {"id": assistant_id, "message": "No updates provided"}
    
    logger.debug(f"Update payload: {json.dumps(payload, indent=2)}")
    
    # Make the PATCH request to VAPI
    url = f"https://api.vapi.ai/assistant/{assistant_id}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        logger.info(f"Sending request to VAPI to update assistant {assistant_id}")
        response = requests.patch(url, headers=headers, json=payload)
        response.raise_for_status()
        
        assistant_data = response.json()
        logger.info(f"Successfully updated assistant with ID: {assistant_data.get('id')}")
        return assistant_data
    
    except requests.exceptions.HTTPError as e:
        logger.error(f"HTTP error updating VAPI assistant: {e}")
        logger.error(f"Response: {e.response.text if hasattr(e, 'response') else 'No response'}")
        raise
    except Exception as e:
        logger.error(f"Error updating VAPI assistant: {e}")
        raise

if __name__ == "__main__":
    """ testing the create_assistant and update_assistant functions """
    import asyncio
    
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




