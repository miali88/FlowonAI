#!/usr/bin/env python3
"""
Script for initiating outbound calls using VAPI API.
Documentation: https://docs.vapi.ai/api-reference/calls/create


vapi voicemail: https://www.youtube.com/watch?v=5V8ocbdWBhc
"""

import os
import sys
import json
import requests
from typing import Dict, Any, Optional
from dotenv import load_dotenv


def initiate_outbound_call(api_key: str, agent_id: str, phone_number: str, 
                          twilio_number_id: str,
                          config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Initiates an outbound call using VAPI API.
    
    Args:
        api_key: VAPI PRIVATE API key for authentication (not the public key)
        agent_id: ID of the agent to use for the call (UUID format)
        phone_number: Customer's phone number to call (E.164 format, e.g., +1XXXXXXXXXX)
        twilio_number_id: UUID of your purchased phone number from VAPI dashboard (not the actual phone number)
        config: Optional additional configuration parameters
        
    Returns:
        Response from the VAPI API
    """
    url = "https://api.vapi.ai/call"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "phoneNumberId": twilio_number_id,
        "customer": {
            "number": phone_number
        },
        "assistantId": agent_id,
        "assistant": {}
    }
    
    # Add optional configuration if provided
    if config:
        for key, value in config.items():
            # Don't overwrite core parameters
            if key not in ["phoneNumberId", "customer", "assistantId"]:
                payload[key] = value
    
    print(f"Initiating outbound call to: {phone_number}")
    print(f"Using agent ID: {agent_id}")
    print(f"Using Twilio number ID: {twilio_number_id}")
    print(f"Request payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
        result = response.json()
        print(f"Call initiated successfully!")
        print(f"Response: {json.dumps(result, indent=2)}")
        return result
    except requests.exceptions.RequestException as e:
        print(f"Error initiating call: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"Response status code: {e.response.status_code}")
            print(f"Response body: {e.response.text}")
        sys.exit(1)


def main():
    """
    Main function for initiating a VAPI outbound call.
    """
    # Load environment variables
    load_dotenv()
    
    # Get API key from environment - IMPORTANT: Use your PRIVATE API key, not public key
    api_key = os.getenv("VAPI_API_KEY")  # This should be your private API key
    if not api_key:
        print("Error: VAPI_API_KEY not found in environment variables")
        print("Make sure you've set your PRIVATE API key in your .env file")
        sys.exit(1)
    
    # Agent ID
    agent_id = "bc358757-e520-4374-af26-4dc441c89051"
    
    # Get the phone number to call (recipient)
    phone_number = "+447745187688"  # Format: E.164 (e.g., +1XXXXXXXXXX for US numbers)
    
    # Your purchased Twilio number ID from VAPI
    # IMPORTANT: This must be the UUID of your phone number, NOT the phone number itself
    # To find your Twilio number ID:
    # 1. Log into your VAPI dashboard: https://app.vapi.ai/
    # 2. Navigate to "Phone Numbers" in the sidebar
    # 3. Find your purchased number and copy its UUID (looks like: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    twilio_number_id = "af98b91b-9964-4ba4-84b4-1ac567470af4"  # Use the UUID, not the phone number
    
    # Optional: Additional configuration parameters
    config = {
        "name": "Test outbound call",  # Optional name for the call (for reference)
    }
    
    # Initiate the outbound call
    result = initiate_outbound_call(api_key, agent_id, phone_number, twilio_number_id, config)
    
    # You can process the result further here if needed
    # For example, save the call ID to a database, etc.


if __name__ == "__main__":
    main() 