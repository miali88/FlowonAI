from typing import Annotated, List, Dict, Any, Optional
import asyncio
import logging
from collections import defaultdict
from datetime import datetime

from fastapi import Request, HTTPException, APIRouter, Depends
from fastapi.responses import JSONResponse, Response
from sse_starlette.sse import EventSourceResponse
from starlette.concurrency import run_in_threadpool

from services.cache import get_agent_metadata
from services.supabase.client import get_supabase
from services.chat.lk_chat import save_chat_history_to_supabase, form_data_to_chat, get_chat_rag_results
from services.conversation import transcript_summary

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

chat_messages: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
event_broadcasters: Dict[str, asyncio.Event] = {}
conversation_logs: Dict[str, List[Dict[str, Any]]] = defaultdict(list)


async def get_user_id(request: Request) -> str:
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        raise HTTPException(status_code=400, detail="X-User-ID header is missing")
    return user_id


@router.get("/history")
async def get_conversation_history(
    user_id: Annotated[str, Depends(get_user_id)]
) -> Response:
    try:
        supabase = await get_supabase()
        response = await supabase.table("conversation_logs").select("*").eq("user_id", user_id).execute()

        if response.data:
            return JSONResponse(content=response.data)
        return JSONResponse(content=[], status_code=200)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.delete("/{conversation_id}")
async def delete_conversation_history(
    conversation_id: str,
    user_id: Annotated[str, Depends(get_user_id)]
) -> Response:
    try:
        supabase = await get_supabase()
        await supabase.table("conversation_logs").delete().eq(
            "id", conversation_id
        ).eq("user_id", user_id).execute()
        return JSONResponse(content={}, status_code=200)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/store_history")
