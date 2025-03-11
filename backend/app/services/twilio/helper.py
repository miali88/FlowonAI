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
        print("[TWILIO HELPER] 🌎 Fetching available country codes from Twilio")
        countries = client.available_phone_numbers.list()
        country_codes = [country.country_code for country in countries]
        print(f"[TWILIO HELPER] ✅ Retrieved {len(country_codes)} country codes: {', '.join(country_codes[:10])}{'...' if len(country_codes) > 10 else ''}")
        return country_codes
    except Exception as e:
        print(f"[TWILIO HELPER] ❌ Error fetching country codes: {str(e)}")
        raise

def get_available_numbers(country_code: str) -> Dict[str, Dict]:
    print(f"[TWILIO HELPER] 🔍 Fetching available numbers for country code: {country_code}")
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
            print(f"[TWILIO HELPER] 📞 Fetching {number_type} numbers for {country_code}")
            # Try to list up to 5 numbers of each type
            numbers = getattr(client.available_phone_numbers(country_code), number_type).list(limit=5)
            numbers_list = [number.phone_number for number in numbers]

            print(f"[TWILIO HELPER] 💲 Fetching pricing information for {country_code}")
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
                print(f"[TWILIO HELPER] ✅ Found {len(numbers_list)} {number_type} numbers for {country_code}")
                
        except Exception as e:
            print(f"[TWILIO HELPER] ❌ Error processing {number_type} numbers for {country_code}: {str(e)}")
            continue
    
    total_numbers = sum(len(group["numbers"]) for group in available_numbers.values())
    print(f"[TWILIO HELPER] 📊 Completed fetching numbers for {country_code}: found {total_numbers} numbers across {len(available_numbers)} types")
    return available_numbers

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

async def purchase_number(phone_number: str, user_id: str) -> Dict[str, Any]:
    """Purchase a phone number from Twilio and associate it with the given user"""
    try:
        print(f"[TWILIO SERVICE] 🔄 Starting purchase_number service function")
        # Check if user is on trial
        supabase = await get_supabase()
        print(f"[TWILIO SERVICE] 🔍 Checking if user {user_id} is on trial")
        user_result = await supabase.table('users').select('is_trial, twilio').eq('id', user_id).execute()
        
        is_trial = False
        if user_result.data and len(user_result.data) > 0:
            is_trial = user_result.data[0].get('is_trial', False)
        
        print(f"[TWILIO SERVICE] ℹ️ User {user_id} trial status: {is_trial}")
        
        # Get API base URL for webhooks
        api_base_url = 'https://flowon.ai/api/v1'
        print(f"[TWILIO SERVICE] 🌐 Using API base URL: {api_base_url}")
        
        # Purchase number through Twilio with proper webhook configuration
        print(f"[TWILIO SERVICE] 📱 Creating number with Twilio: {phone_number}")
        number = client.incoming_phone_numbers.create(
            phone_number=phone_number,
            friendly_name=f"FlowonAI Number - {user_id}",
            voice_url=f"{api_base_url}/twilio/add_to_conference",
            voice_method="POST",
            status_callback=f"{api_base_url}/twilio/call_completed",
            status_callback_method="POST"
        )
        
        print(f"[TWILIO SERVICE] ✅ Successfully purchased number {phone_number} with SID {number.sid}")
        
        # Store in database with current timestamp and trial flag
        from datetime import datetime
        now = datetime.now().isoformat()
        
        print(f"[TWILIO SERVICE] 💾 Storing number in database for user {user_id}")
        db_result = await supabase.table('twilio_numbers').insert({
            'phone_number': phone_number,
            'owner_user_id': user_id,
            'number_sid': number.sid,
            'account_sid': number.account_sid,
            'status': 'active',
            'created_at': now,
            'is_trial_number': is_trial
        }).execute()
        
        if not db_result.data:
            print(f"[TWILIO SERVICE] ❌ Failed to store number {phone_number} in database")
            raise ValueError("Failed to store number in database")
        
        print(f"[TWILIO SERVICE] ✅ Successfully stored number {phone_number} in database")
        
        # Update user's record with the new Twilio number
        print(f"[TWILIO SERVICE] 🔄 Updating user record with new Twilio number")
        # Get existing twilio numbers from user record
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
            print(f"[TWILIO SERVICE] ⚠️ Warning: Failed to update user's twilio numbers list")
        else:
            print(f"[TWILIO SERVICE] ✅ Successfully updated user's twilio numbers list")
        
        print(f"[TWILIO SERVICE] 🏁 purchase_number completed successfully")
        
        return {
            'success': True,
            'phone_number': phone_number,
            'number_sid': number.sid,
            'is_trial_number': is_trial
        }
    except Exception as e:
        print(f"[TWILIO SERVICE] ❌ Error in purchase_number: {str(e)}")
        raise
