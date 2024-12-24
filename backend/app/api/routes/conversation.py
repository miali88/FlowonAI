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

from services.cache import get_agent_metadata
from services.chat.chat import llm_response
from services.db.supabase_services import supabase_client

supabase = supabase_client()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

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

@router.post("/store_history")
async def livekit_room_webhook(request: Request):
    data = await request.json()
    user_id = await get_agent_metadata(data['agent_id'])
    user_id = user_id['userId']
    #print(f"\n /store_history Received webhook data: {data}")
    print(f"\n\n\n call_duration: {data['call_duration']}\n\n")

    logger.info(f"Received webhook data: {data}")

    try:
        if data['transcript'] != []:
            supabase.table("conversation_logs").insert({
                "transcript": data['transcript'],  
                "job_id": data['job_id'],
                "participant_identity": data['participant_identity'],
                "room_name": data['room_name'],
                "user_id": user_id,
                "agent_id": data['agent_id'],
                "lead": data['prospect_status'], 
                "call_duration": data['call_duration'],
                "call_type": data['call_type']
            }).execute()
        else:
            logger.info(f"No transcript received for job {data['job_id']}")
        
        print(f"Saved conversation log for job {data['job_id']} to Supabase")

        await transcript_summary(data['transcript'], data['job_id'])

    except Exception as e:
        logger.error(f"Error saving to Supabase: {str(e)}")
    return {"message": "Webhook received successfully"}

@router.post("/create_embeddings")
async def create_embeddings(request: Request):
    data = await request.json()
    conversation_logs = data['transcript']
    
    print(f"Received data: {data}")

async def transcript_summary(transcript: List[Dict[str, str]], job_id: str):
    print("\n\n transcript_summary func called\n\n")
    system_prompt = f"""
    you are an ai agent designed to summarise transcript of phone conversations between an AI agent and a caller. 

    You will be as concise as possible, and only respond with the outcome of the conversation and facts related to the caller's responses.
    Do not assume anything, not even the currency of any amounts or monies mentioned. If transcript is empty, return "No conversation was held"

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
            chat_message_data = await request.json()
            chat_message_data['timestamp'] = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
            print("\n\n chat_message data:", chat_message_data, "\n\n")
            
            print(" extracting participant_identity..")
            # Extract participant_identity from chat_message_data
            participant_identity = chat_message_data.get('participant_identity')
            print(f"participant_identity: {participant_identity}")
            if not participant_identity:
                raise HTTPException(status_code=400, detail="participant_identity is required")

            chat_messages[participant_identity].append(chat_message_data)
            print(f"chat_messages[participant_identity]: {chat_messages[participant_identity]}")

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


@router.get("/form_fields/{agent_id}")
async def form_fields(agent_id: str):
    logger.info(f"Fetching form fields for agent_id: {agent_id}")
    try:
        response = supabase.table("agents").select("form_fields").eq("id", agent_id).execute()
        logger.debug(f"Supabase response: {response}")
        
        if response.data:
            logger.info(f"Found form fields for agent_id: {agent_id}")
            print(f"Found form fields {response.data[0]}")
            return JSONResponse(content=response.data[0]['form_fields'])
        else:
            logger.warning(f"No form fields found for agent_id: {agent_id}")
            return JSONResponse(content={}, status_code=404)
    except Exception as e:
        logger.error(f"Error fetching form fields for agent_id {agent_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")