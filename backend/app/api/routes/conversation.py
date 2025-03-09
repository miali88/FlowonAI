from typing import List, Dict, Any, Optional
import asyncio
import logging
from collections import defaultdict
from datetime import datetime
import httpx

from fastapi import Request, HTTPException, APIRouter, Depends, Query
from fastapi.responses import JSONResponse, Response
from sse_starlette.sse import EventSourceResponse
from starlette.concurrency import run_in_threadpool
from app.core.auth import get_current_user
from pydantic import BaseModel, Field, UUID4

from app.services.cache import get_agent_metadata
from app.clients.supabase_client import get_supabase
from app.services.chat.lk_chat import save_chat_history_to_supabase, form_data_to_chat, get_chat_rag_results
from app.services.conversation import transcript_summary
from app.core.config import settings

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Define Pydantic models for request and response schemas
class ConversationLog(BaseModel):
    id: UUID4
    created_at: Optional[datetime] = None
    job_id: Optional[str] = None
    room_sid: Optional[str] = None
    room_name: Optional[str] = None
    transcript: Optional[str] = None
    user_id: Optional[str] = None
    summary: Optional[str] = None
    agent_id: Optional[str] = None
    lead: Optional[str] = None
    function_calls: Optional[Dict[str, Any]] = None
    participant_identity: Optional[str] = None
    call_duration: Optional[str] = None
    nylas_notification: Optional[Dict[str, Any]] = None
    call_type: Optional[str] = None
    token_count: Optional[int] = None
    feedback: Optional[Dict[str, Any]] = None

class ConversationLogCreate(BaseModel):
    transcript: str
    job_id: str
    participant_identity: str
    room_name: str
    agent_id: str
    prospect_status: Optional[str] = None
    call_duration: Optional[str] = None
    call_type: Optional[str] = None

class ChatMessage(BaseModel):
    room_name: str
    participant_identity: str
    content: str
    message_type: Optional[str] = "text"
    timestamp: Optional[str] = None
    
    class Config:
        extra = "allow"  # Allow additional fields

class ShowChatInputRequest(BaseModel):
    participant_identity: str

class FormFieldsResponse(BaseModel):
    form_fields: Dict[str, Any] = Field(default_factory=dict)

class SourcesRequest(BaseModel):
    agent_id: str
    room_name: str
    response_id: str

class SourcesResponse(BaseModel):
    sources: List[Dict[str, Any]] = Field(default_factory=list)

class SuccessResponse(BaseModel):
    status: str = "success"
    message: Optional[str] = None

# Global state variables
chat_messages: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
event_broadcasters: Dict[str, asyncio.Event] = {}
conversation_logs: Dict[str, List[Dict[str, Any]]] = defaultdict(list)

