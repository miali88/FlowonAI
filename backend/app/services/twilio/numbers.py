from typing import Dict, Any, Optional, Tuple
import logging
from fastapi import HTTPException

from app.services.twilio.helper import get_available_numbers, purchase_number
from app.clients.supabase_client import get_supabase

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

async def purchase_user_phone_number(
    country_code: str,
    number_type: str,
    area_code: Optional[str],
    user_id: str
) -> Dict[str, Any]:
    """
    Handle purchase of a phone number for a user
    
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
    logger.info(f"Starting purchase phone number flow...")
    logger.info(f"Parameters: user={user_id}, country_code={country_code}, number_type={number_type}")
    
    if not user_id:
        logger.warning(f"Unauthorized attempt to purchase phone number - no current user")
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    # Check if user already has a phone number
    has_number, existing_number = await check_user_has_number(user_id)
    if has_number:
        logger.info(f"User {user_id} already has phone number {existing_number}. Skipping purchase.")
        
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
        # Use the purchase_number function from helper
        logger.info(f"Initiating purchase of number {phone_number} for user {user_id}")
        purchase_result = await purchase_number(
            phone_number=phone_number, 
            user_id=user_id
        )
        
        # Add the purchased number to the guided_setup table
        try:
            supabase = await get_supabase()
            logger.info(f"Updating guided_setup table with new number {phone_number} for user {user_id}")
            await supabase.table('guided_setup').update({
                'phone_number': phone_number
            }).eq('user_id', user_id).execute()
            logger.info(f"Successfully updated guided_setup table for user {user_id}")
        except Exception as e:
            # Log but don't fail if this update doesn't work
            logger.warning(f"Failed to update guided_setup table: {str(e)}")
        
        # Add additional info to the response
        purchase_result["number_type"] = number_type
        purchase_result["country_code"] = country_code
        purchase_result["already_exists"] = False
        
        # Also add monthly cost if available
        if "monthly_cost" in available_numbers[number_type]:
            purchase_result["monthly_cost"] = available_numbers[number_type]["monthly_cost"]
            logger.info(f"Monthly cost for number: {available_numbers[number_type]['monthly_cost']}")
        
        logger.info(f"Successfully purchased and stored number {phone_number} for user {user_id}")
        logger.info(f"Purchase result: {purchase_result}")
        return purchase_result
        
    except Exception as e:
        logger.error(f"Failed to purchase number from Twilio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to purchase number: {str(e)}") 