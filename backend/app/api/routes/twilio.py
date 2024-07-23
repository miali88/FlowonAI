from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Dial, Stream, Connect

from app.utils import generate_new_account_email, send_email
from app.core.config import settings

from fastapi import APIRouter, Request, Response, HTTPException

router = APIRouter()

client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

# Lifespan contextmanager function, will run every time the app is started and stopped. to change to once call ends. 
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

@router.post("/twilio-voice-webhook/{agent_id_path}", response_class=Response)
async def handle_twilio_voice_webhook(agent_id_path: str, request: Request):
    try:
        print('\n\n /twilio-voice-webhook')
        return await handle_voice_webhook(agent_id_path, request)
    except Exception as e:
        print(f"Error in /twilio-voice-webhook : {e}")
        return HTTPException(status_code=500, detail=str(e))
    
@router.post('/add_to_conference')
async def add_to_conference_route(request: Request):
    try:
        print('\n\n /add_to_conference')
        return await add_to_conference(request)
    except Exception as e:
        print(f"Error in add_to_conference: {e}")
        return HTTPException(status_code=500, detail=str(e))

@router.api_route("/twiml", methods=['GET', 'POST'])
async def twiml():
    generate_twiml()


def generate_twiml():
    response = VoiceResponse()
    dial = Dial()
    dial.conference('MyConferenceRoom')
    response.append(dial)
    return Response(content=str(response), media_type='text/xml')
