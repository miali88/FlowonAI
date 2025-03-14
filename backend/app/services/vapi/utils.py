import logging
import os
import requests
from typing import Dict, Any, Optional
from app.clients.supabase_client import get_supabase
logger = logging.getLogger(__name__)

async def get_user_id(phone_number: str) -> Optional[str]:
    """
    Query the Twilio numbers table to get the user ID associated with a phone number.
    
    Args:
        phone_number: The phone number to lookup
        
    Returns:
        The user ID if found, None otherwise
    """
    try:
        if not phone_number:
            logger.warning("Empty phone number provided to getUserID")
            return None
            
        logger.info(f"Looking up user ID for phone number: {phone_number}")
        
        # Get Supabase client
        supabase = await get_supabase()
        
        # Query the twilio_numbers table for this phone number
        response = await supabase.table("twilio_numbers").select("owner_user_id").eq("phone_number", phone_number).execute()
        
        # Check if we got results
        data = response.data
        if not data or len(data) == 0:
            logger.warning(f"No user found for phone number: {phone_number}")
            return None
            
        # Return the user ID from the first matching record
        user_id = data[0].get("owner_user_id")
        logger.info(f"Found user ID {user_id} for phone number: {phone_number}")
        return user_id
        
    except Exception as e:
        logger.error(f"Error looking up user ID for phone number {phone_number}: {str(e)}")
        return None

# New function to get user notification settings
async def get_user_notification_settings(user_id: str) -> Dict[str, Any]:
    """
    Get user's notification settings from guided_setup table.
    
    Args:
        user_id: The user ID to lookup
        
    Returns:
        Dict containing notification settings
    """
    from app.clients.supabase_client import get_supabase
    
    try:
        logger.info(f"Getting notification settings for user: {user_id}")
        supabase = await get_supabase()
        
        response = await supabase.table("guided_setup").select("call_notifications").eq("user_id", user_id).execute()
        
        data = response.data
        if not data or len(data) == 0:
            logger.warning(f"No guided setup found for user: {user_id}")
            return {}
            
        call_notifications = data[0].get("call_notifications", {})
        logger.info(f"Found notification settings for user {user_id}: {call_notifications}")
        return call_notifications
        
    except Exception as e:
        logger.error(f"Error getting notification settings for user {user_id}: {str(e)}")
        return {}
    
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
