from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from enum import Enum
import math
import logging

from services.twilio.client import client
from services.supabase.client import get_supabase

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
        logger.debug(f"Retrieved {len(country_codes)} country codes")
        return country_codes
    except Exception as e:
        logger.error(f"Error fetching country codes: {str(e)}")
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
    number_types = list(number_type_mapping.keys())
    available_numbers: Dict[str, Dict] = {}
    monthly_cost: Dict[str, float] = {}

    for number_type in number_types:
        try:
            logger.debug(f"Fetching {number_type} numbers for {country_code}")
            # Try to list up to 5 numbers of each type
            numbers = getattr(client.available_phone_numbers(country_code), number_type).list(limit=5)
            numbers_list = [number.phone_number for number in numbers]

            logger.debug(f"Fetching pricing information for {country_code}")
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
                logger.debug(f"Found {len(numbers_list)} {number_type} numbers")
                
        except Exception as e:
            logger.error(f"Error processing {number_type} numbers for {country_code}: {str(e)}")
            continue
            
    logger.info(f"Completed fetching numbers for {country_code}")
    return available_numbers

async def fetch_twilio_numbers(user_id: str) -> List[Dict]:
    try:
        supabase = await get_supabase()
        logger.info(f"Fetching Twilio numbers for user: {user_id}")
        numbers = await supabase.table('twilio_numbers').select('*').eq('owner_user_id', user_id).execute()
        logger.debug(f"Retrieved {len(numbers.data)} numbers for user {user_id}")
        return numbers.data
    except Exception as e:
        logger.error(f"Error fetching Twilio numbers for user {user_id}: {str(e)}")
        raise

""" TESTING PURCHASE OF NUMBER """
def purchase_twilio_number(number: str):
    try:
        client.incoming_phone_numbers.create(phone_number=number)
    except Exception as e:
        logger.error(f"Error purchasing Twilio number: {str(e)}")
        raise
