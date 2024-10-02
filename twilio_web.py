from fastapi import FastAPI, WebSocket
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse
import os
import uvicorn

app = FastAPI()

# Twilio credentials
account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
twilio_number = os.environ.get('TWILIO_PHONE_NUMBER')

client = Client(account_sid, auth_token)

@app.websocket("/ws")
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
