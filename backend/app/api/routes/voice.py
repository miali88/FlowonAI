import os, logging
from typing import List, Dict, Any
import subprocess
import asyncio
import json

from fastapi import Request, APIRouter, WebSocket
from fastapi.responses import JSONResponse
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse
from supabase import create_client, Client
from services.chat.chat import llm_response

from services.voice.rag import similarity_search

from services.cache import call_data
router = APIRouter()
logger = logging.getLogger(__name__)

# global variable to store the jobs
jobs: Dict[str, Dict[str, List[Dict[str, str]]]] = {}

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)


@router.post("/wh")
async def livekit_room_webhook(request: Request):
    data = await request.json()
    print("call_data id in webhook:", id(call_data))
    
    webhook_extract = sip_call_extract(data)
    if webhook_extract:
        call_data[webhook_extract['room_name']] = {
            'twilio_phone_number': webhook_extract['twilio_phone_number'],
            'twilio_call_sid': webhook_extract['twilio_call_sid'],
            'twilio_account_sid': webhook_extract['twilio_account_sid']
        }
        
        print(" printing call_data[webhook_extract['room_name']]:", call_data[webhook_extract['room_name']])
        # Write call_data to JSON file
        try:
            with open('call_data.json', 'w') as f:
                json.dump(call_data, f, indent=4)
        except Exception as e:
            logger.error(f"Error writing to call_data.json: {str(e)}")

    print("\n\ncall_data in /wh:", call_data)
    logger.info(f"Received webhook data: {data}")
    return {"message": "Webhook received successfully"}


def sip_call_extract(data) -> Dict[str, Any]:
    kind = data.get('participant', {}).get('kind')
    if kind == 'SIP':
        result = {
            'kind': kind,
            'sid': data.get('participant', {}).get('sid'),
            'name': data.get('participant', {}).get('name'),
            'room_name': data.get('room', {}).get('name'),
            'creation_time': data.get('room', {}).get('creationTime'),
            'state': data.get('participant', {}).get('state'),
            'event_id': data.get('id'),
        }
        
        # Get nested Twilio attributes safely
        attributes = data.get('participant', {}).get('attributes', {})
        result.update({
            'twilio_phone_number': attributes.get('sip.trunkPhoneNumber'),
            'twilio_account_sid': attributes.get('sip.twilio.accountSid'),
            'twilio_call_sid': attributes.get('sip.twilio.callSid'),
        })
        return result
    else:
        #logger.error(f"Received webhook data for non-SIP (twilio) call: {data}")
        return None
