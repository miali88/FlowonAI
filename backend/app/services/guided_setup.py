from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Tuple
import logging
import os

from humanloop import Humanloop

from app.clients.elevenlabs_client import elevenlabs_client
from app.services import prompts
from app.clients.supabase_client import get_supabase
from app.services.voice.agents import create_agent, get_agents, update_agent
from app.services.chat.chat import llm_response
from app.services.knowledge_base.web_scrape import scrape_url_simple

# Pydantic models matching the frontend types
class TrainingSource(BaseModel):
    googleBusinessProfile: Optional[str] = None
    businessWebsite: Optional[str] = None

class BusinessHours(BaseModel):
    open: str
    close: str

class BusinessInformation(BaseModel):
    businessName: str
    businessOverview: str
    primaryBusinessAddress: str
    primaryBusinessPhone: str
    coreServices: List[str]
    businessHours: Dict[str, BusinessHours]

class CallerName(BaseModel):
    required: bool
    alwaysRequested: bool

class CallerPhoneNumber(BaseModel):
    required: bool
    automaticallyCaptured: bool

class SpecificQuestion(BaseModel):
    question: str
    required: bool

class MessageTaking(BaseModel):
    callerName: CallerName
    callerPhoneNumber: CallerPhoneNumber
    specificQuestions: List[SpecificQuestion]

class EmailNotifications(BaseModel):
    enabled: bool
    email: Optional[str] = None

class SmsNotifications(BaseModel):
    enabled: bool
    phoneNumber: Optional[str] = None

class CallNotifications(BaseModel):
    emailNotifications: EmailNotifications
    smsNotifications: SmsNotifications

class QuickSetupData(BaseModel):
    trainingSources: TrainingSource
    businessInformation: BusinessInformation
    messageTaking: MessageTaking
    callNotifications: CallNotifications

class RetrainAgentRequest(BaseModel):
    url: str = Field(..., description="URL of the website to scrape for agent retraining")
    setup_data: Optional[QuickSetupData] = Field(None, description="Optional setup data for agent retraining")

class RetrainAgentResponse(BaseModel):
    success: bool
    business_overview: Optional[str] = None
    error: Optional[str] = None
    setup_data: Optional[dict] = None

async def save_guided_setup(user_id: str, quick_setup_data: QuickSetupData, phone_number: str = "(814) 261-0317"):
    """Save the guided setup data to Supabase."""
    
    # Check if the user already has setup data
    existing_setup = await get_guided_setup(user_id)
    
    # Convert Pydantic models to dictionaries for JSONB columns
    setup_data = {
        "user_id": user_id,
        "training_sources": quick_setup_data.trainingSources.dict(),
        "business_information": quick_setup_data.businessInformation.dict(),
        "message_taking": quick_setup_data.messageTaking.dict(),
        "call_notifications": quick_setup_data.callNotifications.dict(),
        "phone_number": phone_number,
    }
    
    # If record exists, preserve the setup_completed value and agent_id
    # If it's a new record, set setup_completed to False by default
    if existing_setup:
        # Preserve the existing setup_completed status 
        setup_data["setup_completed"] = existing_setup.get("setup_completed", False)
        
        # Preserve the existing agent_id if it exists
        if "agent_id" in existing_setup and existing_setup["agent_id"]:
            setup_data["agent_id"] = existing_setup["agent_id"]
            logging.info(f"Preserving existing agent_id: {existing_setup['agent_id']} for user {user_id}")
        else:
            logging.info(f"No agent_id to preserve for user {user_id}")
            
        logging.info(f"Updating existing guided setup data for user {user_id}")
    else:
        # New record, not completed yet
        setup_data["setup_completed"] = False
        logging.info(f"Creating new guided setup data for user {user_id}")
    
    # Update or insert the record
    supabase = await get_supabase()
    try:
        if existing_setup:
            # Update existing record
            result = await supabase.table("guided_setup").update(setup_data).eq("user_id", user_id).execute()
            logging.info(f"Successfully updated guided setup data for user {user_id}")
        else:
            # Insert new record
            result = await supabase.table("guided_setup").insert(setup_data).execute()
            logging.info(f"Successfully created guided setup data for user {user_id}")
        
        # Supabase client might return different response object types
        if hasattr(result, 'error') and result.error:
            logging.error(f"Database error with guided setup: {result.error}")
    except Exception as e:
        logging.error(f"Exception during guided setup save: {str(e)}")
    
    # Verify the data was saved correctly
    updated_setup = await get_guided_setup(user_id)
    if updated_setup:
        # Check if agent_id was preserved
        if "agent_id" in setup_data and setup_data["agent_id"]:
            if updated_setup.get("agent_id") == setup_data["agent_id"]:
                logging.info(f"Verified agent_id was correctly preserved: {setup_data['agent_id']}")
            else:
                logging.warning(f"agent_id was not correctly preserved. Expected: {setup_data['agent_id']}, Got: {updated_setup.get('agent_id')}")
    else:
        logging.error(f"Failed to verify guided setup data save for user {user_id}")
    
    return setup_data

