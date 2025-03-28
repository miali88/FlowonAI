from app.core.logging_setup import logger
import os
import requests
from typing import Dict, Any, Optional, List
from app.clients.supabase_client import get_supabase
from app.core.config import settings
import json
import httpx

async def get_user_id(phone_number: str) -> Optional[str]:
    """Get user ID associated with a phone number."""
    logger.info(f"[SERVICE] get_user_id: Looking up user for phone number: {phone_number}")
    try:
        supabase = await get_supabase()
        # Use containedBy to check if the phone number is in the JSON array
        response = await supabase.table("guided_setup").select("user_id").filter("phone_number", "eq", phone_number).execute()
        
        if response.data and len(response.data) > 0:
            user_id = response.data[0]["user_id"]
            logger.debug(f"[SERVICE] get_user_id: Found user ID: {user_id}")
            return user_id
        
        logger.warning(f"[SERVICE] get_user_id: No user found for phone number: {phone_number}")
        return None
    except Exception as e:
        logger.error(f"[SERVICE] get_user_id: Error looking up user: {str(e)}")
        return None

async def get_vapi_token() -> Optional[str]:
    """Get VAPI API token from environment variables."""
    logger.debug("[SERVICE] get_vapi_token: Retrieving VAPI API token")
    token = settings.VAPI_API_PRIVATE_KEY
    if not token:
        logger.error("[SERVICE] get_vapi_token: No VAPI API token found in environment")
        return None
    return token

async def make_vapi_request(
    method: str,
    endpoint: str,
    data: Optional[Dict[str, Any]] = None,
    params: Optional[Dict[str, Any]] = None,
) -> Optional[Dict[str, Any]]:
    """Make a request to the VAPI API."""
    logger.info(f"[SERVICE] make_vapi_request: Making {method} request to {endpoint}")
    
    token = await get_vapi_token()
    if not token:
        logger.error("[SERVICE] make_vapi_request: No VAPI API token available")
        return None
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    
    url = f"{settings.VAPI_API_BASE_URL}{endpoint}"
    logger.debug(f"[SERVICE] make_vapi_request: Full URL: {url}")
    
    try:
        async with httpx.AsyncClient() as client:
            if method.upper() == "GET":
                logger.debug(f"[SERVICE] make_vapi_request: GET request with params: {params}")
                response = await client.get(url, headers=headers, params=params)
            elif method.upper() == "POST":
                logger.debug(f"[SERVICE] make_vapi_request: POST request with data: {json.dumps(data)}")
                response = await client.post(url, headers=headers, json=data)
            elif method.upper() == "PUT":
                logger.debug(f"[SERVICE] make_vapi_request: PUT request with data: {json.dumps(data)}")
                response = await client.put(url, headers=headers, json=data)
            else:
                logger.error(f"[SERVICE] make_vapi_request: Unsupported HTTP method: {method}")
                return None
            
            response.raise_for_status()
            response_data = response.json()
            logger.debug(f"[SERVICE] make_vapi_request: Successful response: {json.dumps(response_data)}")
            return response_data
            
    except httpx.HTTPStatusError as e:
        logger.error(f"[SERVICE] make_vapi_request: HTTP error {e.response.status_code}: {str(e)}")
        return None
    except httpx.RequestError as e:
        logger.error(f"[SERVICE] make_vapi_request: Request error: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"[SERVICE] make_vapi_request: Unexpected error: {str(e)}")
        return None

async def get_assistant_details(assistant_id: str) -> Optional[Dict[str, Any]]:
    """Get details of a VAPI assistant."""
    logger.info(f"[SERVICE] get_assistant_details: Fetching details for assistant {assistant_id}")
    
    response = await make_vapi_request(
        method="GET",
        endpoint=f"/assistants/{assistant_id}",
    )
    
    if response:
        logger.debug(f"[SERVICE] get_assistant_details: Successfully retrieved assistant details")
        return response
    else:
        logger.error(f"[SERVICE] get_assistant_details: Failed to retrieve assistant details")
        return None

async def get_call_details(call_id: str) -> Optional[Dict[str, Any]]:
    """Get details of a VAPI call."""
    logger.info(f"[SERVICE] get_call_details: Fetching details for call {call_id}")
    
    response = await make_vapi_request(
        method="GET",
        endpoint=f"/calls/{call_id}",
    )
    
    if response:
        logger.debug(f"[SERVICE] get_call_details: Successfully retrieved call details")
        return response
    else:
        logger.error(f"[SERVICE] get_call_details: Failed to retrieve call details")
        return None

async def get_user_assistants(user_id: str) -> List[Dict[str, Any]]:
    """Get all assistants associated with a user."""
    logger.info(f"[SERVICE] get_user_assistants: Fetching assistants for user {user_id}")
    try:
        supabase = await get_supabase()
        response = await supabase.table("assistants").select("*").eq("user_id", user_id).execute()
        
        if response.data:
            logger.debug(f"[SERVICE] get_user_assistants: Found {len(response.data)} assistants")
            return response.data
        
        logger.warning(f"[SERVICE] get_user_assistants: No assistants found for user {user_id}")
        return []
    except Exception as e:
        logger.error(f"[SERVICE] get_user_assistants: Error fetching assistants: {str(e)}")
        return []

# New function to get user notification settings
async def get_user_notification_settings(user_id: str) -> Dict[str, Any]:
    """
    Get user's notification settings from guided_setup table.
    
    Args:
        user_id: The user ID to lookup
        
    Returns:
        Dict containing notification settings
    """    
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
    vapi_api_key = settings.VAPI_API_PRIVATE_KEY
    
    if not account_sid or not auth_token:
        error_msg = "Missing Twilio credentials for Vapi registration"
        logger.error(error_msg)
        raise ValueError(error_msg)
        
    if not vapi_api_key:
        error_msg = "Missing Vapi API key for phone number registration"
        logger.error(error_msg)
        raise ValueError(error_msg)

    # Get the user ID associated with this phone number
    user_id = await get_user_id(phone_number)
    if not user_id:
        error_msg = f"No user found for phone number {phone_number}"
        logger.error(error_msg)
        raise ValueError(error_msg)

    # Get the assistant ID from guided setup
    supabase = await get_supabase()
    setup_result = await supabase.table("guided_setup").select("vapi_assistant_id").eq("user_id", user_id).execute()
    
    if not setup_result.data or not setup_result.data[0].get("vapi_assistant_id"):
        error_msg = f"No Vapi assistant ID found for user {user_id}"
        logger.error(error_msg)
        raise ValueError(error_msg)
    
    assistant_id = setup_result.data[0]["vapi_assistant_id"]
    logger.info(f"Found Vapi assistant ID {assistant_id} for user {user_id}")
    
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
                "twilioAuthToken": auth_token,
                "assistantId": assistant_id  # Include the assistant ID in the payload
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
