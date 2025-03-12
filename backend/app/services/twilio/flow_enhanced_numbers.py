"""
Enhanced version of the numbers.py module with detailed flow tracking
for debugging and visualizing the phone number provisioning process.
"""

from typing import Dict, Any, Optional, Tuple
import logging
import uuid
from fastapi import HTTPException
from datetime import datetime

from app.services.twilio.helper import get_available_numbers, purchase_number
from app.clients.supabase_client import get_supabase
from app.services.livekit.sip_trunk import number_purchased
from app.utils.flow_tracker import FlowTracker

logger = logging.getLogger(__name__)

# Configure flow tracker logger for more detailed output
flow_logger = logging.getLogger("flow_tracker")
flow_logger.setLevel(logging.DEBUG)

# Add console handler if not already present
if not flow_logger.handlers:
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(
        '%(asctime)s [%(levelname)s] [FLOW] %(message)s'
    ))
    flow_logger.addHandler(console_handler)

@FlowTracker.track_function()
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

@FlowTracker.track_function()
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
        Dict with storage result information
    """
    logger.info(f"Storing phone number {phone_number} for user {user_id}")
    supabase = await get_supabase()
    now = datetime.now().isoformat()
    
    try:
        # 1. Store in twilio_numbers table
        logger.info(f"Storing number in twilio_numbers table")
        FlowTracker.track_step("store_in_twilio_numbers_table", {
            "phone_number": phone_number,
            "user_id": user_id
        })
        
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
            error_msg = "Failed to store number in twilio_numbers table"
            logger.error(error_msg)
            FlowTracker.track_step("db_error", {"error": error_msg})
            raise ValueError(error_msg)
        
        logger.info(f"Successfully stored number in twilio_numbers table")
        FlowTracker.track_step("twilio_numbers_stored", {"success": True})
        
        # 2. Update the guided_setup table
        logger.info(f"Updating guided_setup table with number {phone_number}")
        FlowTracker.track_step("update_guided_setup", {
            "phone_number": phone_number
        })
        
        guided_setup_result = await supabase.table('guided_setup').update({
            'phone_number': phone_number
        }).eq('user_id', user_id).execute()
        
        if not guided_setup_result.data:
            logger.warning(f"Failed to update guided_setup table - record may not exist for user {user_id}")
            FlowTracker.track_step("guided_setup_warning", {
                "warning": "Record may not exist for user"
            })
        else:
            logger.info(f"Successfully updated guided_setup table")
            FlowTracker.track_step("guided_setup_updated", {"success": True})
        
        # 3. Update user's record with the new Twilio number
        logger.info(f"Updating user record with new Twilio number")
        FlowTracker.track_step("update_user_twilio_list", {
            "phone_number": phone_number
        })
        
        # Get existing twilio numbers from user record
        user_result = await supabase.table('users').select('twilio').eq('id', user_id).execute()
        twilio_numbers = []
        
        if user_result.data and len(user_result.data) > 0 and user_result.data[0].get('twilio'):
            twilio_numbers = user_result.data[0].get('twilio', [])
        
        # Add the new number if it's not already in the list
        if phone_number not in twilio_numbers:
            twilio_numbers.append(phone_number)
            
        # Update the user record
        user_update_result = await supabase.table('users').update({
            'twilio': twilio_numbers
        }).eq('id', user_id).execute()
        
        if not user_update_result.data:
            logger.warning(f"Failed to update user's twilio numbers list")
            FlowTracker.track_step("user_update_warning", {
                "warning": "Failed to update user's twilio numbers list"
            })
        else:
            logger.info(f"Successfully updated user's twilio numbers list")
            FlowTracker.track_step("user_updated", {"success": True})
        
        logger.info(f"Completed storing phone number {phone_number} for user {user_id}")
        
        return {
            'success': True,
            'phone_number': phone_number,
            'number_sid': number_sid,
            'is_trial_number': is_trial
        }
    except Exception as e:
        logger.error(f"Error storing phone number: {str(e)}")
        FlowTracker.track_step("store_phone_number_error", {"error": str(e)})
        raise

@FlowTracker.track_function()
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
    # Start flow tracking
    flow_id = f"provision_number_{uuid.uuid4().hex[:8]}"
    FlowTracker.start_flow(flow_id, f"Phone number provisioning flow for user {user_id}")
    
    logger.info(f"Starting phone number provisioning flow with ID: {flow_id}")
    logger.info(f"Parameters: user={user_id}, country_code={country_code}, number_type={number_type}")
    
    try:
        if not user_id:
            error_msg = "Unauthorized attempt to provision phone number - no current user"
            logger.warning(error_msg)
            FlowTracker.track_step("authorization_error", {"error": error_msg})
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        # Check if user already has a phone number
        FlowTracker.track_step("checking_existing_number", {"user_id": user_id})
        has_number, existing_number = await check_user_has_number(user_id)
        
        if has_number:
            logger.info(f"User {user_id} already has phone number {existing_number}. Skipping provisioning.")
            FlowTracker.track_step("number_already_exists", {"number": existing_number})
            
            # Even though we're not purchasing a new number, we should still update the guided_setup table
            # to ensure that the setup process continues smoothly
            try:
                supabase = await get_supabase()
                logger.info(f"Updating guided_setup table with existing number {existing_number} for user {user_id}")
                FlowTracker.track_step("update_guided_setup_existing", {
                    "number": existing_number,
                    "user_id": user_id
                })
                
                await supabase.table('guided_setup').update({
                    'phone_number': existing_number
                }).eq('user_id', user_id).execute()
                
                logger.info(f"Successfully updated guided_setup table for user {user_id}")
                FlowTracker.track_step("guided_setup_updated", {"success": True})
            except Exception as e:
                # Log but don't fail if this update doesn't work
                logger.warning(f"Failed to update guided_setup table with existing number: {str(e)}")
                FlowTracker.track_step("guided_setup_warning", {"warning": str(e)})
            
            result = {
                "success": True,
                "number": existing_number,
                "message": "User already has a phone number assigned",
                "already_exists": True
            }
            
            FlowTracker.end_flow(flow_id)
            return result
        
        # Get an available number from the specified country and type
        logger.info(f"Fetching available numbers for country_code={country_code}, type={number_type}")
        FlowTracker.track_step("fetch_available_numbers", {
            "country_code": country_code,
            "number_type": number_type
        })
        
        available_numbers = get_available_numbers(country_code)
        
        if not available_numbers:
            error_msg = f"No available numbers found for country code {country_code}"
            logger.error(error_msg)
            FlowTracker.track_step("no_numbers_available", {"error": error_msg})
            raise HTTPException(status_code=404, detail=error_msg)
            
        if number_type not in available_numbers:
            error_msg = f"No available {number_type} numbers found for country code {country_code}"
            logger.error(error_msg)
            FlowTracker.track_step("no_numbers_of_type", {
                "error": error_msg,
                "available_types": list(available_numbers.keys())
            })
            raise HTTPException(status_code=404, detail=error_msg)
        
        # Get the first available number of the requested type
        phone_number = available_numbers[number_type]["numbers"][0]
        logger.info(f"Selected phone number {phone_number} for user {user_id}")
        FlowTracker.track_step("number_selected", {"number": phone_number})
        
        # Check if user is on trial
        supabase = await get_supabase()
        logger.info(f"Checking if user {user_id} is on trial")
        FlowTracker.track_step("check_trial_status", {"user_id": user_id})
        
        user_result = await supabase.table('users').select('is_trial').eq('id', user_id).execute()
        
        is_trial = False
        if user_result.data and len(user_result.data) > 0:
            is_trial = user_result.data[0].get('is_trial', False)
        
        logger.info(f"User {user_id} trial status: {is_trial}")
        FlowTracker.track_step("trial_status_result", {"is_trial": is_trial})
        
        # Purchase the number from Twilio
        logger.info(f"Initiating purchase of number {phone_number} for user {user_id}")
        FlowTracker.track_step("purchase_number", {"number": phone_number})
        
        purchase_result = await purchase_number(phone_number=phone_number)
        FlowTracker.track_step("purchase_result", {
            "success": True,
            "number_sid": purchase_result.get('number_sid'),
            "account_sid": purchase_result.get('account_sid'),
        })
        
        # Store the purchased number in database
        logger.info(f"Storing purchased number in database")
        FlowTracker.track_step("store_number", {"number": phone_number})
        
        storage_result = await store_phone_number(
            phone_number=phone_number,
            user_id=user_id,
            number_sid=purchase_result['number_sid'],
            account_sid=purchase_result['account_sid'],
            is_trial=is_trial
        )
        
        # Register the number with LiveKit SIP trunk system
        logger.info(f"Registering number {phone_number} with LiveKit SIP")
        FlowTracker.track_step("register_with_livekit", {"number": phone_number})
        
        try:
            await number_purchased(phone_number)
            logger.info(f"Successfully registered number {phone_number} with LiveKit")
            FlowTracker.track_step("livekit_registration", {"success": True})
        except Exception as sip_error:
            # Log the error but don't fail the entire process if LiveKit registration fails
            logger.error(f"Failed to register number with LiveKit: {str(sip_error)}")
            FlowTracker.track_step("livekit_registration_error", {"error": str(sip_error)})
        
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
        
        # End flow tracking
        FlowTracker.track_step("provisioning_complete", result)
        FlowTracker.end_flow(flow_id)
        
        return result
        
    except Exception as e:
        # Track error in flow and end flow tracking
        FlowTracker.track_step("provisioning_error", {"error": str(e)})
        FlowTracker.end_flow(flow_id)
        
        logger.error(f"Failed to provision number: {str(e)}")
        if isinstance(e, HTTPException):
            raise
        
        raise HTTPException(status_code=500, detail=f"Failed to provision number: {str(e)}") 