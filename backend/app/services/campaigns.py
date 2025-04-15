from typing import List, Dict, Any, Optional, Tuple
from fastapi import HTTPException, UploadFile
import csv
import io
from datetime import datetime, timezone

from app.services.vapi.outbound_calls import outbound_call_service
from app.core.logging_setup import logger
from app.clients.supabase_client import get_supabase
from app.models.campaigns import (
    CampaignCreate, 
    CampaignUpdate, 
    CampaignResponse,
    Client,
    ClientStatus
)
from app.services.vapi.assistants import create_assistant, update_assistant
from app.services.vapi.constants.voice_ids import get_voice_for_country, get_agent_name_for_voice
from app.services.guided_setup.language_utils import extract_country_and_language
from app.services import prompts

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
    async def create_campaign_assistant(campaign_data: Dict[str, Any], user_id: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Create a VAPI assistant for a campaign
        
        Args:
            campaign_data: The campaign data
            user_id: The user ID
            
        Returns:
            Tuple of (success, message, assistant_data)
        """
        try:
            logger.info(f"Creating VAPI assistant for campaign: {campaign_data.get('name')}")
            
            # Extract necessary information from campaign data
            business_info = campaign_data.get("business_information", {}) or {}
            business_name = business_info.get("businessName", campaign_data.get("name", "Business"))
            business_overview = business_info.get("businessOverview", "")
            
            # Get country and language from business address
            business_address = business_info.get("primaryBusinessAddress", "")
            
            # Safely extract country and language with error handling
            try:
                country_code, agent_language = extract_country_and_language(business_address)
            except Exception as e:
                logger.warning(f"Error extracting country and language: {str(e)}")
                country_code = "US"  # Default to US
                agent_language = "en-US"
            
            # Get voice ID based on country with fallback
            try:
                voice_id = get_voice_for_country(country_code)
            except Exception as e:
                logger.warning(f"Error getting voice for country: {str(e)}")
                voice_id = "eleven_labs_female_us"  # Default voice
            
            # Prepare message taking information if available
            message_taking = campaign_data.get("message_taking", {}) or {}
            specific_questions = message_taking.get("questions", []) or []
            opening_line = message_taking.get("opening_line", f"Hello! Thank you for calling {business_name}. How can I help you today?")
            closing_line = message_taking.get("closing_line", "Thank you for your time. We'll get back to you shortly. Have a great day!")
            
            # Format specific questions for the assistant
            questions_text = ""
            if specific_questions:
                questions_text = "Please ask the following specific questions:\n"
                for i, q in enumerate(specific_questions, 1):
                    if isinstance(q, dict):
                        question_text = q.get("question", "")
                    else:
                        question_text = str(q)
                    questions_text += f"{i}. {question_text}\n"
            
            # Add opening and closing lines to instructions
            additional_instructions = f"""
            When starting the call, use this opening line: "{opening_line}"
            
            {questions_text}
            
            When ending the call, use this closing line: "{closing_line}"
            """
            
            # Prepare system prompt with business information
            sys_prompt = prompts.answering_service.format(
                company_name=business_name, 
                business_overview=business_overview
            ) + "\n\n" + additional_instructions
            
            # Create the assistant using the direct function call
            logger.info(f"Creating VAPI assistant with business name: {business_name}")
            assistant_result = await create_assistant(
                business_name=business_name,
                voice_id=voice_id,
                sys_prompt=sys_prompt,
                metadata={
                    "campaign_id": campaign_data.get("id", ""),
                    "user_id": user_id,
                    "created_at": datetime.utcnow().isoformat()
                }
            )
            
            if not assistant_result:
                logger.error("Failed to create VAPI assistant: No response from API")
                return False, "Failed to create VAPI assistant: No response from API", None
            
            if "id" not in assistant_result:
                logger.error(f"Failed to create VAPI assistant: Missing ID in response: {assistant_result}")
                return False, "Failed to create VAPI assistant: Missing ID in response", None
            
            logger.info(f"Successfully created VAPI assistant with ID: {assistant_result['id']}")
            return True, f"Created VAPI assistant with ID: {assistant_result['id']}", assistant_result
        
        except Exception as e:
            logger.error(f"Error creating VAPI assistant: {str(e)}")
            return False, f"Error creating VAPI assistant: {str(e)}", None

    @staticmethod
    async def update_campaign_assistant(campaign_id: str, campaign_data: Dict[str, Any], user_id: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Update a VAPI assistant for a campaign
        
        Args:
            campaign_id: The campaign ID
            campaign_data: The updated campaign data
            user_id: The user ID
            
        Returns:
            Tuple of (success, message, assistant_data)
        """
        try:
            logger.info(f"Updating VAPI assistant for campaign: {campaign_id}")
            
            # Get the assistant ID from the campaign data
            vapi_assistant_id = campaign_data.get("vapi_assistant_id")
            
            # If no assistant ID exists, create a new one
            if not vapi_assistant_id:
                logger.info(f"No VAPI assistant ID found for campaign {campaign_id}, creating new assistant")
                
                # Create a new assistant
                success, message, assistant_result = await CampaignService.create_campaign_assistant(
                    {**campaign_data, "id": campaign_id}, 
                    user_id
                )
                
                if success and assistant_result and "id" in assistant_result:
                    # Update the campaign with the new assistant ID
                    supabase = await get_supabase()
                    await supabase.table("campaigns").update(
                        {"vapi_assistant_id": assistant_result["id"]}
                    ).eq("id", campaign_id).execute()
                    
                    logger.info(f"Created new VAPI assistant with ID {assistant_result['id']} for campaign {campaign_id}")
                    return success, message, assistant_result
                else:
                    logger.error(f"Failed to create new VAPI assistant for campaign {campaign_id}: {message}")
                    return success, message, assistant_result
            
            # Extract necessary information from campaign data
            business_info = campaign_data.get("business_information", {}) or {}
            business_name = business_info.get("businessName", campaign_data.get("name", "Business"))
            business_overview = business_info.get("businessOverview", "")
            
            # Get country and language from business address
            business_address = business_info.get("primaryBusinessAddress", "")
            
            # Safely extract country and language with error handling
            try:
                country_code, agent_language = extract_country_and_language(business_address)
            except Exception as e:
                logger.warning(f"Error extracting country and language: {str(e)}")
                country_code = "US"  # Default to US
                agent_language = "en-US"
            
            # Get voice ID based on country with fallback
            try:
                voice_id = get_voice_for_country(country_code)
            except Exception as e:
                logger.warning(f"Error getting voice for country: {str(e)}")
                voice_id = "eleven_labs_female_us"  # Default voice
            
            # Prepare message taking information if available
            message_taking = campaign_data.get("message_taking", {}) or {}
            specific_questions = message_taking.get("questions", []) or []
            opening_line = message_taking.get("opening_line", f"Hello! Thank you for calling {business_name}. How can I help you today?")
            closing_line = message_taking.get("closing_line", "Thank you for your time. We'll get back to you shortly. Have a great day!")
            
            # Format specific questions for the assistant
            questions_text = ""
            if specific_questions:
                questions_text = "Please ask the following specific questions:\n"
                for i, q in enumerate(specific_questions, 1):
                    if isinstance(q, dict):
                        question_text = q.get("question", "")
                    else:
                        question_text = str(q)
                    questions_text += f"{i}. {question_text}\n"
            
            # Add opening and closing lines to instructions
            additional_instructions = f"""
            When starting the call, use this opening line: "{opening_line}"
            
            {questions_text}
            
            When ending the call, use this closing line: "{closing_line}"
            """
            
            # Prepare system prompt with business information
            sys_prompt = prompts.answering_service.format(
                company_name=business_name, 
                business_overview=business_overview
            ) + "\n\n" + additional_instructions
            
            # Update the assistant using the direct function call
            logger.info(f"Updating VAPI assistant {vapi_assistant_id} with business name: {business_name}")
            assistant_result = await update_assistant(
                assistant_id=vapi_assistant_id,
                business_name=business_name,
                voice_id=voice_id,
                sys_prompt=sys_prompt,
                first_message=opening_line
            )
            
            if not assistant_result:
                logger.error("Failed to update VAPI assistant: No response from API")
                return False, "Failed to update VAPI assistant: No response from API", None
            
            logger.info(f"Successfully updated VAPI assistant with ID: {vapi_assistant_id}")
            return True, f"Updated VAPI assistant with ID: {vapi_assistant_id}", assistant_result
        
        except Exception as e:
            logger.error(f"Error updating VAPI assistant: {str(e)}")
            return False, f"Error updating VAPI assistant: {str(e)}", None

    @staticmethod
    async def create_campaign(campaign: CampaignCreate, user_id: str) -> Dict[str, Any]:
        """
        Create a new campaign for a user
        """
        logger.info(f"Creating new campaign for user: {user_id}")
        try:
            # Initialize Supabase client
            supabase = await get_supabase()
            
            # Fetch business information from guided_setup
            guided_setup_response = await supabase.table("guided_setup").select("business_information").eq("user_id", user_id).execute()
            
            business_information = {}
            if guided_setup_response.data and len(guided_setup_response.data) > 0:
                business_information = guided_setup_response.data[0].get("business_information", {})
                logger.info(f"Retrieved business information for user: {user_id}")
            else:
                logger.warning(f"No guided setup data found for user: {user_id}")
            
            # Prepare campaign data
            campaign_data = campaign.model_dump()
            campaign_data["user_id"] = user_id
            campaign_data["business_information"] = business_information
            
            # Ensure message_taking has the proper structure
            if "message_taking" not in campaign_data or not campaign_data["message_taking"]:
                campaign_data["message_taking"] = {
                    "ask_caller_name": False,
                    "ask_caller_phone_number": False,
                    "opening_line": "Thank you for contacting us! My name is Michael and I will assist you today.",
                    "closing_line": "We'll get back to you shortly. Have a great day!",
                    "questions": []
                }
            elif isinstance(campaign_data["message_taking"], dict):
                # Ensure all required fields exist
                if "ask_caller_name" not in campaign_data["message_taking"]:
                    campaign_data["message_taking"]["ask_caller_name"] = False
                if "ask_caller_phone_number" not in campaign_data["message_taking"]:
                    campaign_data["message_taking"]["ask_caller_phone_number"] = False
                if "opening_line" not in campaign_data["message_taking"]:
                    campaign_data["message_taking"]["opening_line"] = "Thank you for contacting us! My name is Michael and I will assist you today."
                if "closing_line" not in campaign_data["message_taking"]:
                    campaign_data["message_taking"]["closing_line"] = "We'll get back to you shortly. Have a great day!"
                if "questions" not in campaign_data["message_taking"]:
                    campaign_data["message_taking"]["questions"] = []
            
            # Insert campaign into database
            response = await supabase.table("campaigns").insert(campaign_data).execute()
            
            if not response.data:
                logger.error("Failed to create campaign: No data returned from database")
                raise HTTPException(status_code=500, detail="Failed to create campaign")
            
            created_campaign = response.data[0]
            logger.info(f"Successfully created campaign with ID: {created_campaign['id']}")
            
            # Create VAPI assistant for the campaign
            success, message, assistant_result = await CampaignService.create_campaign_assistant(
                created_campaign, 
                user_id
            )
            
            if success and assistant_result and "id" in assistant_result:
                # Update the campaign with the assistant ID
                await supabase.table("campaigns").update(
                    {"vapi_assistant_id": assistant_result["id"]}
                ).eq("id", created_campaign["id"]).execute()
                
                created_campaign["vapi_assistant_id"] = assistant_result["id"]
                logger.info(f"Added VAPI assistant ID {assistant_result['id']} to campaign {created_campaign['id']}")
            else:
                logger.warning(f"Failed to create VAPI assistant for campaign: {message}")
                
            return created_campaign
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
    async def update_campaign(campaign_id: str, campaign_update: CampaignUpdate, user_id: str) -> Dict[str, Any]:
        """
        Update an existing campaign
        """
        logger.info(f"Updating campaign {campaign_id} for user: {user_id}")
        try:
            # Initialize Supabase client
            supabase = await get_supabase()
            
            # Check if campaign exists and belongs to user
            campaign_response = await supabase.table("campaigns").select("*").eq("id", campaign_id).eq("user_id", user_id).execute()
            
            if not campaign_response.data:
                logger.error(f"Campaign {campaign_id} not found or does not belong to user {user_id}")
                raise HTTPException(status_code=404, detail="Campaign not found or access denied")
            
            # Get current campaign data
            current_campaign = campaign_response.data[0]
            
            # Prepare update data - only include fields that are provided in the update
            update_data = campaign_update.model_dump(exclude_unset=True)
            
            # Check if any fields were actually changed
            if not update_data:
                logger.info(f"No changes detected for campaign {campaign_id}")
                return current_campaign
            
            # Special handling for message_taking field
            if "message_taking" in update_data:
                # Get current message_taking or initialize empty dict
                current_message_taking = current_campaign.get("message_taking", {}) or {}
                
                # If update is providing a dict, merge with current values
                if isinstance(update_data["message_taking"], dict):
                    # Ensure required fields exist with defaults if not provided
                    message_taking = {
                        "ask_caller_name": update_data["message_taking"].get("ask_caller_name", 
                                     current_message_taking.get("ask_caller_name", False)),
                        "ask_caller_phone_number": update_data["message_taking"].get("ask_caller_phone_number", 
                                             current_message_taking.get("ask_caller_phone_number", False)),
                        "opening_line": update_data["message_taking"].get("opening_line") or 
                                       current_message_taking.get("opening_line") or 
                                       "Thank you for contacting us! My name is Michael and I will assist you today.",
                        "closing_line": update_data["message_taking"].get("closing_line") or 
                                       current_message_taking.get("closing_line") or 
                                       "We'll get back to you shortly. Have a great day!",
                        "questions": update_data["message_taking"].get("questions") or 
                                    current_message_taking.get("questions") or 
                                    []
                    }
                    
                    # Ensure boolean fields are explicitly set to boolean values
                    message_taking["ask_caller_name"] = bool(message_taking["ask_caller_name"])
                    message_taking["ask_caller_phone_number"] = bool(message_taking["ask_caller_phone_number"])
                    
                    update_data["message_taking"] = message_taking
                else:
                    # If it's not a dict, create the proper structure
                    update_data["message_taking"] = {
                        "ask_caller_name": current_message_taking.get("ask_caller_name", False),
                        "ask_caller_phone_number": current_message_taking.get("ask_caller_phone_number", False),
                        "questions": update_data.get("message_taking", []),
                        "opening_line": current_message_taking.get("opening_line") or 
                                       "Thank you for contacting us! My name is Michael and I will assist you today.",
                        "closing_line": current_message_taking.get("closing_line") or 
                                       "We'll get back to you shortly. Have a great day!"
                    }
            
            # Handle business_information field - preserve existing data if not provided
            if "business_information" in update_data and update_data["business_information"] is None:
                update_data["business_information"] = current_campaign.get("business_information", {})
            
            # Handle agent_details field
            if "agent_details" in update_data:
                logger.info(f"Updating agent_details for campaign {campaign_id}")
                logger.info(f"Current agent_details: {current_campaign.get('agent_details')}")
                logger.info(f"Update agent_details: {update_data['agent_details']}")
                
                current_agent_details = current_campaign.get("agent_details", {}) or {}
                agent_details = {
                    "campaign_start_date": current_agent_details.get("campaign_start_date", None),
                    "cool_off": current_agent_details.get("cool_off", 1),
                    "number_of_retries": current_agent_details.get("number_of_retries", 3),
                    "working_hours": current_agent_details.get("working_hours", {"start": "09:00", "end": "17:00"})
                }

                # Update only the fields that are being changed
                if "campaign_start_date" in update_data["agent_details"]:
                    agent_details["campaign_start_date"] = update_data["agent_details"]["campaign_start_date"]
                if "cool_off" in update_data["agent_details"]:
                    agent_details["cool_off"] = update_data["agent_details"]["cool_off"]
                if "number_of_retries" in update_data["agent_details"]:
                    agent_details["number_of_retries"] = update_data["agent_details"]["number_of_retries"]
                if "working_hours" in update_data["agent_details"]:
                    agent_details["working_hours"] = update_data["agent_details"]["working_hours"]

                # Validate campaign_start_date format if it exists
                if agent_details.get("campaign_start_date"):
                    try:
                        datetime.fromisoformat(agent_details["campaign_start_date"].replace('Z', '+00:00'))
                    except ValueError:
                        raise ValueError(f"Invalid campaign_start_date format for campaign {campaign_id}: {agent_details['campaign_start_date']}")

                # Validate working_hours format
                working_hours = agent_details.get("working_hours", {})
                if not isinstance(working_hours, dict) or "start" not in working_hours or "end" not in working_hours:
                    raise ValueError("working_hours must be an object with 'start' and 'end' time strings")

                for time_key in ["start", "end"]:
                    time_str = working_hours[time_key]
                    try:
                        datetime.strptime(time_str, "%H:%M")
                    except ValueError:
                        raise ValueError(f"Invalid time format for working_hours.{time_key}: {time_str}. Expected format: HH:MM")

                if agent_details != current_agent_details:
                    update_data["agent_details"] = agent_details
            
            # Handle clients field - ensure proper structure
            if "clients" in update_data and update_data["clients"] is not None:
                # Ensure each client has the required fields
                for client in update_data["clients"]:
                    if isinstance(client, dict) and "status" in client:
                        # Ensure status has the right structure
                        if not isinstance(client["status"], dict):
                            client["status"] = {
                                "status": client["status"] if isinstance(client["status"], str) else "queued",
                                "number_of_calls": 0,
                                "call_id": None
                            }
            
            # Validate campaign_start_date if present
            if "agent_details" in update_data and "campaign_start_date" in update_data["agent_details"]:
                try:
                    start_date = datetime.fromisoformat(update_data["agent_details"]["campaign_start_date"].replace('Z', '+00:00'))
                    if not start_date.tzinfo:
                        start_date = start_date.replace(tzinfo=timezone.utc)
                    
                    current_time = datetime.now(timezone.utc)
                    if start_date < current_time:
                        raise HTTPException(
                            status_code=400,
                            detail="Campaign start date cannot be in the past"
                        )
                except (ValueError, TypeError) as e:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid campaign start date format: {str(e)}"
                    )
            
            # Update campaign in database
            logger.info(f"Sending update to database: {update_data}")
            response = await supabase.table("campaigns").update(update_data).eq("id", campaign_id).execute()
            
            if not response.data:
                logger.error(f"Failed to update campaign {campaign_id}")
                raise HTTPException(status_code=500, detail="Failed to update campaign")
            
            updated_campaign = response.data[0]
            logger.info(f"Successfully updated campaign {campaign_id}")
            
            # Check if we need to update the VAPI assistant
            assistant_relevant_fields = ["name", "business_information", "message_taking"]
            assistant_fields_changed = any(field in update_data for field in assistant_relevant_fields)
            
            if assistant_fields_changed:
                logger.info(f"Assistant-relevant fields changed, updating VAPI assistant")
                success, message, assistant_result = await CampaignService.update_campaign_assistant(
                    campaign_id,
                    {**current_campaign, **update_data},
                    user_id
                )
                
                if not success:
                    logger.warning(f"Failed to update VAPI assistant: {message}")
            logger.info(f"Updated campaign data: {updated_campaign}")
            
            return updated_campaign
        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            logger.error(f"Error updating campaign: {str(e)}")
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

    @staticmethod
    async def check_and_start_scheduled_campaigns():
        """
        Check for campaigns that have reached their scheduled start date
        and update their status from 'created' to 'started'.
        
        This function is meant to be run periodically as a background task.
        """
        logger.info("Checking for campaigns that should be started based on schedule")
        try:
            # Initialize Supabase client
            supabase = await get_supabase()
            
            # Get current time in ISO format
            current_time = datetime.utcnow().replace(tzinfo=timezone.utc)
            
            # Query for all campaigns first, then filter in Python
            # This avoids the JSON syntax error
            campaigns_response = await supabase.table("campaigns").select("*").execute()
            
            if not campaigns_response.data:
                logger.info("No campaigns found")
                return 0
            
            # Filter campaigns with status "created" in Python
            created_campaigns = [c for c in campaigns_response.data if c.get("status") == "created"]
            
            if not created_campaigns:
                logger.info("No campaigns with 'created' status found")
                return 0
            
            campaigns_to_start = []
            for campaign in created_campaigns:
                agent_details = campaign.get("agent_details", {}) or {}
                campaign_start_date = agent_details.get("campaign_start_date")
                
                if not campaign_start_date:
                    continue
                    
                # Check if the start date has passed
                try:
                    # Parse the date string to a datetime object and ensure it's timezone-aware
                    start_date = datetime.fromisoformat(campaign_start_date.replace('Z', '+00:00'))
                    if not start_date.tzinfo:
                        start_date = start_date.replace(tzinfo=timezone.utc)
                    
                    if current_time >= start_date:
                        campaigns_to_start.append(campaign)
                        logger.info(f"Campaign {campaign['id']} scheduled start time has passed, will be started")
                except (ValueError, TypeError) as e:
                    logger.warning(f"Invalid campaign_start_date format for campaign {campaign['id']}: {str(e)}")
                    continue
            
            # Update the status of campaigns that should be started
            for campaign in campaigns_to_start:
                campaign_id = campaign["id"]
                user_id = campaign["user_id"]
                
                # Update campaign status to 'started'
                await CampaignService.update_campaign_status(
                    campaign_id=campaign_id,
                    status="started",
                    user_id=user_id
                )
                
                logger.info(f"Campaign {campaign_id} status updated to 'started' based on scheduled start date")
            
            return len(campaigns_to_start)
        
        except Exception as e:
            logger.error(f"Error checking scheduled campaigns: {str(e)}")
            # Don't raise exception to prevent background task from failing
            return 0

    @staticmethod
    async def schedule_campaign_start(
        campaign_id: str,
        start_date: datetime,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Schedule a campaign to start at a specific date and time
        
        Args:
            campaign_id: ID of the campaign
            start_date: Date and time when the campaign should start
            user_id: ID of the user who owns the campaign
            
        Returns:
            Dictionary with the updated campaign data
        """
        logger.info(f"Scheduling campaign {campaign_id} to start at {start_date}")
        
        try:
            # Get the current campaign
            campaign = await CampaignService.get_campaign(campaign_id, user_id)
            
            if not campaign:
                logger.warning(f"Campaign {campaign_id} not found for user {user_id}")
                raise HTTPException(status_code=404, detail="Campaign not found")
            
            # Update the agent_details with the campaign_start_date
            agent_details = campaign.get("agent_details", {}) or {}
            agent_details["campaign_start_date"] = start_date.isoformat()
            
            # Create update object
            update_data = CampaignUpdate(
                agent_details=agent_details,
                status="created"  # Ensure status is 'created' so it can be started by the scheduler
            )
            
            # Update the campaign
            updated_campaign = await CampaignService.update_campaign(
                campaign_id=campaign_id,
                campaign_update=update_data,
                user_id=user_id
            )
            
            return {
                "success": True,
                "message": f"Campaign scheduled to start at {start_date}",
                "campaign": updated_campaign
            }
            
        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            logger.error(f"Error scheduling campaign start: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to schedule campaign start: {str(e)}")
