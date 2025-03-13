import logging
import os
import requests
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

async def register_phone_number_with_vapi(
    phone_number: str,
    twilio_account_sid: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Register a purchased Twilio phone number with Vapi.ai
    
    Args:
        phone_number: The purchased phone number
        twilio_account_sid: Optional Twilio account SID (if not provided, will use environment variables)
        
    Returns:
        Dict with the API response from Vapi
        
    Raises:
        Exception: If the API request fails
    """
    logger.info(f"Registering phone number {phone_number} with Vapi")
    
    # Get credentials from environment variables if not provided
    account_sid = twilio_account_sid or os.environ.get("TWILIO_ACCOUNT_SID")
    auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
    vapi_api_key = os.environ.get("VAPI_API_KEY")
    
    if not account_sid or not auth_token:
        error_msg = "Missing Twilio credentials for Vapi registration"
        logger.error(error_msg)
        raise ValueError(error_msg)
        
    if not vapi_api_key:
        error_msg = "Missing Vapi API key for phone number registration"
        logger.error(error_msg)
        raise ValueError(error_msg)
    
    try:
        # Make the API request to Vapi
        logger.info(f"Making API request to Vapi for phone number {phone_number}")
        response = requests.post(
            "https://api.vapi.ai/phone-number",
            headers={
                "Authorization": f"Bearer {vapi_api_key}",
                "Content-Type": "application/json"
            },
            json={
                "provider": "twilio",
                "number": phone_number,
                "twilioAccountSid": account_sid,
                "twilioAuthToken": auth_token
            },
        )
        
        # Check if the request was successful
        response.raise_for_status()
        
        # Parse the response
        result = response.json()
        logger.info(f"Successfully registered phone number {phone_number} with Vapi")
        logger.debug(f"Vapi API response: {result}")
        
        return result
    
    except requests.RequestException as e:
        error_msg = f"Failed to register phone number with Vapi: {str(e)}"
        logger.error(error_msg)
        
        # If we have response content, log it for debugging
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_details = e.response.json()
                logger.error(f"Vapi API error details: {error_details}")
            except:
                logger.error(f"Vapi API error status code: {e.response.status_code}")
        
        raise Exception(error_msg)
