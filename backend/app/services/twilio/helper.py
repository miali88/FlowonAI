from pydantic import BaseModel, Field
from typing import Dict, Any, List
from enum import Enum
import math
import logging

from app.services.twilio.client import client
from app.clients.supabase_client import get_supabase

logger = logging.getLogger(__name__)

class NumberType(str, Enum):
    LOCAL = "local"
    TOLL_FREE = "toll_free"
    MOBILE = "mobile"
    NATIONAL = "national"
    
class NumberGroup(BaseModel):
    monthly_cost: float = Field(ge=0.0)  # ensure cost is non-negative
    numbers: List[str] 

class PhoneNumberSchema(BaseModel):
    local: NumberGroup | None = None
    toll_free: NumberGroup | None = None
    mobile: NumberGroup | None = None
    national: NumberGroup | None = None

def get_country_codes() -> List[str]:
    try:
        logger.info("Fetching available country codes from Twilio")
        countries = client.available_phone_numbers.list()
        country_codes = [country.country_code for country in countries]
        logger.info(f"Retrieved {len(country_codes)} country codes: {', '.join(country_codes[:10])}{'...' if len(country_codes) > 10 else ''}")
        return country_codes
    except Exception as e:
        logger.error(f"Error fetching country codes: {str(e)}")
        raise

async def fetch_twilio_numbers(user_id: str) -> str:
    try:
        supabase = await get_supabase()
        logger.info(f"Fetching Twilio numbers for user: {user_id}")
        user = await supabase.table('users').select('telephony_numbers').eq('id', user_id).execute()
        
        if not user.data or not user.data[0].get('telephony_numbers'):
            logger.debug(f"No telephony numbers found for user {user_id}")
            return None
            
        telephony_numbers = user.data[0]['telephony_numbers']
        twilio_numbers = telephony_numbers.get('twilio', [])
        
        if not twilio_numbers:
            logger.debug(f"No Twilio numbers found for user {user_id}")
            return None
            
        first_number = twilio_numbers[0]
        logger.debug(f"Retrieved first Twilio number for user {user_id}: {first_number}")
        return first_number
    except Exception as e:
        logger.error(f"Error fetching Twilio number for user {user_id}: {str(e)}")
        raise

def get_available_numbers(country_code: str) -> Dict[str, Dict]:
    logger.info(f"Fetching available numbers for country code: {country_code}")
    # Map our internal types to Twilio's pricing types
    number_type_mapping = {
        'local': 'local',
        'toll_free': 'toll free',
        'mobile': 'mobile',
        'national': 'national'
    }
    
    # For GB (United Kingdom), prioritize toll-free numbers to avoid regulatory issues
    if country_code == "GB":
        logger.info("UK detected - prioritizing toll-free numbers to avoid regulatory complications")
        number_types = ['toll_free', 'mobile', 'local', 'national']  # Prioritize toll-free for GB
    else:
        number_types = list(number_type_mapping.keys())
        
    available_numbers: Dict[str, Dict] = {}
    monthly_cost: Dict[str, float] = {}

    for number_type in number_types:
        try:
            logger.info(f"Fetching {number_type} numbers for {country_code}")
            # Try to list up to 5 numbers of each type
            numbers = getattr(client.available_phone_numbers(country_code), number_type).list(limit=5)
            numbers_list = [number.phone_number for number in numbers]

            logger.info(f"Fetching pricing information for {country_code}")
            country_pricing = client.pricing.v1.phone_numbers.countries(country_code).fetch()
            country_pricing = country_pricing.phone_number_prices

            # Calculate highest price for each number type
            for price_info in country_pricing:
                base = math.ceil(float(price_info['base_price']))
                current = math.ceil(float(price_info['current_price']))
                pricing_type = price_info['number_type']
                
                # Match Twilio's pricing type to our internal type
                for our_type, twilio_type in number_type_mapping.items():
                    if twilio_type == pricing_type:
                        monthly_cost[our_type] = round(max(base, current) * 1.2, 1)

            # Only add to dictionary if numbers were found
            if numbers_list:
                available_numbers[number_type] = {
                    "monthly_cost": monthly_cost.get(number_type),
                    "numbers": numbers_list
                }
                logger.info(f"Found {len(numbers_list)} {number_type} numbers for {country_code}")
                
                # For GB, immediately return if we found mobile numbers
                if country_code == "GB" and number_type == "mobile" and numbers_list:
                    logger.info("Found GB mobile numbers, prioritizing these to avoid regulatory issues")
                    # Create a new dictionary with only mobile numbers at the top
                    prioritized_numbers = {"mobile": available_numbers["mobile"]}
                    total_numbers = len(numbers_list)
                    logger.info(f"Completed fetching numbers for {country_code}: returning {total_numbers} mobile numbers")
                    return prioritized_numbers
                
        except Exception as e:
            logger.error(f"Error processing {number_type} numbers for {country_code}: {str(e)}")
            continue
    
    total_numbers = sum(len(group["numbers"]) for group in available_numbers.values())
    logger.info(f"Completed fetching numbers for {country_code}: found {total_numbers} numbers across {len(available_numbers)} types")
    return available_numbers

