from typing import Dict, Any, Optional, Tuple
import logging
from fastapi import HTTPException
from datetime import datetime

from app.services.twilio.helper import get_available_numbers, purchase_number
from app.clients.supabase_client import get_supabase
from app.services.vapi.utils import register_phone_number_with_vapi

logger = logging.getLogger(__name__)

async def check_user_has_number(user_id: str) -> Tuple[bool, Optional[str]]:
    """
    Check if a user already has a phone number assigned
    
    Args:
        user_id: The ID of the user to check
        
    Returns:
        Tuple containing:
        - Boolean indicating if user has a number
        - The phone number if exists, None otherwise
    """
    logger.info(f"Checking if user {user_id} already has a phone number")
    supabase = await get_supabase()
    
    # Query twilio_numbers table for numbers owned by this user
    result = await supabase.table("twilio_numbers").select("phone_number").eq("owner_user_id", user_id).execute()
    
    if result.data and len(result.data) > 0:
        # User already has at least one number
        number = result.data[0].get("phone_number")
        logger.info(f"User {user_id} already has phone number: {number}")
        return True, number
    
    logger.info(f"User {user_id} does not have any phone numbers")
    return False, None

async def store_phone_number(
    phone_number: str,
    user_id: str,
    number_sid: str,
    account_sid: str,
    is_trial: bool
) -> Dict[str, Any]:
    """
    Store a purchased phone number in the database across multiple tables
    
    Args:
        phone_number: The purchased phone number
        user_id: The ID of the user who owns the number
        number_sid: The Twilio SID for the number
        account_sid: The Twilio account SID
        is_trial: Whether the user is on a trial
        
    Returns:
        Dict with storage result information including success status of each operation
    """
    logger.info(f"Storing phone number {phone_number} for user {user_id}")
    supabase = await get_supabase()
    now = datetime.now().isoformat()
    
    # Track results of each operation
    results = {
        'twilio_numbers_success': False,
        'guided_setup_success': False,
        'users_success': False,
        'overall_success': False,
        'error_messages': []
    }
    
    # 1. Store in twilio_numbers table
    logger.info(f"Storing number in twilio_numbers table")
    try:
        db_result = await supabase.table('twilio_numbers').insert({
            'phone_number': phone_number,
            'owner_user_id': user_id,
            'number_sid': number_sid,
            'account_sid': account_sid,
            'status': 'active',
            'created_at': now,
            'is_trial_number': is_trial
        }).execute()
        
        if not db_result.data:
            logger.error(f"Failed to store number {phone_number} in twilio_numbers table")
            results['error_messages'].append("Failed to store number in twilio_numbers table")
        else:
            logger.info(f"Successfully stored number in twilio_numbers table")
            results['twilio_numbers_success'] = True
    except Exception as e:
        error_msg = f"Error storing in twilio_numbers table: {str(e)}"
        logger.error(error_msg)
        results['error_messages'].append(error_msg)
    
    # 2. Update the guided_setup table
    logger.info(f"Updating guided_setup table with number {phone_number}")
    try:
        guided_setup_result = await supabase.table('guided_setup').update({
            'phone_number': phone_number
        }).eq('user_id', user_id).execute()
        
        if not guided_setup_result.data:
            logger.warning(f"Failed to update guided_setup table - record may not exist for user {user_id}")
            results['error_messages'].append("Failed to update guided_setup table - record may not exist")
        else:
            logger.info(f"Successfully updated guided_setup table")
            results['guided_setup_success'] = True
    except Exception as e:
        error_msg = f"Error updating guided_setup table: {str(e)}"
        logger.error(error_msg)
        results['error_messages'].append(error_msg)
    
    # 3. Update user's record with the new Twilio number
    logger.info(f"Updating user record with new Twilio number")
    try:
        # Get existing telephony_numbers from user record
        user_result = await supabase.table('users').select('telephony_numbers').eq('id', user_id).execute()
        
        # Initialize the telephony_numbers structure if needed
        telephony_numbers = {}
        twilio_numbers = []
        
        if user_result.data and len(user_result.data) > 0:
            # Extract the existing telephony_numbers JSONB
            telephony_numbers = user_result.data[0].get('telephony_numbers', {}) or {}
            
            # Extract the existing Twilio numbers array or create it
            if isinstance(telephony_numbers, dict):
                twilio_numbers = telephony_numbers.get('twilio', []) or []
            else:
                logger.warning(f"telephony_numbers is not a dictionary: {telephony_numbers}")
                telephony_numbers = {}
                twilio_numbers = []
        
        # Add the new number if it's not already in the list
        if phone_number not in twilio_numbers:
            twilio_numbers.append(phone_number)
        
        # Update the telephony_numbers structure
        telephony_numbers['twilio'] = twilio_numbers
        
        # Update the user record with the modified telephony_numbers JSONB
        logger.info(f"Updating users table with new telephony_numbers: {telephony_numbers}")
        user_update_result = await supabase.table('users').update({
            'telephony_numbers': telephony_numbers
        }).eq('id', user_id).execute()
        
        if not user_update_result.data:
            logger.warning(f"Failed to update user's telephony_numbers")
            results['error_messages'].append("Failed to update user's telephony_numbers")
        else:
            logger.info(f"Successfully updated user's telephony_numbers with Twilio number: {phone_number}")
            results['users_success'] = True
    except Exception as e:
        error_msg = f"Error updating users table: {str(e)}"
        logger.error(error_msg)
        results['error_messages'].append(error_msg)
    
    # Determine overall success - consider successful if at least the twilio_numbers entry was created
    # since that's the most critical piece
    results['overall_success'] = results['twilio_numbers_success']
    
    logger.info(f"Completed storing phone number {phone_number} for user {user_id}")
    logger.info(f"Operation results: {results}")
    
    return {
        'success': results['overall_success'],
        'phone_number': phone_number,
        'number_sid': number_sid,
        'is_trial_number': is_trial,
        'operation_results': results
    }

