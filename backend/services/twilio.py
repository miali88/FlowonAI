from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import Response, JSONResponse

from twilio.rest import Client 
from twilio.twiml.voice_response import VoiceResponse, Dial, Stream, Connect

from services.retellai import handle_retell_logic, get_agent_type
from services.in_memory_cache import in_memory_cache
from app.core.config import settings

from pydantic import BaseModel
from typing import Optional

class Event(BaseModel):
    name: str
    args: Optional[dict] = None

from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Dial, Stream, Connect
client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)


""" INITIAL CALL HANDLING """
async def handle_voice_webhook(agent_id_path: str, request: Request):
    try:
        form = await request.form()
        data = dict(form)

        print('agent type',get_agent_type(agent_id_path))

        # Handle Twilio data
        print('handle twilio data...')
        await handle_twilio_logic(agent_id_path, data)

        print('retell logic...')
        # Handle Retell call registration
        websocket_url = await handle_retell_logic(agent_id_path)

        print("creating twilio voice response object..")
        # Create response
        response = create_voice_response(websocket_url)

        return Response(content=str(response), media_type='text/xml')
    except ValueError as ve:
        print(f"Error in handle_voice_webhook: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Error in handle_voice_webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def handle_twilio_logic(agent_id_path, data):
    """Handle Twilio-specific operations."""
    agent_type = get_agent_type(agent_id_path)
    if 'CallSid' in data:
        in_memory_cache.set(f"{agent_type}.twilio_callsid",data['CallSid'])
        print(in_memory_cache.get_all())
    return data.get('CallSid')

def create_voice_response(websocket_url):
    """Create the VoiceResponse object."""
    response = VoiceResponse()
    connect = Connect()
    stream = Stream(url=websocket_url)
    connect.append(stream)
    response.append(connect)
    response.say('You are now connected to the AI receptionist.')
    return response


""" CALL HANDLING """
# 1st agent places IC on hold
async def add_to_conference(request):
    try:
        form_data = await request.form()
        print(form_data)
        call_sid = form_data['CallSid']
        print('INITIAL CALL SID IS', call_sid)

        # Move the initial caller to the conference, will be on hold until someone else joins 
        client.calls(call_sid).update(
            twiml='<Response><Dial><Conference startConferenceOnEnter="false" \
                endConferenceOnExit="true">MyConferenceRoom</Conference></Dial></Response>'
        )
        
        admin_tel_no = await get_admin_tel_number(mem_cache['1']['case_locator']['admin_name'])
        print('admin tel number is', admin_tel_no)
        # 2nd agent to admin 
        await agent_outbound(settings.TWILIO_NUMBER, admin_tel_no,settings.AGENT_SECOND)
        
        return JSONResponse(content={'message': 'Call moved to conference and agent added'}), 200
    except Exception as e:
        print(f"Error in add_to_conference: {e}")
        return HTTPException(status_code=500, detail=str(e))

# 2nd agent to admin
async def agent_outbound(from_number: str, to_number: str, agent_id: str):
    try:
        client.calls.create(
            url=f"{settings.BASE_URL}/twilio-voice-webhook/{agent_id}",
            to=to_number, from_=from_number
        )
        print(f"Call from: {from_number} to: {to_number}")
    except Exception as err:
        print(f"Error in agent_outbound: {err}")

# 2nd agent connects IC & admin
async def admin_to_conf(event: Event, request: Request):
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

    # # Update the first call to join the conference
    # client.calls(mem_cache['1']['twilio_callsid']).update(twiml=response)
    # # Update the second call to join the conference
    # client.calls(mem_cache['2']['twilio_callsid']).update(twiml=response)

    print(response)

async def update_call(call_sid, new_url, instruction):
    try:
        if instruction == 'hold':
            print('_+_ Call is being held')
            client.calls(call_sid).update(url=new_url, method='POST')
    except Exception as e:
        print(f"Error in update_call: {e}")


def cleanup():
    print("Cleaning up before exit...")
    ## Ensuring all prior calls are ended
    calls = client.calls.list(status='in-progress')

    # Print and end each ongoing call
    if calls:
        for call in calls:
            print(f"Ending call SID: {call.sid}, From: {call.from_formatted}, To: {call.to}, Duration: {call.duration}, Status: {call.status}")
            call = client.calls(call.sid).update(status='completed')
            print(f"Ended call SID: {call.sid}")
    else:
        print('No calls in progress')

def generate_twiml():
    response = VoiceResponse()
    dial = Dial()
    dial.conference('MyConferenceRoom')
    response.append(dial)
    return Response(content=str(response), media_type='text/xml')