from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import logging
from enum import Enum
import os
from dotenv import load_dotenv
from dataclasses import dataclass

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Dial
from twilio.base.exceptions import TwilioRestException

load_dotenv()

# Add these lines after your imports, before creating the Twilio client
import logging
logging.getLogger('twilio.http_client').setLevel(logging.WARNING)  # or logging.ERROR

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
    sip_host: str = livekit_sip_host
    username: str = "flowon"
    password: str = "very_secret"
    webhook_url: str = f"{os.getenv('API_BASE_URL')}/twilio/add_to_conference"
    status_callback_url: str = f"{os.getenv('API_BASE_URL')}/twilio/"

    def __post_init__(self):
        # Remove the automatic webhook update
        pass

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

async def add_to_conference(request: Request) -> JSONResponse:
    logger.info('Starting add_to_conference')
    form_data = await request.form()
    logger.info(f'Received form data: {dict(form_data)}')
    
    # Check if this is an error callback
    if 'ErrorCode' in form_data:
        error_code = form_data["ErrorCode"]
        logger.warning(f'Received error callback with code: {error_code}')
        # Return empty TwiML to end the call gracefully
        response = VoiceResponse()
        return JSONResponse(
            content=str(response),
            media_type="application/xml"
        )
    
    call_sid = str(form_data['CallSid'])
    twilio_number = str(form_data['To'])
    from_number = str(form_data['From'])

    # Create TwiML response
    response = VoiceResponse()
    
    try:
        # Create a Dial verb with proper formatting
        dial = Dial(
            caller_id=from_number,  # Changed to use the caller's number
            action=f"{os.getenv('API_BASE_URL')}/twilio/add_to_conference",
            status_callback=f"{os.getenv('API_BASE_URL')}/twilio/",
            status_callback_event=['initiated', 'ringing', 'answered', 'completed']
        )
        
        # Add SIP endpoint to the Dial verb with proper formatting
        sip_config = await get_sip_config(twilio_number)
        
        # Format the phone number to E.164 format if needed
        formatted_number = twilio_number.strip().replace(' ', '')
        if not formatted_number.startswith('+'):
            formatted_number = f'+{formatted_number}'
            
        # Construct SIP URI with proper formatting
        sip_uri = f'sip:{formatted_number}@{sip_config.sip_host};transport=tcp'
        
        # Add SIP credentials and parameters
        dial.sip(
            sip_uri,
            username=sip_config.username,
            password=sip_config.password,
            status_callback_event=['initiated', 'ringing', 'answered', 'completed'],
            status_callback=f"{os.getenv('API_BASE_URL')}/twilio/"
        )

        # Add the Dial verb to the response
        response.append(dial)
        
        logger.info(f'Generated TwiML response: {response}')
        
    except Exception as e:
        logger.error(f'Error generating TwiML: {str(e)}')
        response = VoiceResponse()
        response.say("We're sorry, but there was an error processing your call.")

    return JSONResponse(
        content=str(response),
        media_type="application/xml"
    )



