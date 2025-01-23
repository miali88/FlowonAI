from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import logging
import math 
from enum import Enum
import os
from dotenv import load_dotenv
import asyncio

from fastapi import Request, HTTPException
from fastapi.responses import Response, JSONResponse

from services.db.supabase_services import supabase_client
from app.core.config import settings
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Dial, Stream, Connect
from twilio.base.exceptions import TwilioRestException

load_dotenv()

TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')

if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
    raise ValueError("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in the environment")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


livekit_sip_host = os.getenv('LIVEKIT_SIP_HOST')

# Add this near the top of the file, after imports
logger = logging.getLogger(__name__)

class Event(BaseModel):
    name: str
    args: Optional[Dict[str, Any]] = None

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
    countries = client.available_phone_numbers.list()
    return [country.country_code for country in countries]

def get_available_numbers(country_code: str) -> Dict[str, Dict]:
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
            # Try to list up to 5 numbers of each type
            numbers = getattr(client.available_phone_numbers(country_code), number_type).list(limit=5)
            numbers_list = [number.phone_number for number in numbers]

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
                
        except Exception as e:
            continue
            
    return available_numbers

async def fetch_twilio_numbers(user_id: str) -> List[Dict]:
    numbers = supabase_client().table('twilio_numbers').select('*').eq('owner_user_id', user_id).execute()
    return numbers.data

# async def call_admin(call_sid: str) -> None:
#     try:
#         print('\ncall admin function...')
#         print("settings.BASE_URL", settings.BASE_URL)
#         hold_url = f'{settings.BASE_URL}/twilio/add_to_conference'
#         print('hold_url', hold_url)     
#         print('call_sid', call_sid)
        
#         # Validate call_sid format
#         if not call_sid or not call_sid.startswith('CA'):
#             raise ValueError(f"Invalid call SID format: {call_sid}")
            
#         # Try update directly without fetching first
#         client.calls(call_sid).update(
#             url=hold_url,
#             method='POST'
#         )
        
#         print(f"Successfully updated call {call_sid} to URL {hold_url}")
        
#     except TwilioRestException as e:
#         print(f"Twilio error: {e.code} - {e.msg}")
#         print(f"More error details: {e.details}")
#         # Log the full error for debugging
#         print(f"Full error: {vars(e)}")
#         raise
#     except Exception as e:
#         print(f"Unexpected error: {str(e)}")
#         raise

# async def create_outbound_call(to_number: str, from_number: str):
#     """
#     Initiate an outbound call using Twilio
#     """
#     # The url parameter should point to your webhook endpoint that will handle the call
#     call = client.calls.create(
#         to=to_number,
#         from_=from_number,
#         url='https://internally-wise-spaniel.eu.ngrok.io/api/v1/twilio/'  # Replace with your webhook URL
#     )
#     return call


""" CALL HANDLING """
# 1st agent places IC on hold
async def add_to_conference(request: Request) -> JSONResponse:
    try:
        # Get basic call info from request
        form_data = await request.form()
        call_sid = str(form_data['CallSid'])
        twilio_number = str(form_data['To'])
        from_number = str(form_data['From'])
        
        # Create conference name
        conference_name = f"conf_{call_sid}"

        # Create TwiML to move caller to conference immediately
        response = VoiceResponse()
        dial = Dial()
        dial.conference(
            conference_name,
            startConferenceOnEnter=True,
            endConferenceOnExit=False,
            waitUrl='http://twimlets.com/holdmusic?Bucket=com.twilio.music.classical'
        )
        response.append(dial)

        # Update the call with the TwiML
        client.calls(call_sid).update(twiml=str(response))
        logger.info(f'Moved caller {call_sid} to conference {conference_name}')

        # After moving caller, initiate LiveKit bridge asynchronously
        asyncio.create_task(bridge_conference_to_livekit(
            conference_name=conference_name,
            from_number=from_number,
            sip_trunk_number=twilio_number,
            sip_host=livekit_sip_host
        ))
        
        return JSONResponse(content={'message': 'Caller moved to conference'})
        
    except TwilioRestException as e:
        logger.error(f"Twilio error: {e.code} - {e.msg}", exc_info=True)
        raise HTTPException(status_code=e.code, detail=e.msg)
    except Exception as e:
        logger.error(f"Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


async def bridge_conference_to_livekit(conference_name: str, from_number: str, sip_trunk_number: str, sip_host: str) -> None:
    """
    Bridges a Twilio conference to LiveKit via SIP trunk with aggressive retry logic
    """
    try:
        # Create SIP address for LiveKit trunk
        sip_address = f"sip:{sip_trunk_number}@{sip_host};transport=tcp"
        
        # More aggressive retry strategy
        max_retries = 8
        initial_delay = 0.5  # Start with just 500ms delay
        
        for attempt in range(max_retries):
            # Shorter exponential backoff
            await asyncio.sleep(initial_delay * (2 ** attempt))
            
            logger.info(f"Attempt {attempt + 1}/{max_retries}: Looking for conference {conference_name}")
            conferences = client.conferences.list(friendly_name=conference_name, status=['in-progress', 'init'])
            
            if conferences:
                conference = conferences[0]
                logger.info(f"Found conference {conference_name} with SID {conference.sid}")
                
                # Immediately try to create participant
                participant = client.conferences(conference.sid).participants.create(
                    from_=sip_trunk_number,
                    to=sip_address
                )
                logger.info(f"Successfully bridged conference to LiveKit at {sip_address}")
                return participant
            
            logger.info(f"Conference not found, waiting {initial_delay * (2 ** (attempt + 1))}s before next attempt...")
        
        raise Exception(f"Conference {conference_name} not found after {max_retries} attempts")
        
    except TwilioRestException as e:
        logger.error(f"Twilio error while bridging conference: {e.code} - {e.msg}")
        raise
    except Exception as e:
        logger.error(f"Error while bridging conference: {str(e)}")
        raise



# 2nd agent to admin
async def agent_outbound(from_number: str, to_number: str, agent_id: str) -> None:
    try:
        print('calling 2nd agent')
        client.calls.create(
            url=f"{settings.BASE_URL}/twilio/twilio-voice-webhook/{agent_id}",
            to=to_number, from_=from_number,
            timeout=600
        )
        print(f"Call from: {from_number} to: {to_number}")
    except Exception as err:
        print(f"Error in agent_outbound: {err}")



def cleanup() -> None:
    logger.info("Starting cleanup process...")
    try:
        # Verify credentials before making calls
        if not client.auth:
            raise ValueError("Twilio client not properly authenticated")

        # Get active calls with proper authentication
        calls = client.calls.list(status='in-progress', limit=50)  # Added limit for safety

        if calls:
            for call in calls:
                try:
                    logger.info(f"Ending call SID: {call.sid}, From: {call.from_formatted}, "
                              f"To: {call.to}, Status: {call.status}")
                    
                    client.calls(call.sid).update(status='completed')
                    logger.info(f"Successfully ended call SID: {call.sid}")
                    
                except TwilioRestException as call_error:
                    logger.error(f"Failed to end call {call.sid}: {str(call_error)}")
                    continue
        else:
            logger.info('No active calls found to clean up')
            
    except TwilioRestException as e:
        logger.error(f"Twilio API error during cleanup: {e.code} - {e.msg}")
        raise
    except ValueError as e:
        logger.error(f"Authentication error: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during cleanup: {str(e)}")
        raise

