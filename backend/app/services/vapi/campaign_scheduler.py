import asyncio
from datetime import datetime, timezone
from typing import List, Dict, Any
import pytz

from app.core.logging_setup import logger
from app.clients.supabase_client import get_supabase
from app.services.vapi.outbound_calls import outbound_call_service
from app.services.vapi.business_hours import business_hours_service

"""
Service for scheduling and processing campaigns based on business hours
"""

async def process_active_campaigns():
    """
    Process all active campaigns that should be running now
    This should be called periodically by a scheduler
    """
    logger.info("Processing active campaigns")
    
    try:
        # Get all campaigns with status "started"
        supabase = await get_supabase()
        
        try:
            # Fix: Query for campaigns where status is "started"
            # If status is a JSON field or inside a JSON column, we need to adjust the query
            response = await supabase.table("campaigns").select("*").execute()
            logger.debug(f"Retrieved {len(response.data)} campaigns total")
            
            # Filter campaigns with status "started" in Python
            campaigns = [c for c in response.data if c.get("status") == "started"]
            logger.info(f"Found {len(campaigns)} active campaigns with status 'started'")
            
        except Exception as db_error:
            logger.error(f"Database error: {str(db_error)}")
            import traceback
            traceback.print_exc()
            return
        
        if not campaigns:
            logger.info("No active campaigns found")
            return
        
        # Process each campaign
        for campaign in campaigns:
            try:
                await process_campaign(campaign)
            except Exception as campaign_error:
                logger.error(f"Error processing individual campaign: {str(campaign_error)}")
                import traceback
                traceback.print_exc()
            
        logger.info("Finished processing active campaigns")
        
    except Exception as e:
        logger.error(f"Error processing active campaigns: {str(e)}")
        # Print more detailed error information
        import traceback
        traceback.print_exc()

async def process_campaign(campaign: Dict[str, Any]):
    """
    Process a single campaign if it's within business hours
    
    Args:
        campaign: Campaign data from database
    """
    campaign_id = campaign.get("id")
    user_id = campaign.get("user_id")
    
    logger.info(f"Processing campaign {campaign_id} for user {user_id}")
    
    try:
        
        # Check if campaign is within business hours
        business_info = campaign.get("business_information", {})
        timezone = business_info.get("timezone", "America/New_York")
        
        if not business_hours_service.is_within_business_hours(business_info, timezone):
            logger.info(f"Campaign {campaign_id} is outside business hours, skipping")
            return
        
        # Get campaign configuration
        agent_details = campaign.get("business_information", {})
        assistant_id = "9a950993-8e6a-459e-bb56-0f931ed2f3a5" # todo: get assistant ID from VAPI
        phone_number_id = "323e816f-db0a-48e9-a58b-d10c218d8134" # todo: get the phone number ID from VAPI
        
        if not assistant_id or not phone_number_id:
            logger.warning(f"Campaign {campaign_id} missing assistant_id or phone_number_id")
            return
        
        # Initiate calls for this campaign
        result = await outbound_call_service.initiate_campaign_calls(
            campaign_id=campaign_id,
            user_id=user_id,
            assistant_id=assistant_id,
            phone_number_id=phone_number_id,
            max_calls=1,  # Use default or configure as needed
        )
        
        if result.get("success", False):
            logger.info(f"Successfully initiated calls for campaign {campaign_id}")
        else:
            logger.warning(f"Failed to initiate calls for campaign {campaign_id}: {result.get('error')}")
            
    except Exception as e:
        logger.error(f"Error processing campaign {campaign_id}: {str(e)}")
        # Print more detailed error information
        import traceback
        traceback.print_exc() 