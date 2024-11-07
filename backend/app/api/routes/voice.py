import os, logging
from typing import List, Dict, Any
import subprocess
import asyncio

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

# @router.api_route('/transcript/commit', methods=['POST', 'GET'])
# async def voice_webhook(request: Request):
#     data = await request.json()
#     print("\n\nCOMMIT ENDPOINT:", data)
#     role, msg = next(iter(data.items()))

#     job_id = data.get('job_id')

#     # Find or create the job in the jobs dictionary.
#     # Instantiate transcript list. 
#     if job_id not in jobs:
#         jobs[job_id] = {
#             'user_id': data.get('user_id'),
#             'agent_id': data.get('agent_id'),
#             'job_id': job_id,
#             'room_sid': data.get('room_sid'),
#             'room_name': data.get('room_name'),
#             'transcript': []}

#     # Append the new transcript entry
#     jobs[job_id]['transcript'].append({
#         role: msg,})

#     print("\n\nUpdated job:", jobs[job_id])

#     return JSONResponse(content={"message": "Voice webhook received"})

# @router.api_route('/transcript/real_time', methods=['POST', 'GET'])
# async def voice_webhook(request: Request):
#     pass
#     # data = await request.json()

#     # print("\n\nReceived data:", data)

#     # # Extract job_id and other relevant information
#     # job_id = data.get('job_id')
#     # user_transcript = data.get('user_transcript')
#     # speech_id = data.get('speech_id')

#     # # Find or create the job in the jobs dictionary
#     # if job_id not in jobs:
#     #     jobs[job_id] = {
#     #         'job_id': job_id,
#     #         'transcript': []
#     #     }

#     # # Append the new transcript entry
#     # jobs[job_id]['transcript'].append({
#     #     'user_transcript': user_transcript,
#     #     'speech_id': speech_id
#     # })

#     # print("\n\nUpdated job:", jobs[job_id])

#     # # Get the last two user transcripts
#     # last_two_transcripts = [entry['user_transcript'] for entry in jobs[job_id]['transcript'][-2:]]
    
#     # # Pass the last two transcripts to similarity_search
#     # rag_results = await similarity_search(" ".join(last_two_transcripts))

#     # print("\n\nRAG RESULTS:", rag_results)

#     # if rag_results:
#     #     return JSONResponse(content={"rag_results": rag_results})
#     # else:
#     #     return JSONResponse(content={"message": "No RAG results found"})

# @router.api_route('/state', methods=['POST', 'GET'])
# async def voice_webhook(request: Request):
#     state = await request.json()

#     """ link the state to the user_id of clerk dashboard. """
#     #print("\n\nSTATE:", state)

#     return JSONResponse(content={"message": "Voice webhook received"})

# @router.post('/transcript/full')
# async def voice_webhook(request: Request):
#     data = await request.json()

#     print("\n\nFULL TRANSCRIPT:", data)

#     return JSONResponse(content={"message": "Full transcript received"})

# @router.post('/transcript/end')
# async def end_call(request: Request):
#     data = await request.json()
#     job_id = data.get('job_id')

#     if job_id not in jobs:
#         return JSONResponse(content={"message": "Job not found"}, status_code=404)

#     # Process and save the accumulated transcript
#     full_transcript = jobs[job_id]['transcript']
    
#     # Here, you would typically save the full transcript to your database
#     # For this example, we'll just print it
#     print(f"\nFull transcript for job {job_id}:")
#     for entry in full_transcript:
#         print(entry)

#     # Remove the job from the jobs dictionary
#     del jobs[job_id]

#     return JSONResponse(content={"message": "Call ended and transcript saved"})


@router.post("/wh")
async def livekit_room_webhook(request: Request):
    data = await request.json()
    print(f"\n /wh Received webhook data: {data}")
    
    print("extracting data...")
    webhook_extract = sip_call_extract(data)
    if webhook_extract:
        print("webhook_extract:", webhook_extract)
        call_data[webhook_extract['room_name']] = webhook_extract
 
    # event = data.get('event')
    # room_sid = data.get('room', {}).get('sid')
    # if event == 'participant_left':
    #     asyncio.create_task(process_participant_left(room_sid))
    
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
        logger.error(f"Received webhook data for non-SIP (twilio) call: {data}")
        return None

# async def process_participant_left(room_sid: str):
#     await asyncio.sleep(10)
    
#     matching_job = next((job for job in jobs.values() if job['room_sid'] == room_sid), None)
    
#     if matching_job:
#         # Save the job data to Supabase
#         try:
#             supabase.table("conversation_logs").insert({
#                 "user_id": matching_job['user_id'],
#                 "agent_id": matching_job['agent_id'],
#                 "job_id": matching_job['job_id'],
#                 "room_sid": matching_job['room_sid'],
#                 "room_name": matching_job['room_name'],
#                 "transcript": matching_job['transcript'],
#             }).execute()
            
#             print(f"Saved conversation log for job {matching_job['job_id']} to Supabase")
            
#             room_name = matching_job['room_name']
#             try:
#                 subprocess.run(['lk', 'room', 'delete', room_name], check=True)
#                 print(f"Deleted room: {room_name}")
#             except subprocess.CalledProcessError as e:
#                 logger.error(f"Error deleting room {room_name}: {str(e)}")

#             await transcript_summary(matching_job['transcript'], matching_job['job_id'])

#             del jobs[matching_job['job_id']]
#         except Exception as e:
#             logger.error(f"Error saving to Supabase: {str(e)}")
#     return JSONResponse(content={"message": "Participant left and job saved"})

# async def transcript_summary(transcript: List[Dict[str, str]], job_id: str):
#     system_prompt = f"""
#     you are an ai agent designed to summarise transcript of phone conversations between an AI agent and a caller. 

#     You will be as concise as possible, and only respond with the outcome of the conversation and facts related to the caller's responses.
#     Do not assume anything, not even the currency of any amounts or monies mentioned.

#     Your output will be in bullet points, with no prefix like "the calller is" or "the caller asks"
#     """
#     transcript_str = str(transcript)
#     try:
#         summary = await llm_response(user_prompt=transcript_str, system_prompt=system_prompt)
#         logger.info(f"Transcript summary generated successfully")

#         try:
#             supabase.table("conversation_logs").update({
#                 "summary": summary
#             }).eq("job_id", job_id).execute()

#             logger.info(f"Summary inserted into summary table for job_id: {job_id}")
#         except Exception as e:
#             logger.error(f"Error inserting summary to Supabase: {str(e)}")

#         return summary
#     except Exception as e:
#         logger.error(f"Error generating transcript summary: {str(e)}")
#         return None

# @router.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     print("\n\nWebSocket connection called...")
#     await websocket.accept()
#     while True:
#         data = await websocket.receive_json()
#         if data['action'] == 'startCall':
#             phone_number = data['phoneNumber']
#             try:
#                 # Create a TwiML response
#                 response = VoiceResponse()
#                 response.dial(phone_number, caller_id=twilio_number)

#                 # Make the call
#                 call = client.calls.create(
#                     twiml=str(response),
#                     to=phone_number,
#                     from_=twilio_number
#                 )
#                 await websocket.send_json({"event": "callStarted", "callSid": call.sid})
#             except Exception as e:
#                 await websocket.send_json({"event": "callError", "message": str(e)})

# # Twilio credentials
# account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
# auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
# twilio_number = os.environ.get('TWILIO_PHONE_NUMBER')

# client = Client(account_sid, auth_token)
