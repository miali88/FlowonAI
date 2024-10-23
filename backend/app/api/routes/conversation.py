from typing import Annotated, List, Dict
import os
import asyncio
import logging
from collections import defaultdict
from datetime import datetime

from fastapi import Request, HTTPException, APIRouter, Depends
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse
from starlette.concurrency import run_in_threadpool
from supabase import create_client, Client

from services.chat.chat import llm_response

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

chat_messages = defaultdict(list)
event_broadcasters = {}
conversation_logs = defaultdict(list)

async def get_user_id(request: Request) -> str:
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        raise HTTPException(status_code=400, detail="X-User-ID header is missing")
    return user_id

@router.get("/history")
async def get_conversation_history(user_id: Annotated[str, Depends(get_user_id)]):
    try:
        response = supabase.table("conversation_logs").select("*").eq("user_id", user_id).execute()
        if response.data:
            return JSONResponse(content=response.data)
        else:
            return JSONResponse(content=[], status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{conversation_id}")
async def delete_conversation_history(conversation_id: str, user_id: Annotated[str, Depends(get_user_id)]):
    try:
        supabase.table("conversation_logs").delete().eq("id", conversation_id).eq("user_id", user_id).execute()
        return JSONResponse(content={}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/conversation_log")
async def livekit_room_webhook(request: Request):
    data = await request.json()
    print(f"\n /conversation_log Received webhook data: {data}")
    
    event = data.get('event')
    room_sid = data.get('room', {}).get('sid')
    
    if event == 'participant_left':
        asyncio.create_task(process_participant_left(room_sid))
    
    logger.info(f"Received webhook data: {data}")
    return {"message": "Webhook received successfully"}

async def process_participant_left(room_sid: str):
    await asyncio.sleep(10)
    
    matching_job = next((job for job in jobs.values() if job['room_sid'] == room_sid), None)
    
    if matching_job:
        # Save the job data to Supabase
        try:
            supabase.table("conversation_logs").insert({
                "user_id": matching_job['user_id'],
                "agent_id": matching_job['agent_id'],
                "job_id": matching_job['job_id'],
                "room_sid": matching_job['room_sid'],
                "room_name": matching_job['room_name'],
                "transcript": matching_job['transcript'],
            }).execute()
            
            print(f"Saved conversation log for job {matching_job['job_id']} to Supabase")
            
            room_name = matching_job['room_name']
            try:
                subprocess.run(['lk', 'room', 'delete', room_name], check=True)
                print(f"Deleted room: {room_name}")
            except subprocess.CalledProcessError as e:
                logger.error(f"Error deleting room {room_name}: {str(e)}")

            await transcript_summary(matching_job['transcript'], matching_job['job_id'])

            del jobs[matching_job['job_id']]
        except Exception as e:
            logger.error(f"Error saving to Supabase: {str(e)}")
    return JSONResponse(content={"message": "Participant left and job saved"})

async def transcript_summary(transcript: List[Dict[str, str]], job_id: str):
    system_prompt = f"""
    you are an ai agent designed to summarise transcript of phone conversations between an AI agent and a caller. 

    You will be as concise as possible, and only respond with the outcome of the conversation and facts related to the caller's responses.
    Do not assume anything, not even the currency of any amounts or monies mentioned.

    Your output will be in bullet points, with no prefix like "the calller is" or "the caller asks"
    """
    transcript_str = str(transcript)
    try:
        summary = await llm_response(user_prompt=transcript_str, system_prompt=system_prompt)
        logger.info(f"Transcript summary generated successfully")

        try:
            supabase.table("conversation_logs").update({
                "summary": summary
            }).eq("job_id", job_id).execute()

            logger.info(f"Summary inserted into summary table for job_id: {job_id}")
        except Exception as e:
            logger.error(f"Error inserting summary to Supabase: {str(e)}")

        return summary
    except Exception as e:
        logger.error(f"Error generating transcript summary: {str(e)}")
        return None





@router.api_route("/chat_message", methods=["POST", "GET"])
async def chat_message(request: Request):
    print("\n\n chat_message endpoint reached\n\n")
    if request.method == "POST":
        try:
            data = await request.json()
            print("\n\n chat_message data:", data, "\n\n")
            participant_identity = data.get('participant_identity', 'unknown') 
            room_name = data.get('room_name', 'unknown')
            full_name = data.get('fullName', 'unknown')
            email = data.get('email', 'unknown')
            contact_number = data.get('contactNumber', 'unknown')
            user_id = data.get('user_id', 'unknown')

            chat_messages[participant_identity].append({  # Changed key to participant_identity
                'room_name': room_name,     # Include room_name as field
                'user_id': user_id,
                'full_name': full_name,
                'email': email,
                'contact_number': contact_number,
                'timestamp': datetime.now().isoformat()
            })

            logger.info(f"Message added for participant_identity {participant_identity}")
            return JSONResponse(content={"status": "success", "message": "Message added"})

        except Exception as e:
            logger.error(f"Error in POST /chat_message: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    elif request.method == "GET":
        try:
            participant_identity = request.query_params.get('participant_identity', 'unknown')
            messages = chat_messages.get(participant_identity, [])
            # Clear the messages after retrieving them
            if messages:
                chat_messages[participant_identity] = []
            return JSONResponse(content=messages)

        except Exception as e:
            logger.error(f"Error in GET /chat_message: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/trigger_show_chat_input")
async def trigger_show_chat_input(request: Request):
    """ Invoked by tool_use.py """
    print("\n\n post conversation/trigger_show_chat_input\n\n")

    data = await request.json()
    participant_identity = data.get('participant_identity')
    if not participant_identity:
        raise HTTPException(status_code=400, detail="participant_identity is required")
    
    logger.info(f"Triggering show_chat_input for participant_identity: {participant_identity}")
    if participant_identity in event_broadcasters:  
        await run_in_threadpool(event_broadcasters[participant_identity].set)
        logger.info(f"Event set for participant_identity: {participant_identity}")
    else:
        logger.warning(f"No event broadcaster found for participant_identity: {participant_identity}")
    
    return JSONResponse(content={"status": "success"})


@router.get("/events/{participant_identity}")  # Changed route parameter
async def events(participant_identity: str):  # Changed parameter
    logger.info(f"SSE connection established for participant_identity: {participant_identity}")
    
    async def event_generator():
        if participant_identity not in event_broadcasters:
            event_broadcasters[participant_identity] = asyncio.Event()
        try:
            while True:
                logger.info(f"Waiting for event in participant_identity: {participant_identity}")
                await event_broadcasters[participant_identity].wait()
                logger.info(f"Event triggered for participant_identity: {participant_identity}")
                yield {
                    "event": "message",
                    "data": '{"type": "show_chat_input"}'
                }
                event_broadcasters[participant_identity].clear()
        finally:
            if participant_identity in event_broadcasters:
                del event_broadcasters[participant_identity]
            logger.info(f"SSE connection closed for participant_identity: {participant_identity}")

    return EventSourceResponse(event_generator())