@router.get("/history", response_model=List[ConversationLog])
async def get_conversation_history(
    current_user: str = Depends(get_current_user)
) -> Response:
    try:
        logger.info(f"🔍 Fetching conversation history for user: {current_user}")
        supabase = await get_supabase()
        logger.info(f"✅ Supabase client initialized successfully")
        
        logger.info(f"🔎 Querying conversation_logs table for user_id: {current_user}")
        response = await supabase.table("conversation_logs") \
            .select("*") \
            .eq("user_id", current_user) \
            .execute()
        logger.info(f"✅ Supabase query executed successfully")
        
        logger.info(f"📊 Query returned {len(response.data) if response.data else 0} records")
        if response.data:
            return JSONResponse(content=response.data)
        return JSONResponse(content=[], status_code=200)
    except Exception as e:
        logger.error(f"❌ Error fetching conversation history: {str(e)}")
        logger.error(f"Detailed exception information:", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.delete("/{conversation_id}", response_model=SuccessResponse)
async def delete_conversation_history(
    conversation_id: str,
    current_user: str = Depends(get_current_user)
) -> Response:
    try:
        logger.info(f"🗑️ Deleting conversation with ID: {conversation_id} for user: {current_user}")
        supabase = await get_supabase()
        await supabase.table("conversation_logs").delete().eq(
            "id", conversation_id
        ).eq("user_id", current_user).execute()
        logger.info(f"✅ Conversation {conversation_id} deleted successfully")
        return JSONResponse(content={"status": "success", "message": "Conversation deleted"}, status_code=200)
    except Exception as e:
        logger.error(f"❌ Error deleting conversation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/store_history", response_model=SuccessResponse)
async def livekit_room_webhook(request: Request) -> Dict[str, str]:
    data: Dict[str, Any] = await request.json()
    logger.info(f"📥 Received webhook data for job_id: {data.get('job_id', 'unknown')}")
    
    user_id = await get_agent_metadata(data['agent_id'])
    if user_id is None:
        logger.error(f"❌ User ID not found for agent_id: {data['agent_id']}")
        raise HTTPException(status_code=400, detail="User ID not found")
    
    user_id = user_id['userId']
    logger.info(f"⏱️ call_duration: {data['call_duration']}")
    logger.info(f"📋 Full webhook data: {data}")

    try:
        supabase = await get_supabase()
        if data['transcript']:
            logger.info(f"💾 Saving transcript to conversation_logs for job_id: {data['job_id']}")
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
            logger.info(f"✅ Successfully saved conversation log")
        else:
            logger.info(f"⚠️ No transcript received for job {data['job_id']}")

        logger.info(f"🔄 Generating summary for job_id: {data['job_id']}")
        await transcript_summary(data['transcript'], data['job_id'])
        logger.info(f"✅ Summary generation initiated")

    except Exception as e:
        logger.error(f"❌ Error saving to Supabase: {str(e)}", exc_info=True)
    return {"message": "Webhook received successfully", "status": "success"}

@router.post("/create_embeddings")
async def create_embeddings(request: Request) -> Dict[str, str]:
    data = await request.json()
    # logger.info(f"🔍 Received embedding data: {data}")
    # This endpoint appears to be a placeholder
    return {"status": "success", "message": "Embedding request received"}

@router.api_route("/chat_message", methods=["POST", "GET"])
async def chat_message(request: Request) -> Response:
    logger.info("💬 chat_message endpoint reached")
    if request.method == "POST":
        try:
            chat_message_data = await request.json()
            logger.info(f"📥 Received chat message data: {chat_message_data}")
            
            if chat_message_data['room_name'].endswith("textbot"):
                logger.info("🤖 Processing textbot message")
                await form_data_to_chat(
                    room_name=chat_message_data['room_name'],
                    content=chat_message_data,
                )

            chat_message_data['timestamp'] = datetime.now().strftime(
                '%Y-%m-%dT%H:%M:%S'
            )
            logger.info(f"⏱️ Added timestamp: {chat_message_data['timestamp']}")

            logger.info("🔍 Extracting participant_identity...")
            participant_identity = chat_message_data.get('participant_identity')
            logger.info(f"👤 participant_identity: {participant_identity}")
            if not participant_identity:
                logger.error("❌ Missing participant_identity in request")
                raise HTTPException(
                    status_code=400,
                    detail="participant_identity is required"
                )

            chat_messages[participant_identity].append(chat_message_data)
            logger.info(
                f"💾 Added message to chat_messages for {participant_identity}"
            )

            return JSONResponse(
                content={"status": "success", "message": "Message added"}
            )

        except Exception as e:
            logger.error(f"❌ Error in POST /chat_message: {str(e)}", exc_info=True)
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
            logger.info(f"🔍 Fetching messages for participant: {participant_identity}")
            
            messages = chat_messages.get(participant_identity, [])
            if messages:
                logger.info(f"📋 Found {len(messages)} messages, clearing queue")
                chat_messages[participant_identity] = []
            else:
                logger.info("📭 No messages found")
                
            return JSONResponse(content=messages)

        except Exception as e:
            logger.error(f"❌ Error in GET /chat_message: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Internal server error: {str(e)}"
            )

@router.post("/trigger_show_chat_input", response_model=SuccessResponse)
async def trigger_show_chat_input(request: Request) -> Response:
    """Invoked by tool_use.py"""
    logger.info("🔔 POST conversation/trigger_show_chat_input")

    data = await request.json()
    participant_identity = data.get('participant_identity')
    if not participant_identity:
        logger.error("❌ Missing participant_identity in request")
        raise HTTPException(
            status_code=400,
            detail="participant_identity is required"
        )

    logger.info(
        f"🎯 Triggering show_chat_input for participant_identity: "
        f"{participant_identity}"
    )
    if participant_identity in event_broadcasters:
        await run_in_threadpool(event_broadcasters[participant_identity].set)
        logger.info(f"✅ Event set for participant_identity: {participant_identity}")
    else:
        logger.warning(
            f"⚠️ No event broadcaster found for participant_identity: "
            f"{participant_identity}"
        )

    return JSONResponse(content={"status": "success"})

@router.get("/events/{participant_identity}")
async def events(participant_identity: str) -> EventSourceResponse:
    logger.info(f"🔌 SSE connection established for participant_identity: "
                f"{participant_identity}")

    async def event_generator() -> Any:
        if participant_identity not in event_broadcasters:
            logger.info(f"🆕 Creating new event broadcaster for {participant_identity}")
            event_broadcasters[participant_identity] = asyncio.Event()
        try:
            while True:
                logger.info(
                    f"⏳ Waiting for event in participant_identity: "
                    f"{participant_identity}"
                )
                await event_broadcasters[participant_identity].wait()
                logger.info(
                    f"🔔 Event triggered for participant_identity: "
                    f"{participant_identity}"
                )
                yield {
                    "event": "message",
                    "data": '{"type": "show_chat_input"}'
                }
                logger.info(f"✅ Event sent, clearing flag")
                event_broadcasters[participant_identity].clear()
        finally:
            if participant_identity in event_broadcasters:
                logger.info(f"🧹 Cleaning up event broadcaster for {participant_identity}")
                del event_broadcasters[participant_identity]
                # Extract agent_id from participant_identity
                agent_id = (
                    participant_identity.split('_')[1]
                    if '_' in participant_identity
                    else participant_identity
                )
                logger.info(f"💾 Saving chat history to Supabase for agent_id: {agent_id}")
                await save_chat_history_to_supabase(
                    agent_id=agent_id,
                    room_name=participant_identity
                )
            logger.info(
                f"🔌 SSE connection closed for participant_identity: "
                f"{participant_identity}"
            )

    return EventSourceResponse(event_generator())

@router.get("/form_fields/{agent_id}", response_model=FormFieldsResponse)
async def form_fields(agent_id: str) -> Response:
    logger.info(f"🔍 Fetching form fields for agent_id: {agent_id}")
    try:
        supabase = await get_supabase()
        response = await supabase.table("agents").select("form_fields").eq("id", agent_id).execute()
        logger.debug(f"📋 Supabase response: {response}")

        if response.data:
            logger.info(f"✅ Found form fields for agent_id: {agent_id}")
            logger.info(f"📋 Form fields content: {response.data[0]}")
            return JSONResponse(content={"form_fields": response.data[0]['form_fields']})

        logger.warning(f"⚠️ No form fields found for agent_id: {agent_id}")
        return JSONResponse(content={"form_fields": {}}, status_code=404)
    except Exception as e:
        logger.error(f"❌ Error fetching form fields for agent_id {agent_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/get_sources", response_model=SourcesResponse)
async def get_sources(
    agent_id: str = Query(..., description="The agent ID"),
    room_name: str = Query(..., description="The room name"),
    response_id: str = Query(..., description="The response ID")
) -> Dict[str, List[Dict[str, Any]]]:
    logger.info("\n=== 🔍 /get_sources endpoint ===")
    logger.info(f"📋 Request params: agent_id={agent_id}, room_name={room_name}, response_id={response_id}")
    
    try:
        try:
            rag_results = await get_chat_rag_results(
                agent_id=agent_id,
                room_name=room_name,
                response_id=response_id
            )
            logger.info(f"✅ Successfully retrieved RAG results")
            return {"sources": rag_results}
            
        except ValueError as e:
            logger.error(f"❌ Value error in get_sources: {str(e)}")
            raise HTTPException(status_code=404, detail=str(e))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error retrieving sources: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/auth-diagnostics")
async def auth_diagnostics():
    """Diagnostic endpoint to check auth configuration"""
    try:
        logger.info(f"🔍 Running auth diagnostics")
        
        # Check if required environment variables are set
        diagnostics = {
            "settings_environment": settings.ENVIRONMENT,
            "clerk_jwt_issuer": settings.CLERK_JWT_ISSUER,
            "clerk_public_key_set": bool(settings.CLERK_PUBLIC_KEY),
            "clerk_secret_key_set": bool(settings.CLERK_SECRET_KEY),
            "jwks_url": f"{settings.CLERK_JWT_ISSUER}/.well-known/jwks.json" if settings.CLERK_JWT_ISSUER else "not_configured",
        }
        
        # Try to fetch JWKS if issuer is set
        if settings.CLERK_JWT_ISSUER:
            try:
                jwks_url = f"{settings.CLERK_JWT_ISSUER}/.well-known/jwks.json"
                async with httpx.AsyncClient() as client:
                    response = await client.get(jwks_url)
                    diagnostics["jwks_fetch_status"] = response.status_code
                    diagnostics["jwks_fetch_success"] = response.status_code == 200
            except Exception as e:
                diagnostics["jwks_fetch_error"] = str(e)
        
        # logger.info(f"Auth diagnostics: {diagnostics}")
        return JSONResponse(content=diagnostics)
    except Exception as e:
        logger.error(f"❌ Error in auth diagnostics: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)