async def get_guided_setup(user_id: str):
    """Retrieve the guided setup data for a user from Supabase."""
    supabase = await get_supabase()
    
    # Query the guided_setup table for the user's data
    result = await supabase.table("guided_setup").select("*").eq("user_id", user_id).execute()
    
    if result.data and len(result.data) > 0:
        logging.info(f"Retrieved guided setup data for user {user_id}")
        return result.data[0]
    
    logging.info(f"No guided setup data found for user {user_id}")
    return None

async def has_completed_setup(user_id: str) -> bool:
    """Check if a user has completed the guided setup."""
    setup = await get_guided_setup(user_id)
    return setup is not None and setup.get("setup_completed", False)

async def create_or_update_agent_from_setup(user_id: str, setup_data: Dict[str, Any]) -> Tuple[bool, str, Any]:
    """
    Helper function to create or update an agent based on guided setup data.
    
    Args:
        user_id: The user ID
        setup_data: The setup data in frontend format (not database format)
        
    Returns:
        Tuple of (success, message, agent_data)
    """
    try:
        logging.info(f"Checking for existing agents for user {user_id}")
        
        # Get the user's guided setup data to retrieve the phone number and agent_id
        guided_setup_data = await get_guided_setup(user_id)
        phone_number = guided_setup_data.get("phone_number", "") if guided_setup_data else ""
        agent_id = guided_setup_data.get("agent_id") if guided_setup_data else None
        guided_setup_id = guided_setup_data.get("id") if guided_setup_data else None
        
        logging.info(f"Retrieved phone number for agent assignment: {phone_number}")
        if agent_id:
            logging.info(f"Found existing agent_id in guided_setup: {agent_id}")
        else:
            logging.info(f"No agent_id found in guided_setup for user {user_id}")
            
        if guided_setup_id:
            logging.info(f"Found guided_setup_id: {guided_setup_id}")
        else:
            logging.warning(f"No guided_setup_id found for user {user_id}")
        
        # Extract business information for agent creation/update
        business_info = setup_data.get("businessInformation", {})
        business_name = business_info.get("businessName", "My Business")
        business_overview = business_info.get("businessOverview", "")
        
        logging.info(f"Preparing agent data for business: {business_name}")

        features = {
                    "end_call": {
                        "enabled": True
                    },
                    "call_transfer": {
                        "enabled": True
                    },
                    "notifyOnInterest": {
                        "enabled": True
                    },}

        # Prepare agent data
        agent_data = {
            "userId": user_id,
            "agentName": f"{business_name} Assistant",
            "agentPurpose": "telephone-agent",  # Default purpose
            "instructions": prompts.answering_service.format(company_name=business_name, business_overview=business_overview),  # Include both variables
            "dataSource": "guided_setup",  # Mark this agent as created from guided setup
            "openingLine": f"Hello! Thank you for calling {business_name}. Our call may be recorded for quality control purposes, my name is Fiona. How can I help you today?",
            "language": "en-US",  # Default to English
            "voice": "Ize3YDdGqJYYKQSDLORJ", # jessica
            "features" : features,
            "assigned_telephone" : phone_number,  # Use the phone number from guided setup
            "voiceProvider" : "elevenlabs",
            "notify": True,  # Enable notifications
        }
        
        # Add guided_setup_id reference to agent data if available
        if guided_setup_id:
            agent_data["guided_setup_id"] = guided_setup_id
            logging.info(f"Added guided_setup_id {guided_setup_id} to agent data")
        
        # Add specific questions as form fields if available
        specific_questions = setup_data.get("messageTaking", {}).get("specificQuestions", [])
        if specific_questions:
            form_fields = []
            for q in specific_questions:
                # Handle both dict and SpecificQuestion object types
                if isinstance(q, dict) and "question" in q:
                    form_fields.append({
                        "name": q["question"],
                        "required": q.get("required", False)
                    })
                elif hasattr(q, "question") and hasattr(q, "required"):
                    form_fields.append({
                        "name": q.question,
                        "required": q.required
                    })
            if form_fields:
                agent_data["form_fields"] = form_fields
                logging.info(f"Added {len(form_fields)} form fields to agent data")
        
        # First check if we have an agent_id in the guided_setup table
        if agent_id:
            logging.info(f"Updating existing agent with ID from guided_setup: {agent_id}")
            
            # Make sure guided_setup_id is also updated for this existing agent
            if guided_setup_id:
                logging.info(f"Adding guided_setup_id {guided_setup_id} to existing agent {agent_id}")
            
            result = await update_agent(agent_id, agent_data)
            logging.info(f"Successfully updated agent for user {user_id}")
            return True, f"Updated existing agent with ID: {agent_id}", result
        else:
            # If no agent_id in guided_setup, check if there's an existing agent with dataSource=guided_setup
            user_agents = await get_agents(user_id)
            existing_agent = None
            
            if user_agents and user_agents.data:
                logging.info(f"Found {len(user_agents.data)} agents for user {user_id}")
                for agent in user_agents.data:
                    logging.info(f"Checking agent: {agent.get('id')} with dataSource: {agent.get('dataSource')}")
                    if agent.get("dataSource") == "guided_setup":
                        existing_agent = agent
                        logging.info(f"Found existing guided setup agent with ID: {agent.get('id')}")
                        break
            else:
                logging.info(f"No existing agents found for user {user_id}")
            
            # Update or create the agent
            if existing_agent:
                agent_id = existing_agent.get("id")
                logging.info(f"Updating existing agent with ID: {agent_id}")
                
                # Make sure guided_setup_id is also updated if it's not already set
                if guided_setup_id and not existing_agent.get("guided_setup_id"):
                    logging.info(f"Adding guided_setup_id {guided_setup_id} to existing agent {agent_id}")
                    # Don't overwrite any existing guided_setup_id
                elif existing_agent.get("guided_setup_id") and existing_agent.get("guided_setup_id") != guided_setup_id:
                    logging.warning(f"Agent already has a different guided_setup_id: {existing_agent.get('guided_setup_id')} vs new: {guided_setup_id}")
                
                result = await update_agent(agent_id, agent_data)
                
                # Store the agent_id in the guided_setup table for future reference
                update_success = await update_guided_setup_agent_id(user_id, agent_id)
                if update_success:
                    logging.info(f"Successfully stored agent_id in guided_setup table")
                else:
                    logging.warning(f"Failed to store agent_id in guided_setup table")
                
                logging.info(f"Successfully updated agent for user {user_id}")
                return True, f"Updated existing agent with ID: {agent_id}", result
            else:
                logging.info(f"Creating new agent for user {user_id}")
                result = await create_agent(agent_data)
                
                # Store the created agent_id in the guided_setup table
                if result and "id" in result:
                    new_agent_id = result["id"]
                    update_success = await update_guided_setup_agent_id(user_id, new_agent_id)
                    if update_success:
                        logging.info(f"Successfully stored new agent_id {new_agent_id} in guided_setup table")
                    else:
                        logging.warning(f"Failed to store new agent_id {new_agent_id} in guided_setup table")
                else:
                    logging.warning(f"Created agent result does not contain an ID: {result}")
                
                logging.info(f"Successfully created new agent for user {user_id}")
                return True, "Created new agent", result
    
    except Exception as e:
        error_msg = f"Error creating/updating agent: {str(e)}"
        logging.error(error_msg)
        return False, error_msg, None

