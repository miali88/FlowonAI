from typing import List, Dict, Any, Optional
from fastapi import HTTPException, UploadFile
import csv
import io

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
                            "call_id": None
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