async def livekit_room_webhook(request: Request) -> Dict[str, str]:
    data: Dict[str, Any] = await request.json()
    user_id = await get_agent_metadata(data['agent_id'])
    if user_id is None:
        raise HTTPException(status_code=400, detail="User ID not found")
    user_id = user_id['userId']
    logger.info(f"call_duration: {data['call_duration']}")
    logger.info(f"Received webhook data: {data}")

    try:
        supabase = await get_supabase()
        if data['transcript']:
            await supabase.table("conversation_logs").insert({
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

        logger.info(f"Saved conversation log for job {data['job_id']} to Supabase")
        await transcript_summary(data['transcript'], data['job_id'])

    except Exception as e:
        logger.error(f"Error saving to Supabase: {str(e)}")
    return {"message": "Webhook received successfully"}


@router.post("/create_embeddings")
async def create_embeddings(request: Request) -> None:
    data = await request.json()
    logger.info(f"Received data: {data}")


@router.api_route("/chat_message", methods=["POST", "GET"])
async def chat_message(request: Request) -> Response:
    logger.info("chat_message endpoint reached")
    if request.method == "POST":
        try:
            chat_message_data = await request.json()
            if chat_message_data['room_name'].endswith("textbot"):
                logger.info("form_data_to_chat called")
                await form_data_to_chat(
                    room_name=chat_message_data['room_name'],
                    content=chat_message_data,
                )

            chat_message_data['timestamp'] = datetime.now().strftime(
                '%Y-%m-%dT%H:%M:%S'
            )
            logger.info(f"chat_message data: {chat_message_data}")

            logger.info("extracting participant_identity..")
            participant_identity = chat_message_data.get('participant_identity')
            logger.info(f"participant_identity: {participant_identity}")
            if not participant_identity:
                raise HTTPException(
                    status_code=400,
                    detail="participant_identity is required"
                )

            chat_messages[participant_identity].append(chat_message_data)
            logger.info(
                f"chat_messages[participant_identity]: "
                f"{chat_messages[participant_identity]}"
            )

            logger.info(
                f"Message added for participant_identity {participant_identity}"
            )
            return JSONResponse(
                content={"status": "success", "message": "Message added"}
            )

        except Exception as e:
            logger.error(f"Error in POST /chat_message: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Internal server error: {str(e)}"
            )

    elif request.method == "GET":
        try:
            participant_identity = request.query_params.get(
                'participant_identity',
                'unknown'
            )
            messages = chat_messages.get(participant_identity, [])
            if messages:
                chat_messages[participant_identity] = []
            return JSONResponse(content=messages)

        except Exception as e:
            logger.error(f"Error in GET /chat_message: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Internal server error: {str(e)}"
            )


@router.post("/trigger_show_chat_input")
async def trigger_show_chat_input(request: Request) -> Response:
    """Invoked by tool_use.py"""
    logger.info("post conversation/trigger_show_chat_input")

    data = await request.json()
    participant_identity = data.get('participant_identity')
    if not participant_identity:
        raise HTTPException(
            status_code=400,
            detail="participant_identity is required"
        )

    logger.info(
        f"Triggering show_chat_input for participant_identity: "
        f"{participant_identity}"
    )
    if participant_identity in event_broadcasters:
        await run_in_threadpool(event_broadcasters[participant_identity].set)
        logger.info(f"Event set for participant_identity: {participant_identity}")
    else:
        logger.warning(
            f"No event broadcaster found for participant_identity: "
            f"{participant_identity}"
        )

    return JSONResponse(content={"status": "success"})


@router.get("/events/{participant_identity}")
async def events(participant_identity: str) -> EventSourceResponse:
    logger.info(f"SSE connection established for participant_identity: "
                f"{participant_identity}")

    async def event_generator() -> Any:
        if participant_identity not in event_broadcasters:
            event_broadcasters[participant_identity] = asyncio.Event()
        try:
            while True:
                logger.info(
                    f"Waiting for event in participant_identity: "
                    f"{participant_identity}"
                )
                await event_broadcasters[participant_identity].wait()
                logger.info(
                    f"Event triggered for participant_identity: "
                    f"{participant_identity}"
                )
                yield {
                    "event": "message",
                    "data": '{"type": "show_chat_input"}'
                }
                event_broadcasters[participant_identity].clear()
        finally:
            if participant_identity in event_broadcasters:
                del event_broadcasters[participant_identity]
                # Extract agent_id from participant_identity
                agent_id = (
                    participant_identity.split('_')[1]
                    if '_' in participant_identity
                    else participant_identity
                )
                await save_chat_history_to_supabase(
                    agent_id=agent_id,
                    room_name=participant_identity
                )
            logger.info(
                f"SSE connection closed for participant_identity: "
                f"{participant_identity}"
            )

    return EventSourceResponse(event_generator())


@router.get("/form_fields/{agent_id}")
async def form_fields(agent_id: str) -> Response:
    logger.info(f"Fetching form fields for agent_id: {agent_id}")
    try:
        supabase = await get_supabase()
        response = await supabase.table("agents").select("form_fields").eq("id", agent_id).execute()
        logger.debug(f"Supabase response: {response}")

        if response.data:
            logger.info(f"Found form fields for agent_id: {agent_id}")
            logger.info(f"Found form fields {response.data[0]}")
            return JSONResponse(content=response.data[0]['form_fields'])

        logger.warning(f"No form fields found for agent_id: {agent_id}")
        return JSONResponse(content={}, status_code=404)
    except Exception as e:
        logger.error(f"Error fetching form fields for agent_id {agent_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/get_sources")
async def get_sources(request: Request):
    print("\n=== /get_sources endpoint ===")
    params = dict(request.query_params)
    print(f"Request params: {params}")
    
    try:
        if not all(key in params for key in ['agent_id', 'room_name', 'response_id']):
            raise HTTPException(status_code=400, detail="Missing required parameters: agent_id, room_name, response_id")
        
        try:
            rag_results = await get_chat_rag_results(
                agent_id=params['agent_id'],
                room_name=params['room_name'],
                response_id=params['response_id']
            )
            print(f"Successfully retrieved RAG results: {rag_results}")
            return {"sources": rag_results}
            
        except ValueError as e:
            logger.error(f"Value error in get_sources: {str(e)}")
            raise HTTPException(status_code=404, detail=str(e))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving sources: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