async def update_guided_setup_agent_id(user_id: str, agent_id: str) -> bool:
    """Update the agent_id field in the guided_setup table for a user."""
    try:
        if not user_id:
            logging.error("Cannot update guided_setup agent_id: user_id is empty")
            return False
            
        if not agent_id:
            logging.error("Cannot update guided_setup agent_id: agent_id is empty")
            return False
            
        logging.info(f"Updating guided_setup agent_id to {agent_id} for user {user_id}")
        
        # First, check if the agent exists
        try:
            from services.voice.agents import get_agent
            agent = await get_agent(agent_id)
            if not agent or not agent.data:
                logging.error(f"Cannot update guided_setup agent_id: Agent {agent_id} does not exist")
                return False
            
            logging.info(f"Verified agent {agent_id} exists")
        except Exception as agent_error:
            # If we can't verify the agent, we'll proceed anyway but log the error
            logging.warning(f"Could not verify agent existence, proceeding anyway: {str(agent_error)}")
            
        # Next, check if the guided_setup record exists
        existing_setup = await get_guided_setup(user_id)
        if not existing_setup:
            logging.error(f"Cannot update guided_setup agent_id: No setup record found for user {user_id}")
            return False
            
        # Update the agent_id
        supabase = await get_supabase()
        try:
            result = await supabase.table("guided_setup").update(
                {"agent_id": agent_id}
            ).eq("user_id", user_id).execute()
            
            if hasattr(result, 'error') and result.error:
                logging.error(f"Error updating guided_setup agent_id: {result.error}")
                return False
                
            logging.info(f"Database update for agent_id completed")
        except Exception as e:
            logging.error(f"Exception during database update for agent_id: {str(e)}")
            return False
            
        # Verify the update was successful
        try:
            updated_setup = await get_guided_setup(user_id)
            if updated_setup and updated_setup.get("agent_id") == agent_id:
                logging.info(f"Successfully verified agent_id update to {agent_id} for user {user_id}")
                return True
            else:
                current_id = updated_setup.get("agent_id") if updated_setup else "None"
                logging.warning(f"Failed to verify agent_id update. Expected: {agent_id}, Got: {current_id}")
                return False
        except Exception as e:
            logging.error(f"Exception during verification of agent_id update: {str(e)}")
            return False
            
    except Exception as e:
        logging.error(f"Exception updating guided_setup agent_id: {str(e)}")
        return False

