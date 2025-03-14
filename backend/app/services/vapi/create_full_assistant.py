#!/usr/bin/env python3
"""
Script to create a fully configured VAPI assistant with all available options.
Uses the guided setup template as a base and allows customization of all parameters.
"""
import os
import json
import logging
import argparse
import asyncio
import requests
from typing import Dict, Any, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import the system prompt from assistants.py if available
try:
    from app.services.vapi.assistants import sys_prompt
except ImportError:
    # Fallback system prompt if import fails
    sys_prompt = """
    # System Prompt for AI Phone Assistant
    
    You are an AI phone assistant. Be helpful, professional and concise in your responses.
    """

async def create_full_assistant(
    business_name: str,
    config_file: Optional[str] = None,
    api_token: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a new VAPI assistant with full configuration options.
    
    Args:
        business_name: The name of the business to use in the assistant's configuration
        config_file: Optional path to a JSON configuration file for additional options
        api_token: Optional VAPI API token. If not provided, uses the VAPI_API_KEY env variable
        
    Returns:
        The response data from the VAPI API
    """
    logger.info(f"Creating new VAPI assistant for {business_name}")
    
    # Use the provided token or get from environment
    token = api_token or os.environ.get("VAPI_API_KEY")
    if not token:
        logger.error("No VAPI API token provided")
        raise ValueError("VAPI API token is required")
    
    # Base configuration
    payload = {
        "name": f"{business_name} Phone Assistant",
        "voice": {
            "provider": "11labs",
            "voiceId": "2mltbVQP21Fq8XgIfRQJ",
            "model": "eleven_multilingual_v2",
            "speed": 0.9,
            "stability": 0.5,
            "similarityBoost": 0.75
        },
        "model": {
            "provider": "openai",
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "system",
                    "content": sys_prompt
                }
            ],
            "temperature": 0.3
        },
        "firstMessage": f"Hello, thank you for calling {business_name}, this is Alex, how can I help you today?",
        "firstMessageMode": "assistant-speaks-first",
        "transcriber": {
            "provider": "deepgram",
            "model": "nova-3",
            "language": "en",
            "numerals": True
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
        "silenceTimeoutSeconds": 30,
        "maxDurationSeconds": 600,
        "backgroundDenoisingEnabled": False,
        "compliancePlan": {
            "hipaaEnabled": False,
            "pciEnabled": False
        },
        "transportConfigurations": [
            {
                "provider": "twilio",
                "timeout": 60,
                "record": False,
                "recordingChannels": "mono"
            }
        ]
    }
    
    # If a config file is provided, load and merge it with the base configuration
    if config_file:
        logger.info(f"Loading additional configuration from {config_file}")
        try:
            with open(config_file, 'r') as f:
                config_data = json.load(f)
            
            # Merge the loaded configuration with our base configuration
            # This will override any values from the base configuration
            def deep_merge(base, override):
                for key, value in override.items():
                    if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                        deep_merge(base[key], value)
                    else:
                        base[key] = value
            
            deep_merge(payload, config_data)
            logger.info("Successfully merged configuration data")
        except Exception as e:
            logger.error(f"Error loading or merging configuration data: {e}")
            raise
    
    logger.debug(f"Final assistant payload: {json.dumps(payload, indent=2)}")
    
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

# Command-line script
if __name__ == "__main__":
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Create a fully configured VAPI assistant')
    parser.add_argument('--business-name', type=str, required=True, help='Name of the business')
    parser.add_argument('--config-file', type=str, help='Path to a JSON configuration file')
    parser.add_argument('--api-token', type=str, help='VAPI API token (defaults to VAPI_API_KEY env var)')
    parser.add_argument('--output-file', type=str, help='Write the assistant response to this file')
    args = parser.parse_args()
    
    # Run the function
    async def main():
        try:
            result = await create_full_assistant(
                business_name=args.business_name,
                config_file=args.config_file,
                api_token=args.api_token
            )
            print(f"Assistant created successfully!")
            print(f"Assistant ID: {result.get('id')}")
            print(f"Assistant Name: {result.get('name')}")
            
            # Write result to file if requested
            if args.output_file:
                with open(args.output_file, 'w') as f:
                    json.dump(result, f, indent=2)
                print(f"Assistant data written to {args.output_file}")
                
        except Exception as e:
            print(f"Error creating assistant: {e}")
            import traceback
            traceback.print_exc()
            exit(1)
    
    # Run the async main function
    asyncio.run(main()) 