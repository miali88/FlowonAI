import os
import logging
from typing import List, Dict

from fastapi import Request, APIRouter, WebSocket
from fastapi.responses import JSONResponse
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse

from services.voice.rag import similarity_search

router = APIRouter()
logger = logging.getLogger(__name__)

# global variable to store the jobs
jobs: Dict[str, Dict[str, List[Dict[str, str]]]] = {}

@router.api_route('/transcript/commit', methods=['POST', 'GET'])
async def voice_webhook(request: Request):
    data = await request.json()


    print("\n\nCOMMIT ENDPOINT:", data)

    return JSONResponse(content={"message": "Voice webhook received"})

@router.api_route('/transcript/real_time', methods=['POST', 'GET'])
async def voice_webhook(request: Request):
    data = await request.json()

    print("\n\nReceived data:", data)

    # Extract job_id and other relevant information
    job_id = data.get('job_id')
    user_transcript = data.get('user_transcript')
    speech_id = data.get('speech_id')

    # Find or create the job in the jobs dictionary
    if job_id not in jobs:
        jobs[job_id] = {
            'job_id': job_id,
            'transcript': []
        }

    # Append the new transcript entry
    jobs[job_id]['transcript'].append({
        'user_transcript': user_transcript,
        'speech_id': speech_id
    })

    print("\n\nUpdated job:", jobs[job_id])

    # Get the last two user transcripts
    last_two_transcripts = [entry['user_transcript'] for entry in jobs[job_id]['transcript'][-2:]]
    
    # Pass the last two transcripts to similarity_search
    rag_results = await similarity_search(" ".join(last_two_transcripts))

    print("\n\nRAG RESULTS:", rag_results)

    if rag_results:
        return JSONResponse(content={"rag_results": rag_results})
    else:
        return JSONResponse(content={"message": "No RAG results found"})

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