async def mark_setup_complete(user_id: str) -> Dict[str, Any]:
    """Mark the guided setup as complete."""
    try:
        logging.info(f"Marking setup as complete for user: {user_id}")
        
        # Get user's guided setup data
        setup_data = await get_guided_setup(user_id)
        
        if not setup_data:
            return {
                "success": False,
                "error": "No setup data found for user"
            }
        
        # Update setup data to mark as complete
        updated_data = {**setup_data, "setup_completed": True}
        
        # Update in the database
        supabase = await get_supabase()
        response = await supabase.table("guided_setup").update(
            updated_data
        ).eq("user_id", user_id).execute()
        
        if response.error:
            logging.error(f"Error updating guided setup: {response.error}")
            raise Exception(response.error.message)
            
        logging.info(f"Successfully marked setup as complete for user: {user_id}")
        
        # Convert database format to frontend format for use in agent creation
        formatted_data = {
            "trainingSources": setup_data.get("training_sources", {}),
            "businessInformation": setup_data.get("business_information", {}),
            "messageTaking": setup_data.get("message_taking", {}),
            "callNotifications": setup_data.get("call_notifications", {})
        }
        
        # Create or update the agent using the centralized function
        success, message, _ = await create_or_update_agent_from_setup(user_id, formatted_data)
        if not success:
            logging.warning(f"Agent creation/update during setup completion: {message}")
        
        return {
            "success": True,
            "message": "Setup marked as complete"
        }
            
    except Exception as e:
        logging.error(f"Error marking setup as complete: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

async def get_formatted_setup_data(user_id: str) -> Dict[str, Any]:
    """Get formatted setup data for the frontend."""
    setup = await get_guided_setup(user_id)
    
    if not setup:
        return {
            "success": False,
            "message": "No setup data found for this user"
        }
    
    # Convert the database format back to the frontend format
    formatted_data = {
        "trainingSources": setup.get("training_sources", {}),
        "businessInformation": setup.get("business_information", {}),
        "messageTaking": setup.get("message_taking", {}),
        "callNotifications": setup.get("call_notifications", {})
    }
    
    return {
        "success": True,
        "setupData": formatted_data,
        "phoneNumber": setup.get("phone_number", "(814) 261-0317")
    }

async def get_rosie_phone_number(user_id: str) -> Dict[str, Any]:
    """Get the Rosie phone number for a user."""
    try:
        # Try to retrieve existing setup
        setup = await get_guided_setup(user_id)
        
        if setup and "phone_number" in setup:
            logging.info(f"Retrieved phone number for user {user_id}: {setup['phone_number']}")
            return {
                "success": True,
                "phoneNumber": setup["phone_number"]
            }
        
        # If no setup exists or no phone number, return default number
        default_number = "(814) 261-0317"
        logging.info(f"No phone number found for user {user_id}, returning default: {default_number}")
        return {
            "success": True,
            "phoneNumber": default_number
        }
    except Exception as e:
        logging.error(f"Error getting phone number: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

async def submit_quick_setup(user_id: str, setup_data: QuickSetupData) -> Dict[str, Any]:
    """Process quick setup data submission."""
    try:
        # Mock phone number - in production this would be dynamically assigned
        phone_number = "(814) 261-0317"
        
        # Log the specific questions for debugging
        specific_questions = setup_data.messageTaking.specificQuestions if setup_data.messageTaking else []
        question_count = len(specific_questions)
        logging.info(f"Received {question_count} specific questions for user {user_id}")
        if question_count > 0:
            for i, q in enumerate(specific_questions):
                logging.info(f"Question {i+1}: '{q.question}' (Required: {q.required})")
        
        # Save the setup data to Supabase
        await save_guided_setup(user_id, setup_data, phone_number)
        
        logging.info(f"Quick setup completed for user {user_id}")
        
        # Convert the Pydantic model to dict for the agent creation function
        setup_data_dict = {
            "trainingSources": setup_data.trainingSources.dict(),
            "businessInformation": setup_data.businessInformation.dict(),
            "messageTaking": setup_data.messageTaking.dict(),
            "callNotifications": setup_data.callNotifications.dict()
        }
        
        # Create or update the agent using the centralized function
        success, message, _ = await create_or_update_agent_from_setup(user_id, setup_data_dict)
        if not success:
            logging.warning(f"Agent creation/update during quick setup: {message}")
        
        return {
            "success": True,
            "phoneNumber": phone_number,
            "message": "Quick setup data received successfully"
        }
    except Exception as e:
        logging.error(f"Error in quick-setup: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

async def check_setup_status(user_id: str) -> Dict[str, Any]:
    """Check if the user has completed the guided setup."""
    try:
        logging.info(f"Checking setup status for user: {user_id}")
        
        # Get user's guided setup data
        setup_data = await get_guided_setup(user_id)
        
        # Check if setup is complete
        is_complete = setup_data.get("setup_completed", False) if setup_data else False
        
        return {
            "success": True,
            "isComplete": is_complete
        }
    except Exception as e:
        logging.error(f"Error checking setup status: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

async def generate_business_overview(scraped_content: str) -> str:
    """
    Generate a business overview using an LLM from the scraped content.
    
    Args:
        scraped_content: The content scraped from the website.
        
    Returns:
        A string containing the business overview.
    """
    try:
        # Use the working llm_response function from chat.py
        system_prompt = "You are a helpful assistant that generates concise business overviews. Extract key information about the business including what they do, their value proposition, target audience, and any unique selling points. You must only output the business overview, nothing else, with no other text or commentary."
        user_prompt = f"Generate a business overview from the following content. You must only output the business overview, nothing else, with no other text or commentary. Focus on creating a clear, professional summary that captures the essence of the business in 3-5 sentences:\n\n{scraped_content}"
        
        # Call the llm_response function with appropriate parameters
        response = await llm_response(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            conversation_history=None,  # No conversation history needed for this task
            model="claude",  # Using Claude as the default model
            token_size=300  # Increase token count for more detailed overview
        )
        
        return response.strip() if response else "Unable to generate business overview."
    except Exception as e:
        logging.error(f"Error generating business overview: {str(e)}")
        # Return a fallback message instead of raising an exception
        return "Unable to generate business overview due to an error."

""" ENTRY POINT FOR RETRAINING AGENT """
async def retrain_agent_service(user_id: str, request: RetrainAgentRequest) -> RetrainAgentResponse:
    """
    Business logic for retraining an agent with website data.
    """
    try:
        logging.info(f"Retraining agent for user {user_id} with URL: {request.url}")
        
        # Get existing setup data for the user
        existing_setup = await get_guided_setup(user_id)
        if not existing_setup:
            logging.warning(f"No existing setup data found for user {user_id}")
        else:
            logging.info(f"Found existing guided setup data for user {user_id}")
            if "agent_id" in existing_setup and existing_setup["agent_id"]:
                logging.info(f"Found existing agent_id in guided setup: {existing_setup['agent_id']}")
            else:
                logging.info(f"No agent_id found in existing guided setup for user {user_id}")
            
        # Log specific questions if provided in setup data
        if request.setup_data and request.setup_data.messageTaking:
            specific_questions = request.setup_data.messageTaking.specificQuestions
            question_count = len(specific_questions)
            logging.info(f"Received {question_count} specific questions for retraining")
            if question_count > 0:
                for i, q in enumerate(specific_questions):
                    logging.info(f"Question {i+1}: '{q.question}' (Required: {q.required})")
        
        # Generate business overview from the URL
        # 1. Crawl the website to get content
        scraped_content = await scrape_url_simple(request.url)

        # 2. Generate business overview from content using LLM
        business_overview = await generate_business_overview(scraped_content)
        
        logging.info(f"Generated business overview for user {user_id}")
        
        # Use provided setup data or create minimal setup data
        setup_data = {}
        if request.setup_data:
            logging.info(f"Using provided setup data for update")
            setup_data = request.setup_data.dict()
        elif existing_setup:
            # Convert database format to frontend format
            setup_data = {
                "trainingSources": existing_setup.get("training_sources", {}),
                "businessInformation": existing_setup.get("business_information", {}),
                "messageTaking": existing_setup.get("message_taking", {}),
                "callNotifications": existing_setup.get("call_notifications", {})
            }
            logging.info(f"Using existing setup data from database for user {user_id}")
        else:
            # Create minimal setup data with the business overview
            setup_data = {
                "trainingSources": {"businessWebsite": request.url},
                "businessInformation": {
                    "businessName": "",
                    "businessOverview": business_overview,
                    "primaryBusinessAddress": "",
                    "primaryBusinessPhone": "",
                    "coreServices": [],
                    "businessHours": {}
                },
                "messageTaking": {
                    "callerName": {"required": True, "alwaysRequested": True},
                    "callerPhoneNumber": {"required": True, "automaticallyCaptured": True},
                    "specificQuestions": []
                },
                "callNotifications": {
                    "emailNotifications": {"enabled": False, "email": None},
                    "smsNotifications": {"enabled": False, "phoneNumber": None}
                }
            }
            logging.info(f"Created minimal setup data for user {user_id}")
        
        # Always update the business overview with the newly generated one
        if "businessInformation" in setup_data:
            setup_data["businessInformation"]["businessOverview"] = business_overview
            logging.info("Updated business overview in setup data")
        
        # Convert to QuickSetupData for saving
        quick_setup_data = QuickSetupData(**setup_data)
        # Save the updated or new data
        try:
            await save_guided_setup(user_id, quick_setup_data)
            logging.info(f"{'Updated' if existing_setup else 'Created new'} guided setup data for user {user_id}")
        except Exception as save_error:
            logging.error(f"Error saving guided setup data: {str(save_error)}")
            return RetrainAgentResponse(
                success=False,
                business_overview=None,
                setup_data=None,
                error=f"Error saving guided setup data: {str(save_error)}"
            )
        
        # Get the freshly updated setup data
        updated_setup = await get_guided_setup(user_id)
        if not updated_setup:
            logging.error("Failed to retrieve updated setup data after save")
            return RetrainAgentResponse(
                success=False,
                business_overview=business_overview,
                setup_data=None,
                error="Failed to retrieve updated setup data after save"
            )
        
        # Convert back to frontend format for the response
        formatted_data = {
            "trainingSources": updated_setup.get("training_sources", {}),
            "businessInformation": updated_setup.get("business_information", {}),
            "messageTaking": updated_setup.get("message_taking", {}),
            "callNotifications": updated_setup.get("call_notifications", {})
        }
        
        # Create or update the agent using the centralized function
        try:
            success, message, agent_result = await create_or_update_agent_from_setup(user_id, formatted_data)
            
            if success:
                logging.info(f"Successfully completed agent creation/update: {message}")
                
                # If we have an agent_id now, ensure it's stored in guided_setup
                if agent_result and "id" in agent_result:
                    agent_id = agent_result["id"]
                    logging.info(f"Ensuring agent_id {agent_id} is stored in guided_setup")
                    await update_guided_setup_agent_id(user_id, agent_id)
            else:
                logging.warning(f"Agent creation/update during retraining failed: {message}")
                return RetrainAgentResponse(
                    success=False,
                    business_overview=business_overview,
                    setup_data=formatted_data,
                    error=f"Agent creation/update failed: {message}"
                )
        except Exception as agent_error:
            error_msg = f"Error in agent creation/update: {str(agent_error)}"
            logging.error(error_msg)
            return RetrainAgentResponse(
                success=False,
                business_overview=business_overview,
                setup_data=formatted_data,
                error=error_msg
            )
        
        return RetrainAgentResponse(
            success=True,
            business_overview=business_overview,
            setup_data=formatted_data,
            error=None
        )
    except Exception as e:
        error_msg = f"Error retraining agent: {str(e)}"
        logging.error(error_msg)
        return RetrainAgentResponse(
            success=False,
            business_overview=None,
            setup_data=None,
            error=error_msg
        )


async def generate_greeting_preview(
    user_id: str,
    business_name: str,
    business_description: str,
    business_website: Optional[str] = None,
    language: str = "en"
) -> Dict[str, Any]:
    """
    Generate a greeting audio preview for the onboarding process.
    Uses minimal business information to create a sample greeting.
    
    Args:
        user_id: The ID of the user
        business_name: Name of the business
        business_description: Brief description of the business
        business_website: Optional website URL
        language: Language code for the greeting (ISO 639-1, e.g., "en", "es", "fr")
        
    Returns:
        Dictionary with success status and audio binary data or error
    """
    try:
        logging.info(f"Generating greeting preview for user {user_id} with business: {business_name}, language: {language}")
        
        # Use a default voice for the preview
        default_voice_id = 'Ize3YDdGqJYYKQSDLORJ'
        
        # Create a sample greeting message based on business info and language
        greeting_text = ""
        
        # Generate greeting text based on language
        if language == "en":  # English
            greeting_text = f"Thank you for calling {business_name}. This is Rosie, your AI receptionist. "
            if business_description:
                greeting_text += f"At {business_name}, {business_description}. "
            greeting_text += "How may I assist you today?"
        elif language == "es":  # Spanish
            greeting_text = f"Gracias por llamar a {business_name}. Soy Rosie, su recepcionista AI. "
            if business_description:
                greeting_text += f"En {business_name}, {business_description}. "
            greeting_text += "¿Cómo puedo ayudarle hoy?"
        elif language == "fr":  # French
            greeting_text = f"Merci d'avoir appelé {business_name}. Je suis Rosie, votre réceptionniste IA. "
            if business_description:
                greeting_text += f"Chez {business_name}, {business_description}. "
            greeting_text += "Comment puis-je vous aider aujourd'hui?"
        elif language == "de":  # German
            greeting_text = f"Vielen Dank für Ihren Anruf bei {business_name}. Hier ist Rosie, Ihre KI-Rezeptionistin. "
            if business_description:
                greeting_text += f"Bei {business_name}, {business_description}. "
            greeting_text += "Wie kann ich Ihnen heute helfen?"
        elif language == "pt":  # Portuguese
            greeting_text = f"Obrigado por ligar para {business_name}. Sou Rosie, sua recepcionista de IA. "
            if business_description:
                greeting_text += f"Na {business_name}, {business_description}. "
            greeting_text += "Como posso ajudá-lo hoje?"
        else:  # Default to English for other languages
            greeting_text = f"Thank you for calling {business_name}. This is Rosie, your AI receptionist. "
            if business_description:
                greeting_text += f"At {business_name}, {business_description}. "
            greeting_text += "How may I assist you today?"
        
        # Generate audio using ElevenLabs client
        try:
            # Generate the audio using our client and get binary data
            audio_data = elevenlabs_client.generate_audio(
                text=greeting_text,
                voice_id=default_voice_id,
                return_bytes=True
            )
            logging.info(f"Successfully generated audio for greeting preview")
        except Exception as audio_error:
            logging.error(f"Error generating audio: {str(audio_error)}")
            return {
                "success": False,
                "error": f"Failed to generate audio: {str(audio_error)}"
            }
        
        logging.info(f"Generated greeting preview for {business_name} in {language}")
        
        # Return both the audio data and the text
        return {
            "success": True,
            "audio_data": audio_data,  # Return the binary audio data
            "text": greeting_text
        }
    except Exception as e:
        logging.error(f"Error generating greeting preview: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to generate greeting audio: {str(e)}"
        }

async def generate_message_preview(
    user_id: str,
    business_name: str,
    language: str = "en"
) -> Dict[str, Any]:
    """
    Generate a message-taking audio preview for the onboarding process.
    
    Args:
        user_id: The ID of the user
        business_name: Name of the business
        language: Language code for the message (ISO 639-1, e.g., "en", "es", "fr")
        
    Returns:
        Dictionary with success status and audio binary data or error
    """
    try:
        logging.info(f"Generating message preview for user {user_id} with business: {business_name}, language: {language}")
        
        # Use a default voice for the preview
        default_voice_id = 'Ize3YDdGqJYYKQSDLORJ'
        
        # Create a sample message-taking text based on language
        message_text = ""
        
        # Generate message text based on language
        if language == "en":  # English
            message_text = (
                f"I'd be happy to take a message for {business_name}. "
                "Could I please get your name and phone number? "
                "Also, please let me know what your message is about, "
                "and I'll make sure it gets to the right person."
            )
        elif language == "es":  # Spanish
            message_text = (
                f"Me gustaría tomar un mensaje para {business_name}. "
                "¿Podría darme su nombre y número de teléfono? "
                "También, por favor, dígame de qué se trata su mensaje, "
                "y me aseguraré de que llegue a la persona adecuada."
            )
        elif language == "fr":  # French
            message_text = (
                f"Je serais heureux de prendre un message pour {business_name}. "
                "Puis-je avoir votre nom et votre numéro de téléphone? "
                "Veuillez également me dire de quoi parle votre message, "
                "et je m'assurerai qu'il parvienne à la bonne personne."
            )
        elif language == "de":  # German
            message_text = (
                f"Ich nehme gerne eine Nachricht für {business_name} entgegen. "
                "Darf ich bitte Ihren Namen und Ihre Telefonnummer haben? "
                "Teilen Sie mir bitte auch mit, worum es in Ihrer Nachricht geht, "
                "und ich werde sicherstellen, dass sie an die richtige Person weitergeleitet wird."
            )
        elif language == "pt":  # Portuguese
            message_text = (
                f"Terei prazer em anotar uma mensagem para {business_name}. "
                "Poderia me dar seu nome e número de telefone? "
                "Além disso, diga-me do que se trata sua mensagem, "
                "e eu me certificarei de que chegue à pessoa certa."
            )
        else:  # Default to English for other languages
            message_text = (
                f"I'd be happy to take a message for {business_name}. "
                "Could I please get your name and phone number? "
                "Also, please let me know what your message is about, "
                "and I'll make sure it gets to the right person."
            )
        
        # Generate audio using ElevenLabs client
        try:
            # Generate the audio using our client and get binary data
            audio_data = elevenlabs_client.generate_audio(
                text=message_text,
                voice_id=default_voice_id,
                return_bytes=True
            )
            logging.info(f"Successfully generated audio for message preview")
        except Exception as audio_error:
            logging.error(f"Error generating audio: {str(audio_error)}")
            return {
                "success": False,
                "error": f"Failed to generate audio: {str(audio_error)}"
            }
        
        logging.info(f"Generated message preview for {business_name} in {language}")
        
        # Return both the audio data and the text
        return {
            "success": True,
            "audio_data": audio_data,  # Return the binary audio data
            "text": message_text
        }
    except Exception as e:
        logging.error(f"Error generating message preview: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to generate message audio: {str(e)}"
        }
