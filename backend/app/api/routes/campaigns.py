from fastapi import APIRouter, HTTPException, Depends, Request, UploadFile, File, Query
from typing import List, Dict, Any, Optional
from app.core.logging_setup import logger
from app.utils.flow_tracker import FlowTracker
import csv
import io
from datetime import datetime
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.clients.supabase_client import get_supabase
from app.services.campaigns import CampaignService
from app.models.campaigns import (
    CampaignCreate, 
    CampaignUpdate, 
    CampaignResponse,
    Client
)
from app.services.vapi.outbound_calls import outbound_call_service

router = APIRouter()

@router.get("/", response_model=List[CampaignResponse])
@FlowTracker.track_function()
async def get_campaigns(current_user: str = Depends(get_current_user)):
    """
    Get all campaigns for the current user
    """
    return await CampaignService.get_campaigns(current_user)

@router.post("/", response_model=CampaignResponse)
@FlowTracker.track_function()
async def create_campaign(
    campaign: CampaignCreate,
    current_user: str = Depends(get_current_user)
):
    """
    Create a new campaign for the current user
    """
    return await CampaignService.create_campaign(campaign, current_user)

@router.get("/{campaign_id}", response_model=CampaignResponse)
@FlowTracker.track_function()
async def get_campaign(
    campaign_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Get a specific campaign by ID
    """
    return await CampaignService.get_campaign(campaign_id, current_user)

@router.put("/{campaign_id}", response_model=CampaignResponse)
@FlowTracker.track_function()
async def update_campaign(
    campaign_id: str,
    campaign: CampaignUpdate,
    current_user: str = Depends(get_current_user)
):
    """
    Update a specific campaign by ID
    """
    return await CampaignService.update_campaign(campaign_id, campaign, current_user)

@router.delete("/{campaign_id}")
@FlowTracker.track_function()
async def delete_campaign(
    campaign_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Delete a specific campaign by ID
    """
    return await CampaignService.delete_campaign(campaign_id, current_user)
    
@router.put("/{campaign_id}/status", response_model=CampaignResponse)
@FlowTracker.track_function()
async def update_campaign_status(
    campaign_id: str,
    status: str,
    current_user: str = Depends(get_current_user)
):
    """
    Update campaign status (created, started, paused, finished)
    """
    return await CampaignService.update_campaign_status(campaign_id, status, current_user)

@router.post("/{campaign_id}/upload-clients", response_model=CampaignResponse)
@FlowTracker.track_function()
async def upload_clients_csv(
    campaign_id: str,
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    """
    Upload a CSV file with client data to add to a campaign
    """
    return await CampaignService.upload_clients_csv(campaign_id, file, current_user)

@router.post("/{campaign_id}/start-calls")
async def start_campaign_calls(
    campaign_id: str,
    assistant_id: str,
    phone_number_id: str,
    max_calls: Optional[int] = Query(10, gt=0, le=10),
    current_user: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Start outbound calls for a campaign
    
    Args:
        campaign_id: ID of the campaign
        assistant_id: ID of the VAPI assistant to use
        phone_number_id: ID of the phone number to use
        max_calls: Maximum number of concurrent calls (default: 10, max: 10)
        current_user: The authenticated user ID
        
    Returns:
        Dictionary with results of the call initiation
    """
    logger.info(f"API request to start calls for campaign {campaign_id}")
    
    return await CampaignService.start_campaign_calls(
        campaign_id=campaign_id,
        user_id=current_user,
        assistant_id=assistant_id,
        phone_number_id=phone_number_id,
        max_calls=max_calls
    )

@router.get("/{campaign_id}/call-stats")
async def get_campaign_call_stats(
    campaign_id: str,
    current_user: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get statistics about calls in a campaign
    
    Args:
        campaign_id: ID of the campaign
        current_user: The authenticated user ID
        
    Returns:
        Dictionary with call statistics
    """
    logger.info(f"API request to get call stats for campaign {campaign_id}")
    
    return await CampaignService.get_campaign_call_stats(campaign_id, current_user)

class ScheduleCallsRequest(BaseModel):
    assistant_id: str
    phone_number_id: str
    schedule_time: datetime
    max_calls: int = 10

@router.post("/{campaign_id}/schedule-calls")
async def schedule_campaign_calls(
    campaign_id: str,
    request: ScheduleCallsRequest,
    current_user: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Schedule outbound calls for a campaign at a future time
    
    Args:
        campaign_id: ID of the campaign
        request: Contains assistant_id, phone_number_id, schedule_time, and max_calls
        current_user: The authenticated user ID
        
    Returns:
        Dictionary with results of the call scheduling
    """
    logger.info(f"API request to schedule calls for campaign {campaign_id} at {request.schedule_time}")
    
    return await CampaignService.schedule_campaign_calls(
        campaign_id=campaign_id,
        user_id=current_user,
        assistant_id=request.assistant_id,
        phone_number_id=request.phone_number_id,
        schedule_time=request.schedule_time,
        max_calls=request.max_calls
    ) 