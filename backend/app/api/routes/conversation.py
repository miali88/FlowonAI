from fastapi import Request, HTTPException, APIRouter, Depends
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse
from supabase import create_client, Client
from typing import Annotated
import os
import asyncio
import logging
from starlette.concurrency import run_in_threadpool
from collections import defaultdict
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

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


""" if function call works without this, then delete endpoint"""
# @router.get("/events")
# async def events(request: Request):
#     async def event_generator():
#         while True:
#             # Check if client is still connected
#             if await request.is_disconnected():
#                 break

#             # Here you would typically check some condition or wait for a trigger
#             # For now, we'll just send an event after a delay
#             await asyncio.sleep(5)
#             yield {
#                 "event": "message",
#                 "data": '{"type": "show_chat_input"}'
#             }
#     return EventSourceResponse(event_generator())


chat_messages = defaultdict(list)
event_broadcasters = {}

@router.api_route("/chat_message", methods=["POST", "GET"])
async def chat_message(request: Request):
    if request.method == "POST":
        try:
            data = await request.json()
            job_id = data.get('job_id', 'unknown')  # Add job_id
            room_name = data.get('room_name', 'unknown')
            full_name = data.get('fullName', 'unknown')
            email = data.get('email', 'unknown')
            contact_number = data.get('contactNumber', 'unknown')
            user_id = data.get('user_id', 'unknown')

            chat_messages[job_id].append({  # Changed key to job_id
                'room_name': room_name,     # Include room_name as field
                'user_id': user_id,
                'full_name': full_name,
                'email': email,
                'contact_number': contact_number,
                'timestamp': datetime.now().isoformat()
            })

            logger.info(f"Message added for job {job_id}")
            return JSONResponse(content={"status": "success", "message": "Message added"})

        except Exception as e:
            logger.error(f"Error in POST /chat_message: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    elif request.method == "GET":
        try:
            job_id = request.query_params.get('job_id', 'unknown')  # Changed to job_id
            messages = chat_messages.get(job_id, [])
            return JSONResponse(content=messages)

        except Exception as e:
            logger.error(f"Error in GET /chat_message: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/trigger_show_chat_input")
async def trigger_show_chat_input(request: Request):
    """ Invoked by tool_use.py """
    print("\n\n post conversation/trigger_show_chat_input\n\n")

    data = await request.json()
    job_id = data.get('job_id')
    
    if not job_id:
        raise HTTPException(status_code=400, detail="job_id is required")
    
    logger.info(f"Triggering show_chat_input for job: {job_id}")
    if job_id in event_broadcasters:  # Changed to job_id
        await run_in_threadpool(event_broadcasters[job_id].set)
        logger.info(f"Event set for job: {job_id}")
    else:
        logger.warning(f"No event broadcaster found for job: {job_id}")
    
    return JSONResponse(content={"status": "success"})


@router.get("/events/{job_id}")  # Changed route parameter
async def events(job_id: str):  # Changed parameter
    logger.info(f"SSE connection established for job: {job_id}")
    
    async def event_generator():
        if job_id not in event_broadcasters:
            event_broadcasters[job_id] = asyncio.Event()
        try:
            while True:
                logger.info(f"Waiting for event in job: {job_id}")
                await event_broadcasters[job_id].wait()
                logger.info(f"Event triggered for job: {job_id}")
                yield {
                    "event": "message",
                    "data": '{"type": "show_chat_input"}'
                }
                event_broadcasters[job_id].clear()
        finally:
            if job_id in event_broadcasters:
                del event_broadcasters[job_id]
            logger.info(f"SSE connection closed for job: {job_id}")

    return EventSourceResponse(event_generator())
