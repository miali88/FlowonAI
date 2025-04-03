from fastapi import APIRouter, HTTPException, Depends, Request, UploadFile, File
from typing import List, Dict, Any, Optional
from app.core.logging_setup import logger
from app.utils.flow_tracker import FlowTracker
import csv
import io

from app.core.auth import get_current_user
from app.clients.supabase_client import get_supabase
from app.services.campaigns import CampaignService
from app.models.campaigns import (
    CampaignCreate, 
    CampaignUpdate, 
    CampaignResponse,
    Client
)

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