async def purchase_number(phone_number: str) -> Dict[str, Any]:
    """Purchase a phone number from Twilio
    
    Args:
        phone_number: The phone number to purchase from Twilio
        
    Returns:
        Dict with the purchase result containing SIDs
    """
    try:
        logger.info("Starting purchase_number function")
        
        # Get API base URL for webhooks
        vapi_base_url = 'https://api.vapi.ai/twilio/inbound_call'
        logger.info(f"Using API base URL: {vapi_base_url}")
        api_base_url = 'https://internally-wise-spaniel.eu.ngrok.io/api/v1'
        
        # Identify UK numbers
        is_uk_number = phone_number.startswith('+44')
        is_mobile = False
        
        # UK mobile numbers start with +447
        if is_uk_number and phone_number.startswith('+447'):
            is_mobile = True
            logger.info(f"Detected UK mobile number: {phone_number}")
        
        # Base parameters for number purchase
        purchase_params = {
            'phone_number': phone_number,
            'friendly_name': f"FlowonAI Number",
            'voice_url': vapi_base_url,
            'voice_method': "POST",
            'status_callback': f"{api_base_url}/twilio/call_completed",
            'status_callback_method': "POST"
        }
        
        # UK mobile numbers need specific address and bundle SID
        if is_uk_number and is_mobile:
            logger.info("UK mobile number requires address and specific bundle")
            purchase_params['address_sid'] = 'ADc0fef05afa186248e701be32efc66b02'
            purchase_params['bundle_sid'] = 'BU7c5bf3064734bb52c444977d725e2661'
        # For non-UK numbers, just use address
        else:
            logger.info("Non-UK or non-mobile UK number, using standard purchase parameters")
            purchase_params['address_sid'] = 'AD3a5c7d3df0ef707bc8bedd4ed91c7d06'
        
        # Purchase number through Twilio with proper webhook configuration
        logger.info(f"Creating number with Twilio: {phone_number}")
        logger.debug(f"Purchase parameters: {purchase_params}")
        number = client.incoming_phone_numbers.create(**purchase_params)
        
        logger.info(f"Successfully purchased number {phone_number} with SID {number.sid}")
        logger.info("purchase_number completed successfully")
        
        return {
            'success': True,
            'phone_number': phone_number,
            'number_sid': number.sid,
            'account_sid': number.account_sid
        }
    except Exception as e:
        logger.error(f"Error in purchase_number: {str(e)}")
        raise

async def release_number(user_id: str, phone_number: str) -> Dict[str, Any]:
    """Release a Twilio phone number and remove it from user's telephony_numbers
    
    Args:
        user_id: The ID of the user whose number is being released
        phone_number: The phone number to release
        
    Returns:
        Dict with the release result status
    """
    try:
        logger.info(f"Starting release_number function for user {user_id}")
        logger.info(f"Attempting to release number: {phone_number}")
        
        # First, get the user's current telephony numbers
        supabase = await get_supabase()
        user = await supabase.table('users').select('telephony_numbers').eq('id', user_id).execute()
        
        if not user.data or not user.data[0].get('telephony_numbers'):
            logger.warning(f"No telephony numbers found for user {user_id}")
            return {'success': False, 'error': 'No telephony numbers found for user'}
            
        telephony_numbers = user.data[0]['telephony_numbers']
        twilio_numbers = telephony_numbers.get('twilio', [])
        
        if phone_number not in twilio_numbers:
            logger.warning(f"Number {phone_number} not found in user's Twilio numbers")
            return {'success': False, 'error': 'Number not found in user\'s Twilio numbers'}
        
        # Remove the number from the user's telephony_numbers
        twilio_numbers.remove(phone_number)
        telephony_numbers['twilio'] = twilio_numbers
        
        # Update the user's record in Supabase
        logger.info(f"Updating user's telephony numbers in database")
        await supabase.table('users').update({
            'telephony_numbers': telephony_numbers
        }).eq('id', user_id).execute()
        
        # Find and release the number in Twilio
        logger.info(f"Finding number in Twilio system")
        incoming_numbers = client.incoming_phone_numbers.list(phone_number=phone_number)
        
        if not incoming_numbers:
            logger.warning(f"Number {phone_number} not found in Twilio system")
            return {'success': False, 'error': 'Number not found in Twilio system'}
            
        # Release the number
        logger.info(f"Releasing number from Twilio")
        incoming_numbers[0].delete()
        
        logger.info(f"Successfully released number {phone_number}")
        return {
            'success': True,
            'message': f'Successfully released number {phone_number}'
        }
        
    except Exception as e:
        logger.error(f"Error in release_number: {str(e)}")
        raise

