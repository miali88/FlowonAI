from typing import Dict, Any, List
from twilio.rest import Client
import os 
from dotenv import load_dotenv
import math
from services.db.supabase_services import supabase_client

load_dotenv()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


def purchase_phone_number(phone_number: str) -> Dict[str, Any]:
    """
    Purchase a specific phone number from Twilio
    
    Args:
        phone_number (str): The phone number to purchase in E.164 format (e.g., '+1234567890')
    
    Returns:
        Dict[str, Any]: Dictionary containing the purchased number details
        
    Raises:
        Exception: If the purchase fails

    Twilio docs:
    https://help.twilio.com/articles/223182728-Using-the-REST-API-to-Search-for-and-Buy-Twilio-Phone-Numbers
    """
    try:
        purchased_number = client.incoming_phone_numbers.create(
            phone_number=phone_number
        )
        return {
            'phone_number': purchased_number.phone_number,
            'sid': purchased_number.sid,
            'friendly_name': purchased_number.friendly_name,
            'capabilities': {
                'voice': purchased_number.capabilities.get('voice', False),
                'sms': purchased_number.capabilities.get('sms', False),
                'mms': purchased_number.capabilities.get('mms', False)
            }
        }
    except Exception as e:
        raise Exception(f"Failed to purchase number: {str(e)}")


def get_country_codes() -> List[str]:
    """Get list of available country codes from Twilio"""
    countries = client.available_phone_numbers.list()
    return [country.country_code for country in countries]


def get_available_numbers(country_code: str) -> Dict[str, Dict]:
    """
    Get available phone numbers and their pricing for a specific country code
    
    Args:
        country_code (str): The country code to search numbers for (e.g., 'US')
        
    Returns:
        Dict[str, Dict]: Dictionary containing available numbers and pricing by type
    """
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
            numbers = getattr(client.available_phone_numbers(country_code), number_type).list(limit=5)
            numbers_list = [number.phone_number for number in numbers]

            country_pricing = client.pricing.v1.phone_numbers.countries(country_code).fetch()
            country_pricing = country_pricing.phone_number_prices

            for price_info in country_pricing:
                base = math.ceil(float(price_info['base_price']))
                current = math.ceil(float(price_info['current_price']))
                pricing_type = price_info['number_type']
                
                for our_type, twilio_type in number_type_mapping.items():
                    if twilio_type == pricing_type:
                        monthly_cost[our_type] = round(max(base, current) * 1.2, 1)

            if numbers_list:
                available_numbers[number_type] = {
                    "monthly_cost": monthly_cost.get(number_type),
                    "numbers": numbers_list
                }
                
        except Exception as e:
            continue
            
    return available_numbers


async def fetch_twilio_numbers(user_id: str) -> list:
    """
    Fetch Twilio numbers associated with a specific user
    
    Args:
        user_id (str): The user ID to fetch numbers for
        
    Returns:
        list: List of phone numbers associated with the user
    """
    result = supabase_client().table('users').select('telephony_numbers').eq('id', user_id).execute()
    if not result.data or not result.data[0].get('telephony_numbers'):
        return []
    return result.data[0]['telephony_numbers']


def cleanup() -> None:
    print("\nCleaning up before exit...")
    ## Ensuring all prior calls are ended
    calls = client.calls.list(status='in-progress')

    if calls:
        for call in calls:
            print(f"Ending call SID: {call.sid}, From: {call.from_formatted}, To: {call.to}, Duration: {call.duration}, Status: {call.status}")
            call = client.calls(call.sid).update(status='completed')
            print(f"Ended call SID: {call.sid}")
    else:
        print('No calls in progress')

