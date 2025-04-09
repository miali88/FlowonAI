from typing import List, Dict, Any, Optional
from fastapi import HTTPException, UploadFile
import csv
import io
from datetime import datetime

from app.services.vapi.outbound_calls import outbound_call_service
from app.core.logging_setup import logger
from app.clients.supabase_client import get_supabase
from app.models.campaigns import (
    CampaignCreate, 
    CampaignUpdate, 
    CampaignResponse,
    Client
)

class CampaignService:
    @staticmethod
    async def get_campaigns(user_id: str) -> List[Dict[str, Any]]:
        """
        Get all campaigns for a user
        """
        logger.info(f"Fetching campaigns for user: {user_id}")
        try:
            # Initialize Supabase client
            supabase = await get_supabase()
            
            # Query campaigns table for the user
            response = await supabase.table("campaigns").select("*").eq("user_id", user_id).execute()
            
            if not response.data:
                logger.info(f"No campaigns found for user: {user_id}")
                return []
                
            logger.info(f"Retrieved {len(response.data)} campaigns for user: {user_id}")
            return response.data
        except Exception as e:
            logger.error(f"Error fetching campaigns: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to fetch campaigns: {str(e)}")

    @staticmethod
    async def create_campaign(campaign: CampaignCreate, user_id: str) -> Dict[str, Any]:
        """
        Create a new campaign for a user
        """
        logger.info(f"Creating new campaign for user: {user_id}")
        try:
            # Initialize Supabase client
            supabase = await get_supabase()
            
            # Prepare campaign data
            campaign_data = campaign.model_dump()
            campaign_data["user_id"] = user_id
            
            # Insert campaign into database
            response = await supabase.table("campaigns").insert(campaign_data).execute()
            
            if not response.data:
                logger.error("Failed to create campaign: No data returned from database")
                raise HTTPException(status_code=500, detail="Failed to create campaign")
                
            logger.info(f"Successfully created campaign with ID: {response.data[0]['id']}")
            return response.data[0]
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating campaign: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to create campaign: {str(e)}")

    @staticmethod
    async def get_campaign(campaign_id: str, user_id: str) -> Dict[str, Any]:
        """
        Get a specific campaign by ID
        """
        logger.info(f"Fetching campaign {campaign_id} for user: {user_id}")
        try:
            # Initialize Supabase client
            supabase = await get_supabase()
            
            # Query the specific campaign
            response = await supabase.table("campaigns").select("*").eq("id", campaign_id).eq("user_id", user_id).execute()
            
            if not response.data:
                logger.warning(f"Campaign {campaign_id} not found for user: {user_id}")
                raise HTTPException(status_code=404, detail="Campaign not found")
                
            logger.info(f"Retrieved campaign {campaign_id}")
            return response.data[0]
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching campaign {campaign_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to fetch campaign: {str(e)}")

    @staticmethod
    async def update_campaign(campaign_id: str, campaign: CampaignUpdate, user_id: str) -> Dict[str, Any]:
        """
        Update a specific campaign by ID
        """
        logger.info(f"Updating campaign {campaign_id} for user: {user_id}")
        try:
            # Initialize Supabase client
            supabase = await get_supabase()
            
            # Check if campaign exists and belongs to user
            check_response = await supabase.table("campaigns").select("id").eq("id", campaign_id).eq("user_id", user_id).execute()
            
            if not check_response.data:
                logger.warning(f"Campaign {campaign_id} not found for user: {user_id}")
                raise HTTPException(status_code=404, detail="Campaign not found")
            
            # Filter out None values to only update provided fields
            update_data = {k: v for k, v in campaign.model_dump().items() if v is not None}
                    
            # Update campaign
            response = await supabase.table("campaigns").update(update_data).eq("id", campaign_id).execute()
            
            if not response.data:
                logger.error(f"Failed to update campaign {campaign_id}")
                raise HTTPException(status_code=500, detail="Failed to update campaign")
                
            logger.info(f"Successfully updated campaign {campaign_id}")
            return response.data[0]
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating campaign {campaign_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to update campaign: {str(e)}")

    @staticmethod
    async def delete_campaign(campaign_id: str, user_id: str) -> Dict[str, str]:
        """
        Delete a specific campaign by ID
        """
        logger.info(f"Deleting campaign {campaign_id} for user: {user_id}")
        try:
            # Initialize Supabase client
            supabase = await get_supabase()
            
            # Check if campaign exists and belongs to user
            check_response = await supabase.table("campaigns").select("id").eq("id", campaign_id).eq("user_id", user_id).execute()
            
            if not check_response.data:
                logger.warning(f"Campaign {campaign_id} not found for user: {user_id}")
                raise HTTPException(status_code=404, detail="Campaign not found")
            
            # Delete campaign
            await supabase.table("campaigns").delete().eq("id", campaign_id).execute()
            
            logger.info(f"Successfully deleted campaign {campaign_id}")
            return {"message": "Campaign deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting campaign {campaign_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to delete campaign: {str(e)}")

    @staticmethod
    async def update_campaign_status(campaign_id: str, status: str, user_id: str) -> Dict[str, Any]:
        """
        Update campaign status (created, started, paused, finished)
        """
        logger.info(f"Updating status of campaign {campaign_id} to {status} for user: {user_id}")
        
        # Validate status
        valid_statuses = ["created", "started", "paused", "finished"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        
        try:
            # Initialize Supabase client
            supabase = await get_supabase()
            
            # Check if campaign exists and belongs to user
            check_response = await supabase.table("campaigns").select("id").eq("id", campaign_id).eq("user_id", user_id).execute()
            
            if not check_response.data:
                logger.warning(f"Campaign {campaign_id} not found for user: {user_id}")
                raise HTTPException(status_code=404, detail="Campaign not found")
            
            # Update campaign status
            response = await supabase.table("campaigns").update({"status": status}).eq("id", campaign_id).execute()
            
            if not response.data:
                logger.error(f"Failed to update status of campaign {campaign_id}")
                raise HTTPException(status_code=500, detail="Failed to update campaign status")
                
            logger.info(f"Successfully updated status of campaign {campaign_id} to {status}")
            return response.data[0]
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating status of campaign {campaign_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to update campaign status: {str(e)}")

    @staticmethod
    async def upload_clients_csv(campaign_id: str, file: UploadFile, user_id: str) -> Dict[str, Any]:
        """
        Upload a CSV file with client data to add to a campaign
        """
        logger.info(f"Uploading clients CSV for campaign {campaign_id} for user: {user_id}")
        
        # Check file extension
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are allowed")
        
        try:
            # Initialize Supabase client
            supabase = await get_supabase()
            
            # Check if campaign exists and belongs to user
            campaign_response = await supabase.table("campaigns").select("*").eq("id", campaign_id).eq("user_id", user_id).execute()
            
            if not campaign_response.data:
                logger.warning(f"Campaign {campaign_id} not found for user: {user_id}")
                raise HTTPException(status_code=404, detail="Campaign not found")
            
            campaign = campaign_response.data[0]
            
            # Read and parse CSV file
            contents = await file.read()
            csv_file = io.StringIO(contents.decode('utf-8'))
            csv_reader = csv.DictReader(csv_file)
            
            # Get existing clients
            current_clients = campaign.get("clients", [])
            
            # Process CSV rows
            new_clients = []
            for row in csv_reader:
                try:
                    # Validate required fields
                    if 'name' not in row or 'phone_number' not in row:
                        continue  # Skip rows without required fields
                    
                    # Create client object
                    client = {
                        "name": row['name'],
                        "phone_number": row['phone_number'],
                        "language": row.get('language', 'en'),
                        "personal_details": {},
                        "status": {
                            "status": "queued",
                            "number_of_calls": 0,
                            "call_id": None,
                            "retry_at": None,
                            "completion_time": None,
                            "last_call_time": None
                        }
                    }
                    
                    # Add any additional columns as personal details
                    for key, value in row.items():
                        if key not in ['name', 'phone_number', 'language']:
                            client["personal_details"][key] = value
                    
                    new_clients.append(client)
                except Exception as e:
                    logger.warning(f"Error processing CSV row: {str(e)}")
                    continue
            
            if not new_clients:
                raise HTTPException(status_code=400, detail="No valid client data found in CSV")
            
            # Add new clients to existing clients
            updated_clients = current_clients + new_clients
            
            # Update campaign with new clients
            response = await supabase.table("campaigns").update({"clients": updated_clients}).eq("id", campaign_id).execute()
            
            if not response.data:
                logger.error(f"Failed to add clients to campaign {campaign_id}")
                raise HTTPException(status_code=500, detail="Failed to add clients to campaign")
                
            logger.info(f"Successfully added {len(new_clients)} clients to campaign {campaign_id} from CSV")
            return response.data[0]
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error uploading clients CSV for campaign {campaign_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to upload clients CSV: {str(e)}")

    @staticmethod
    async def get_campaign_call_stats(campaign_id: str, user_id: str) -> Dict[str, Any]:
        """
        Get statistics about calls in a campaign
        
        Args:
            campaign_id: ID of the campaign
            user_id: ID of the user who owns the campaign
            
        Returns:
            Dictionary with call statistics
        """
        logger.info(f"Getting call stats for campaign {campaign_id}")
        try:
            # Initialize Supabase client
            supabase = await get_supabase()
            
            # Get campaign data
            campaign_response = await supabase.table("campaigns").select("*").eq("id", campaign_id).eq("user_id", user_id).execute()
            
            if not campaign_response.data:
                logger.warning(f"Campaign {campaign_id} not found for user {user_id}")
                raise HTTPException(status_code=404, detail="Campaign not found")
            
            campaign = campaign_response.data[0]
            clients = campaign.get("clients", [])
            
            # Calculate statistics
            total_clients = len(clients)
            status_counts = {
                "queued": 0,
                "in_progress": 0,
                "completed": 0,
                "failed": 0,
                "retry": 0
            }
            
            for client in clients:
                status = client.get("status", {}).get("status", "queued")
                if status in status_counts:
                    status_counts[status] += 1
                else:
                    status_counts[status] = 1
            
            # Calculate completion percentage
            completion_percentage = 0
            if total_clients > 0:
                completed = status_counts.get("completed", 0)
                completion_percentage = (completed / total_clients) * 100
            
            return {
                "campaign_id": campaign_id,
                "total_clients": total_clients,
                "status_counts": status_counts,
                "completion_percentage": completion_percentage
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting campaign call stats: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to get campaign call stats: {str(e)}")

    @staticmethod
    async def start_campaign_calls(
        campaign_id: str,
        user_id: str,
        assistant_id: str,
        phone_number_id: str,
        max_calls: int = 10
    ) -> Dict[str, Any]:
        """
        Start outbound calls for a campaign
        
        Args:
            campaign_id: ID of the campaign
            user_id: ID of the user who owns the campaign
            assistant_id: ID of the VAPI assistant to use
            phone_number_id: ID of the phone number to use
            max_calls: Maximum number of concurrent calls (default: 10)
            
        Returns:
            Dictionary with results of the call initiation
        """
        logger.info(f"Starting calls for campaign {campaign_id} with assistant {assistant_id}")
        
        try:
            # Verify campaign ownership
            campaign = await CampaignService.get_campaign(campaign_id, user_id)
            
            if not campaign:
                logger.warning(f"Campaign {campaign_id} not found for user {user_id}")
                raise HTTPException(status_code=404, detail="Campaign not found")
            
            # Start the calls
            result = await outbound_call_service.initiate_campaign_calls(
                campaign_id=campaign_id,
                user_id=user_id,
                assistant_id=assistant_id,
                phone_number_id=phone_number_id,
                max_calls=max_calls
            )
            
            if not result.get("success", False):
                logger.error(f"Failed to initiate calls: {result.get('error')}")
                raise HTTPException(
                    status_code=400, 
                    detail=result.get("error", "Failed to initiate calls")
                )
            
            # Update campaign status if calls were initiated
            if result.get("success_count", 0) > 0:
                await CampaignService.update_campaign_status(
                    campaign_id=campaign_id,
                    status="started",
                    user_id=user_id
                )
            
            return result
            
        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            logger.error(f"Error starting campaign calls: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to start campaign calls: {str(e)}")

    @staticmethod
    async def schedule_campaign_calls(
        campaign_id: str,
        user_id: str,
        assistant_id: str,
        phone_number_id: str,
        schedule_time: datetime,
        max_calls: int = 10
    ) -> Dict[str, Any]:
        """
        Schedule outbound calls for a campaign at a future time
        
        Args:
            campaign_id: ID of the campaign
            user_id: ID of the user who owns the campaign
            assistant_id: ID of the VAPI assistant to use
            phone_number_id: ID of the phone number to use
            schedule_time: When to schedule the calls
            max_calls: Maximum number of concurrent calls (default: 10)
            
        Returns:
            Dictionary with results of the call scheduling
        """
        logger.info(f"Scheduling calls for campaign {campaign_id} at {schedule_time}")
        
        try:
            # Verify campaign ownership
            campaign = await CampaignService.get_campaign(campaign_id, user_id)
            
            if not campaign:
                logger.warning(f"Campaign {campaign_id} not found for user {user_id}")
                raise HTTPException(status_code=404, detail="Campaign not found")            
            
            # Schedule the calls
            result = await outbound_call_service.schedule_campaign_calls(
                campaign_id=campaign_id,
                user_id=user_id,
                assistant_id=assistant_id,
                phone_number_id=phone_number_id,
                schedule_time=schedule_time,
                max_calls=max_calls
            )
            
            if not result.get("success", False):
                logger.error(f"Failed to schedule calls: {result.get('error')}")
                raise HTTPException(
                    status_code=400, 
                    detail=result.get("error", "Failed to schedule calls")
                )
            
            # Update campaign status
            await CampaignService.update_campaign_status(
                campaign_id=campaign_id,
                status="scheduled",
                user_id=user_id
            )
            
            return result
            
        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            logger.error(f"Error scheduling campaign calls: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to schedule campaign calls: {str(e)}")
