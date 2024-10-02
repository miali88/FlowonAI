from fastapi import Request, APIRouter, WebSocket
from fastapi.responses import JSONResponse

from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse

import os
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.api_route('/transcript/commit', methods=['POST', 'GET'])
async def voice_webhook(request: Request):
    data = await request.json()

    print("\n\nCOMMIT ENDPOINT:", data)

    return JSONResponse(content={"message": "Voice webhook received"})

@router.api_route('/transcript/real_time', methods=['POST', 'GET'])
async def voice_webhook(request: Request):
    data = await request.json()

    print("\n\nReceived data:", data)
    print("Transcript:", data.get('transcript'))
    print("Chat Context:", data.get('chat_context'))

    return JSONResponse(content={"message": "Voice webhook received"})

@router.api_route('/state', methods=['POST', 'GET'])
async def voice_webhook(request: Request):
    state = await request.json()

    """ link the state to the user_id of clerk dashboard. """
    #print("\n\nSTATE:", state)

    return JSONResponse(content={"message": "Voice webhook received"})


# Twilio credentials
account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
twilio_number = os.environ.get('TWILIO_PHONE_NUMBER')

client = Client(account_sid, auth_token)

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print("\n\nWebSocket connection called...")
    await websocket.accept()
    while True:
        data = await websocket.receive_json()
        if data['action'] == 'startCall':
            phone_number = data['phoneNumber']
            try:
                # Create a TwiML response
                response = VoiceResponse()
                response.dial(phone_number, caller_id=twilio_number)

                # Make the call
                call = client.calls.create(
                    twiml=str(response),
                    to=phone_number,
                    from_=twilio_number
                )
                await websocket.send_json({"event": "callStarted", "callSid": call.sid})
            except Exception as e:
                await websocket.send_json({"event": "callError", "message": str(e)})
