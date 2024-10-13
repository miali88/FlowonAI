from fastapi import Request, HTTPException, APIRouter, Depends
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse
from supabase import create_client, Client
from typing import Annotated
import os
import asyncio

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

@router.get("/events")
async def events(request: Request):
    async def event_generator():
        while True:
            # Check if client is still connected
            if await request.is_disconnected():
                break

            # Here you would typically check some condition or wait for a trigger
            # For now, we'll just send an event after a delay
            await asyncio.sleep(5)
            yield {
                "event": "message",
                "data": '{"type": "show_chat_input"}'
            }

    return EventSourceResponse(event_generator())

# Add this at the module level
event_broadcasters = {}

@router.post("/trigger_show_chat_input")
async def trigger_show_chat_input(request: Request):
    print("\n\n\n trigger_show_chat_input endpoint called")
    data = await request.json()
    job_id = data.get('job_id')
    if not job_id:
        raise HTTPException(status_code=400, detail="job_id is required")
    
    if job_id in event_broadcasters:
        event_broadcasters[job_id].set()
    
    return JSONResponse(content={"status": "success"})



@router.get("/events/{room_name}")
async def events(room_name: str):
    async def event_generator():
        event_broadcasters[room_name] = asyncio.Event()
        try:
            while True:
                await event_broadcasters[room_name].wait()
                yield {
                    "event": "message",
                    "data": '{"type": "show_chat_input"}'
                }
                event_broadcasters[room_name].clear()
        finally:
            del event_broadcasters[room_name]

    return EventSourceResponse(event_generator())
