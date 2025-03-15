import json
import logging

from fastapi import APIRouter, HTTPException, Request, status, Depends, Query
from typing import Any, Dict, List, Optional
from pydantic import BaseModel

from app.services.vapi.api_handlers import VapiService
from app.services.vapi.calls import get_calls, delete_call, get_call_by_id
from app.core.auth import get_current_user

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize service
vapi_service = VapiService()

# Pydantic models for VAPI webhook events

class TransferPlan(BaseModel):
    mode: str

class Destination(BaseModel):
    message: Optional[str] = None
    numberE164CheckEnabled: Optional[bool] = None
    number: Optional[str] = None
    extension: Optional[str] = None
    callerId: Optional[str] = None
    transferPlan: Optional[TransferPlan] = None
    description: Optional[str] = None
    type: Optional[str] = None

class Transcriber(BaseModel):
    provider: str

class Model(BaseModel):
    model: str
    provider: str

class Voice(BaseModel):
    voiceId: str
    provider: str

class VoicemailDetection(BaseModel):
    key: Optional[str] = None

class TransportConfiguration(BaseModel):
    provider: str
    timeout: int
    record: bool

class Credential(BaseModel):
    apiKey: str
    provider: str

class ArtifactPlan(BaseModel):
    recordingEnabled: bool
    videoRecordingEnabled: bool
    pcapEnabled: bool
    pcapS3PathPrefix: Optional[str] = None

class StartSpeakingPlan(BaseModel):
    waitSeconds: float
    smartEndpointingEnabled: bool

class StopSpeakingPlan(BaseModel):
    numWords: int
    voiceSeconds: float
    backoffSeconds: float

class MonitorPlan(BaseModel):
    listenEnabled: bool
    controlEnabled: bool

class BackoffPlanType(BaseModel):
    key: Optional[str] = None

class BackoffPlan(BaseModel):
    maxRetries: int
    type: Optional[BackoffPlanType] = None
    baseDelaySeconds: float

class Server(BaseModel):
    timeoutSeconds: int
    url: str
    backoffPlan: Optional[BackoffPlan] = None

class HookAction(BaseModel):
    pass  # Placeholder for hook action implementation

class Hook(BaseModel):
    on: str
    do: List[HookAction]

class Assistant(BaseModel):
    transcriber: Optional[Transcriber] = None
    model: Optional[Model] = None
    voice: Optional[Voice] = None
    firstMessage: Optional[str] = None
    firstMessageMode: Optional[str] = None
    voicemailDetection: Optional[VoicemailDetection] = None
    clientMessages: Optional[List[str]] = None
    serverMessages: Optional[List[str]] = None
    silenceTimeoutSeconds: Optional[int] = None
    maxDurationSeconds: Optional[int] = None
    backgroundSound: Optional[str] = None
    backgroundDenoisingEnabled: Optional[bool] = None
    modelOutputInMessagesEnabled: Optional[bool] = None
    transportConfigurations: Optional[List[TransportConfiguration]] = None
    credentials: Optional[List[Credential]] = None
    name: Optional[str] = None
    voicemailMessage: Optional[str] = None
    endCallMessage: Optional[str] = None
    endCallPhrases: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    artifactPlan: Optional[ArtifactPlan] = None
    startSpeakingPlan: Optional[StartSpeakingPlan] = None
    stopSpeakingPlan: Optional[StopSpeakingPlan] = None
    monitorPlan: Optional[MonitorPlan] = None
    credentialIds: Optional[List[str]] = None
    server: Optional[Server] = None
    hooks: Optional[List[Hook]] = None

class AssistantOverrides(Assistant):
    variableValues: Optional[Dict[str, Any]] = None

class SquadMember(BaseModel):
    pass  # Placeholder for squad member implementation

class Squad(BaseModel):
    name: Optional[str] = None
    members: Optional[List[SquadMember]] = None
    membersOverrides: Optional[Dict[str, Any]] = None

class MessageResponse(BaseModel):
    destination: Optional[Destination] = None
    assistantId: Optional[str] = None
    assistant: Optional[Assistant] = None
    assistantOverrides: Optional[AssistantOverrides] = None
    squadId: Optional[str] = None
    squad: Optional[Squad] = None
    error: Optional[str] = None

class VapiWebhookEvent(BaseModel):
    messageResponse: Optional[MessageResponse] = None
    # Add other event types as needed

@router.post("/webhook")
async def vapi_webhook(request: Request):
    """
    Handle incoming webhook events from VAPI.
    """
    logger.info("Received VAPI webhook event")
    
    try:
        # Parse the raw JSON
        event_data = await request.json()
        # Log the full event for debugging
        logger.info(f"Webhook payload: {json.dumps(event_data, indent=2)}")
        
        # Process the event using the service
        response = await vapi_service.process_webhook_event(event_data)
        
        return response
    except json.JSONDecodeError:
        logger.error("Invalid JSON in webhook payload")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload"
        )
    except Exception as e:
        logger.error(f"Error processing VAPI webhook event: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing webhook: {str(e)}"
        )

# Alternative raw JSON endpoint for handling any webhook payload structure
@router.post("/webhook/raw")
async def vapi_webhook_raw(request: Request):
    """
    Handle raw webhook events from VAPI without validation.
    Useful during development or when handling unknown event structures.
    """
    logger.info("Received raw VAPI webhook event")
    
    try:
        # Parse the raw JSON
        event_data = await request.json()
        
        # Process the event using the service
        response = await vapi_service.process_webhook_event(event_data)
        
        return response
    except json.JSONDecodeError:
        logger.error("Invalid JSON in webhook payload")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload"
        )
    except Exception as e:
        logger.error(f"Error processing raw VAPI webhook event: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing webhook: {str(e)}"
        )

@router.get("/calls")
async def get_call_logs(
    current_user: str = Depends(get_current_user),
    limit: int = Query(1000, gt=0),
    offset: int = Query(0, ge=0)
):
    """
    Get all call logs for the authenticated user.
    
    Args:
        limit: Maximum number of records to return (default: 1000)
        offset: Number of records to skip for pagination (default: 0)
        
    Returns:
        A list of call log records
    """
    try:
        logger.info(f"Retrieving call logs for user: {current_user}")
        
        # The current_user is already the user_id string
        user_id = current_user
        
        # Get calls from the database
        calls = await get_calls(user_id=user_id, limit=limit, offset=offset)
        
        logger.info(f"Retrieved {len(calls)} call logs for user: {user_id}")
        
        return calls
    except Exception as e:
        logger.error(f"Error retrieving call logs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving call logs: {str(e)}"
        )

@router.delete("/calls/{call_id}")
async def delete_call_log(
    call_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Delete a call log by ID.
    
    Args:
        call_id: The ID of the call to delete
        
    Returns:
        A success message if the call was deleted
    """
    try:
        logger.info(f"Deleting call log with ID: {call_id} for user: {current_user}")
        
        # First, get the call to check ownership
        call = await get_call_by_id(call_id)
        
        if not call:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Call log with ID {call_id} not found"
            )
        
        # Check if the call belongs to the authenticated user
        if call.get("user_id") and call.get("user_id") != current_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this call log"
            )
        
        # Delete the call
        success = await delete_call(call_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete call log with ID {call_id}"
            )
        
        logger.info(f"Successfully deleted call log with ID: {call_id}")
        
        return {"message": f"Call log with ID {call_id} successfully deleted"}
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error deleting call log with ID {call_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting call log: {str(e)}"
        )
