from typing import Dict, Any, List, Optional
import logging
from fastapi import HTTPException

from app.services.twilio.helper import get_available_numbers, purchase_number

logger = logging.getLogger(__name__)

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
        
        # Add additional info to the response
        purchase_result["number_type"] = number_type
        purchase_result["country_code"] = country_code
        
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