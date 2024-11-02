from fastapi import Request, HTTPException
from fastapi.responses import Response, JSONResponse

from twilio.rest import Client 
from twilio.twiml.voice_response import VoiceResponse, Dial, Stream, Connect

from app.core.config import settings

from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging

class Event(BaseModel):
    name: str
    args: Optional[Dict[str, Any]] = None

from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Dial, Stream, Connect
client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

# Add this near the top of the file, after imports
logger = logging.getLogger(__name__)


""" WEBHOOK HANDLER """
# async def twilio_start_bot(request: Request) -> None:
## dailyco dialin-chatbot here. 

async def call_init_handler(twil_numb: str, request: Request) -> None:
    try:
        form = await request.form()
        data = dict(form)
        logging.info(f"Received data: {data}")
        logging.info(f"Attempting to create Twilio event with CallSid: {data.get('CallSid')}")
        await supabase_ops.twilio.create(str(data['CallSid']), data)
        logging.info("Twilio event created successfully")
    except Exception as e:
        logging.error(f"Error in call_init_handler: {str(e)}")
        logging.error(f"Error type: {type(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def handle_voice_webhook(agent_id_path: str, request: Request) -> Response:
    try:
        form = await request.form()
        data = dict(form)

        print('agent type', retellai.get_agent_type(agent_id_path))

        print('handle twilio data...')
        await handle_twilio_logic(agent_id_path, data)

        # Save Twilio webhook data to Supabase
        await supabase_ops.twilio.create(str(data['CallSid']), data)

        print('retell logic...')
        websocket_url = await retellai.handle_retell_logic(agent_id_path)

        print("creating twilio voice response object..")
        response = create_voice_response(websocket_url)

        return Response(content=str(response), media_type='text/xml')
    except ValueError as ve:
        print(f"Error in handle_voice_webhook: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Error in handle_voice_webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def create_voice_response(websocket_url: str) -> VoiceResponse:
    """Create the VoiceResponse object."""
    try:
        response = VoiceResponse()
        connect = Connect()
        stream = Stream(url=websocket_url)
        print('websocket url', websocket_url)
        connect.append(stream)
        response.append(connect)
        response.say('You are now connected to the AI receptionist.')
        return response
    except Exception as e:
        logging.error(f"Error in create_voice_response: {str(e)}")
        raise ValueError(f"Failed to create voice response: {str(e)}")


""" CALL HANDLING """
# 1st agent places IC on hold
async def add_to_conference(request: Request) -> JSONResponse:
    try:
        form_data = await request.form()
        print(form_data)
        call_sid = form_data['CallSid']
        print('INITIAL CALL SID IS', call_sid)

        # Convert call_sid to string
        call_sid_str = str(call_sid)

        # Move the initial caller to the conference, will be on hold until someone else joins 
        client.calls(call_sid_str).update(
            twiml='<Response><Dial><Conference startConferenceOnEnter="false" \
                endConferenceOnExit="true">MyConferenceRoom</Conference></Dial></Response>'
        )
        print(in_memory_cache.get("AGENT_FIRST.case_locator.admin_name"))
        admin_tel_no = await get_admin_tel_number(in_memory_cache.get("AGENT_FIRST.case_locator.admin_name"))
        print('admin tel number is', admin_tel_no)
        # 2nd agent to admin 
        print('calling agent_outbound')
        await agent_outbound(settings.TWILIO_NUMBER, admin_tel_no, settings.AGENT_SECOND)
        
        return JSONResponse(content={'message': 'Call moved to conference and agent added'})
    except Exception as e:
        print(f"Error in add_to_conference: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 2nd agent to admin
async def agent_outbound(from_number: str, to_number: str, agent_id: str) -> None:
    try:
        print('calling 2nd agent')
        client.calls.create(
            url=f"{settings.BASE_URL}/api/v1/twilio/twilio-voice-webhook/{agent_id}",
            to=to_number, from_=from_number
        )
        print(f"Call from: {from_number} to: {to_number}")
    except Exception as err:
        print(f"Error in agent_outbound: {err}")

# 2nd agent connects IC & admin
async def admin_to_conf(event: Event, request: Request) -> None:
    # Create the TwiML URL
    twiml_url = f"http://twimlets.com/holdmusic?Bucket=com.twilio.music.ambient"   
    response = VoiceResponse()
    dial = Dial()

    # Creating a conference room
    dial.conference(
        'NoMusicNoBeepRoom',
        beep=False,
        wait_url= twiml_url,
        start_conference_on_enter=True,
        end_conference_on_exit=True
    )
    response.append(dial)
    
    # Update the first call to join the conference
    client.calls(in_memory_cache.get("AGENT_FIRST.twilio_callsid")).update(twiml=response)
    # Update the second call to join the conference
    client.calls(in_memory_cache.get("AGENT_SECOND.twilio_callsid")).update(twiml=response)

    print(response)

async def handle_twilio_logic(agent_id_path: str, data: Dict[str, Any]) -> Optional[str]:
    """Handle Twilio-specific operations."""
    try:
        agent_type = retellai.get_agent_type(agent_id_path)
        if 'CallSid' in data:
            in_memory_cache.set(f"{agent_type}.twilio_callsid", data['CallSid'])
            print(in_memory_cache.get_all())
        return data.get('CallSid')
    except Exception as e:
        logging.error(f"Error in handle_twilio_logic: {str(e)}")
        raise ValueError(f"Failed to handle Twilio logic: {str(e)}")


""" UTILS """
def register_url():
    """ This updates the webhook URL for a given Twilio number.
        i.e settings.TWILIO_NUMBER, but can be any db of numbers.
    """
    try:
        # Find the phone number object
        phone_number_objects = client.incoming_phone_numbers.list(phone_number=settings.TWILIO_NUMBER)
        
        if not phone_number_objects:
            print(f"Unable to locate the number {settings.TWILIO_NUMBER} in your Twilio account.")
            return

        # Get the first (and should be only) matching phone number
        phone_number_object = phone_number_objects[0]
        """ FlowonAI Infra """
        voice_url = f"{settings.BASE_URL}/api/v1/twilio/call_init/{settings.TWILIO_NUMBER}"
        client.incoming_phone_numbers(phone_number_object.sid).update(
            voice_url=voice_url
        )

        """ RetellAI Infra """
        # agent_id = "agent_6fbcc967dde3c2e6c59a12d6dc"
        # voice_url = f"{settings.BASE_URL}/api/v1/twilio/retell_handle/{agent_id}"
        # client.incoming_phone_numbers(phone_number_object.sid).update(
        #     voice_url=voice_url
        # )
        
        return voice_url
    except Exception as err:
        print(f"Error in register_url: {err}")

async def update_call(call_sid: str, new_url: str, instruction: str) -> None:
    try:
        if instruction == 'hold':
            print('_+_ Call is being held')
            client.calls(call_sid).update(url=new_url, method='POST')
        if call_sid == None:
            print('call_sid is None')
            return None
    except Exception as e:
        print(f"Error in update_call: {e}")

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

def generate_twiml() -> Response:
    response = VoiceResponse()
    dial = Dial()
    dial.conference('MyConferenceRoom')
    response.append(dial)
    return Response(content=str(response), media_type='text/xml')