from fastapi import Request, HTTPException, APIRouter, Depends
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse
from supabase import create_client, Client
from typing import Annotated
import os
import asyncio
import logging
from starlette.concurrency import run_in_threadpool

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


@router.post("/chat_message")
async def post_chat_message(request: Request):
    try:
        # response = supabase.table("chat_logs").select("*").eq("user_id", user_id).execute()
        # if response.data:
        #     return JSONResponse(content=response.data)
        # else:
        #     return JSONResponse(content=[], status_code=200)
        print("\n\n endpoint: post_chat_message")
        print(await request.json())

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Add this at the module level
event_broadcasters = {}


@router.post("/trigger_show_chat_input")
async def trigger_show_chat_input(request: Request):
    """ Triggered by livekit AI agent @openny.py """

    data = await request.json()
    room_name = data.get('room_name')
    job_id = data.get('job_id')
    if not room_name:
        raise HTTPException(status_code=400, detail="room_name is required")
    
    logger.info(f"Triggering show_chat_input for room: {room_name}")
    if room_name in event_broadcasters:
        await run_in_threadpool(event_broadcasters[room_name].set)
        logger.info(f"Event set for room: {room_name}")
    else:
        logger.warning(f"No event broadcaster found for room: {room_name}")
    
    return JSONResponse(content={"status": "success"})

@router.get("/events/{room_name}")
async def events(room_name: str):
    """ SSE with frontend ChatBotMini.tsx """

    logger.info(f"SSE connection established for room: {room_name}")
    
    async def event_generator():
        if room_name not in event_broadcasters:
            event_broadcasters[room_name] = asyncio.Event()
        try:
            while True:
                logger.info(f"Waiting for event in room: {room_name}")
                await event_broadcasters[room_name].wait()
                logger.info(f"Event triggered for room: {room_name}")
                yield {
                    "event": "message",
                    "data": '{"type": "show_chat_input"}'
                }
                event_broadcasters[room_name].clear()
        finally:
            if room_name in event_broadcasters:
                del event_broadcasters[room_name]
            logger.info(f"SSE connection closed for room: {room_name}")

    return EventSourceResponse(event_generator())