async def provision_user_phone_number(
    country_code: str,
    number_type: str,
    area_code: Optional[str],
    user_id: str
) -> Dict[str, Any]:
    """
    Handle provisioning of a phone number for a user
    
    Args:
        country_code: The country code for the number
        number_type: The type of number (local, toll_free, etc.)
        area_code: Optional area code for the number
        user_id: The ID of the user purchasing the number
        
    Returns:
        Dict with purchase result information
        
    Raises:
        HTTPException: If purchase fails or no numbers available
    """
    logger.info(f"Starting phone number provisioning flow...")
    logger.info(f"Parameters: user={user_id}, country_code={country_code}, number_type={number_type}")
    
    if not user_id:
        logger.warning(f"Unauthorized attempt to provision phone number - no current user")
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    # Check if user already has a phone number
    has_number, existing_number = await check_user_has_number(user_id)
    if has_number:
        logger.info(f"User {user_id} already has phone number {existing_number}. Skipping provisioning.")
        
        # Even though we're not purchasing a new number, we should still update the guided_setup table
        # to ensure that the setup process continues smoothly
        try:
            supabase = await get_supabase()
            logger.info(f"Updating guided_setup table with existing number {existing_number} for user {user_id}")
            await supabase.table('guided_setup').update({
                'phone_number': existing_number
            }).eq('user_id', user_id).execute()
            logger.info(f"Successfully updated guided_setup table for user {user_id}")
        except Exception as e:
            # Log but don't fail if this update doesn't work
            logger.warning(f"Failed to update guided_setup table with existing number: {str(e)}")
        
        return {
            "success": True,
            "number": existing_number,
            "message": "User already has a phone number assigned",
            "already_exists": True
        }
    
    # Get an available number from the specified country and type
    logger.info(f"Fetching available numbers for country_code={country_code}, type={number_type}")
    available_numbers = get_available_numbers(country_code)
    
    if not available_numbers or number_type not in available_numbers:
        logger.error(f"No available {number_type} numbers found for country code {country_code}")
        raise HTTPException(
            status_code=404, 
            detail=f"No available {number_type} numbers found for country code {country_code}"
        )
    
    # Get the first available number of the requested type
    phone_number = available_numbers[number_type]["numbers"][0]
    logger.info(f"Selected phone number {phone_number} for user {user_id}")
    
    try:
        # Check if user is on trial
        supabase = await get_supabase()
        logger.info(f"Checking if user {user_id} is on trial")
        user_result = await supabase.table('users').select('is_trial').eq('id', user_id).execute()
        
        is_trial = False
        if user_result.data and len(user_result.data) > 0:
            is_trial = user_result.data[0].get('is_trial', False)
        
        logger.info(f"User {user_id} trial status: {is_trial}")
        
        # Purchase the number from Twilio
        logger.info(f"Initiating purchase of number {phone_number} for user {user_id}")
        purchase_result = await purchase_number(phone_number=phone_number)
        
        # Store the purchased number in database
        logger.info(f"Storing purchased number in database")
        storage_result = await store_phone_number(
            phone_number=phone_number,
            user_id=user_id,
            number_sid=purchase_result['number_sid'],
            account_sid=purchase_result['account_sid'],
            is_trial=is_trial
        )
        
        # Register the number with Vapi instead of LiveKit
        logger.info(f"Registering number {phone_number} with Vapi")
        try:
            vapi_result = await register_phone_number_with_vapi(
                phone_number=phone_number,
                twilio_account_sid=purchase_result['account_sid'],
                twilio_auth_token=None  # Will be fetched from environment variables
            )
            logger.info(f"Successfully registered number {phone_number} with Vapi")
            logger.debug(f"Vapi registration result: {vapi_result}")
        except Exception as vapi_error:
            # Log the error but don't fail the entire process if Vapi registration fails
            logger.error(f"Failed to register number with Vapi: {str(vapi_error)}")
            # We'll continue with the process even if this fails - the number can be registered manually later
        
        # Add additional info to the response
        result = {
            "success": True,
            "number": phone_number,
            "number_sid": purchase_result['number_sid'],
            "number_type": number_type,
            "country_code": country_code,
            "already_exists": False
        }
        
        # Also add monthly cost if available
        if "monthly_cost" in available_numbers[number_type]:
            result["monthly_cost"] = available_numbers[number_type]["monthly_cost"]
            logger.info(f"Monthly cost for number: {available_numbers[number_type]['monthly_cost']}")
        
        logger.info(f"Successfully provisioned and stored number {phone_number} for user {user_id}")
        logger.info(f"Provisioning result: {result}")
        return result
        
    except Exception as e:
        logger.error(f"Failed to provision number: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to provision number: {str(e)}") 