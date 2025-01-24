from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import logging
import math 
from enum import Enum
import os
import time
from dotenv import load_dotenv
from dataclasses import dataclass

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

from services.db.supabase_services import supabase_client
from services.livekit.inbound_trunk import main
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Dial
from twilio.base.exceptions import TwilioRestException

load_dotenv()

client = Client(os.getenv('TWILIO_ACCOUNT_SID'), os.getenv('TWILIO_AUTH_TOKEN'))
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

@dataclass
class SIPConfig:
    sip_trunk_number: str
    sip_host: str = livekit_sip_host  # Using the existing livekit_sip_host from env
    username: str = "flowon"
    password: str = "very_secret"
    webhook_url: str = f"{os.getenv('DEV_SERVER')}/twilio/conference-events"

async def get_sip_config(twilio_number: str) -> SIPConfig:
    """
    Create SIP configuration for a given Twilio number
    
    Args:
        twilio_number: The Twilio number from the form data
        
    Returns:
        SIPConfig: Configuration object with SIP settings
    """
    return SIPConfig(
        sip_trunk_number=twilio_number
    )

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


async def fetch_twilio_numbers(user_id: str) -> list:
    # Select only the telephony_numbers column for the specific user
    result = supabase_client().table('users').select('telephony_numbers').eq('id', user_id).execute()
    if not result.data or not result.data[0].get('telephony_numbers'):
        return []
    return result.data[0]['telephony_numbers']


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
        logger.info('Starting add_to_conference')
        form_data = await request.form()
        logger.debug(f'Received form data: {form_data}')
        
        call_sid = str(form_data['CallSid'])
        twilio_number = str(form_data['To'])
        from_number = str(form_data['From'])

        logger.info(f'Processing call SID: {call_sid}') 
        # Generate unique conference name using call parameters
        conference_name = f"conf_{call_sid}_{int(time.time())}"
        
        # Get SIP configuration from request or database
        sip_config = await get_sip_config(twilio_number)  # You'll need to implement this
        
        if not sip_config:
            logger.error(f'No SIP configuration found for number: {twilio_number}')
            raise HTTPException(status_code=400, detail='Invalid SIP configuration')

        # Check call status before proceeding
        call = client.calls(call_sid).fetch()
        logger.debug(f'Current call status: {call.status}')
        
        if call.status not in ['in-progress', 'ringing']:
            logger.error(f'Call is in invalid state: {call.status}')
            raise HTTPException(status_code=400, detail=f'Call is in invalid state: {call.status}')

        # Move the initial caller to the conference
        logger.debug(f'Moving caller to conference: {conference_name}')
        response = VoiceResponse()
        dial = Dial()
        dial.conference(
            conference_name,
            startConferenceOnEnter=False,
            endConferenceOnExit=True,
            waitUrl='http://twimlets.com/holdmusic?Bucket=com.twilio.music.classical',
            statusCallbackEvent=['start', 'end', 'join', 'leave'],
            statusCallback=sip_config['webhook_url']  # Add webhook for conference events
        )
        response.append(dial)

        client.calls(call_sid).update(twiml=str(response))
        logger.info('Successfully moved caller to conference')

        # Bridge the conference to LiveKit with dynamic SIP config
        logger.debug('Initiating LiveKit bridge')
        await bridge_conference_to_livekit(
            conference_name=conference_name,
            conference_sid=call_sid,
            from_number=from_number,
            sip_config=sip_config
        )
        logger.info('Successfully bridged conference to LiveKit')
        
        return JSONResponse(content={
            'message': 'Call moved to conference and agent added',
            'conference_name': conference_name
        })
    except TwilioRestException as e:
        logger.error(f"Twilio error in add_to_conference: {e.code} - {e.msg}", exc_info=True)
        raise HTTPException(status_code=e.code, detail=e.msg)
    except Exception as e:
        logger.error(f"Error in add_to_conference: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    


async def bridge_conference_to_livekit(
    conference_name: str,
    conference_sid: str, 
    from_number: str, 
    sip_config: SIPConfig
) -> None:
    """
    Bridges a Twilio conference to LiveKit via dynamic SIP configuration
    
    Args:
        conference_name: Unique conference identifier
        conference_sid: The Twilio conference SID to bridge
        from_number: The phone number or identifier that initiated the call
        sip_config: SIPConfig object containing trunk and authentication details
    """
    try:
        # Construct SIP address with authentication
        auth_params = f";username={sip_config.username};password={sip_config.password}"
        sip_address = f"sip:{sip_config.sip_trunk_number}@{sip_config.sip_host};transport=tcp{auth_params}"
        
        # Add LiveKit as a participant to the conference
        participant = client.conferences(conference_sid).participants.create(
            from_=from_number,
            to=sip_address,
            caller_id=from_number,
            status_callback=sip_config.webhook_url,
            status_callback_event=['initiated', 'ringing', 'answered', 'completed']
        )
        
        logger.info(f"Successfully bridged conference {conference_name} to LiveKit at {sip_address}")
        return participant
        
    except TwilioRestException as e:
        logger.error(f"Twilio error while bridging conference: {e.code} - {e.msg}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error while bridging conference: {str(e)}")
        raise



# # 2nd agent to admin
# async def agent_outbound(from_number: str, to_number: str, agent_id: str) -> None:
#     try:
#         print('calling 2nd agent')
#         client.calls.create(
#             url=f"{settings.BASE_URL}/twilio/twilio-voice-webhook/{agent_id}",
#             to=to_number, from_=from_number
#         )
#         print(f"Call from: {from_number} to: {to_number}")
#     except Exception as err:
#         print(f"Error in agent_outbound: {err}")



def cleanup() -> None:
    print("\nCleaning up before exit...")
    ## Ensuring all prior calls are ended
    calls = client.calls.list(status='in-progress')

    print("Registering twilio URL:")
    print(register_url())
    # Print and end each ongoing call
    if calls:
        for call in calls:
            print(f"Ending call SID: {call.sid}, From: {call.from_formatted}, To: {call.to}, Duration: {call.duration}, Status: {call.status}")
            call = client.calls(call.sid).update(status='completed')
            print(f"Ended call SID: {call.sid}")
    else:
        print('No calls in progress')

# def generate_twiml() -> Response:
    # response = VoiceResponse()
    # dial = Dial()
    # dial.conference('MyConferenceRoom')
    # response.append(dial)
    # return Response(content=str(response), media_type='text/xml')
