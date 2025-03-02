from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Tuple
import logging

from humanloop import Humanloop

from services import prompts
from services.supabase.client import get_supabase
from services.voice.agents import create_agent, get_agents, update_agent

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
    
    # If record exists, preserve the setup_completed value
    # If it's a new record, set setup_completed to False by default
    if existing_setup:
        # Preserve the existing setup_completed status 
        setup_data["setup_completed"] = existing_setup.get("setup_completed", False)
        logging.info(f"Updating existing guided setup data for user {user_id}")
    else:
        # New record, not completed yet
        setup_data["setup_completed"] = False
        logging.info(f"Creating new guided setup data for user {user_id}")
    
    # Update or insert the record
    supabase = await get_supabase()
    if existing_setup:
        # Update existing record
        result = await supabase.table("guided_setup").update(setup_data).eq("user_id", user_id).execute()
    else:
        # Insert new record
        result = await supabase.table("guided_setup").insert(setup_data).execute()
    
    logging.info(f"Saved guided setup data for user {user_id}")
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
        user_agents = await get_agents(user_id)
        
        # Get the user's guided setup data to retrieve the phone number
        guided_setup_data = await get_guided_setup(user_id)
        phone_number = guided_setup_data.get("phone_number", "") if guided_setup_data else ""
        logging.info(f"Retrieved phone number for agent assignment: {phone_number}")
        
        # Extract business information for agent creation/update
        business_info = setup_data.get("businessInformation", {})
        business_name = business_info.get("businessName", "My Business")
        business_overview = business_info.get("businessOverview", "")

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
            "dataSource": "all",  # Mark this agent as created from guided setup
            "openingLine": f"Hello! Thank you for calling {business_name}. Our call may be recorded for quality control purposes, my name is Fiona. How can I help you today?",
            "language": "EN-US",  # Default to English
            "voice": "Fiona",
            "features" : features,
            "assigned_telephone" : phone_number,  # Use the phone number from guided setup
            "voiceProvider" : "Ize3YDdGqJYYKQSDLORJ", ## Jessica
            "notify": True,  # Enable notifications
        }
        
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
                agent_data["formFields"] = form_fields
        
        # Check if there's an existing agent with dataSource=guided_setup
        existing_agent = None
        if user_agents and user_agents.data:
            for agent in user_agents.data:
                if agent.get("dataSource") == "guided_setup":
                    existing_agent = agent
                    logging.info(f"Found existing guided setup agent with ID: {agent.get('id')}")
                    break
        
        # Update or create the agent
        if existing_agent:
            agent_id = existing_agent.get("id")
            logging.info(f"Updating existing agent with ID: {agent_id}")
            result = await update_agent(agent_id, agent_data)
            logging.info(f"Successfully updated agent for user {user_id}")
            return True, f"Updated existing agent with ID: {agent_id}", result
        else:
            logging.info(f"Creating new agent for user {user_id}")
            result = await create_agent(agent_data)
            logging.info(f"Successfully created new agent for user {user_id}")
            return True, "Created new agent", result
    
    except Exception as e:
        error_msg = f"Error creating/updating agent: {str(e)}"
        logging.error(error_msg)
        return False, error_msg, None

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

async def crawl_scrape_website(url: str) -> str:
    """
    Crawl a website and extract relevant content for business overview.
    
    Note: This is a placeholder implementation.
    In production, this would be implemented with actual web crawling capabilities.
    """
    logging.info(f"Crawling website: {url}")
    # TODO: Implement actual web crawling logic
    # This would be replaced with actual web scraping using a library like Playwright, Selenium, or BeautifulSoup
    return f"This is a business overview generated from {url}. In production, this would be created by crawling the website, extracting content, and using an LLM to generate a comprehensive business summary."

async def generate_business_overview(content: str) -> str:
    """
    Generate a business overview from website content using LLM.
    
    Note: This is a placeholder implementation.
    In production, this would use LangChain or a similar framework to invoke an LLM.
    """
    logging.info("Generating business overview from crawled content")
    # TODO: Implement actual LLM invocation
    # This would be replaced with an actual call to an LLM service
    return content

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
        website_content = await crawl_scrape_website(request.url)
        # 2. Generate business overview from content using LLM
        business_overview = await generate_business_overview(website_content)
        
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
        
        # Always update the business overview with the newly generated one
        if "businessInformation" in setup_data:
            setup_data["businessInformation"]["businessOverview"] = business_overview
        
        # Convert to QuickSetupData for saving
        quick_setup_data = QuickSetupData(**setup_data)
        # Save the updated or new data
        await save_guided_setup(user_id, quick_setup_data)
        
        logging.info(f"{'Updated' if existing_setup else 'Created new'} guided setup data for user {user_id}")
        
        # Get the freshly updated setup data
        updated_setup = await get_guided_setup(user_id)
        
        # Convert back to frontend format for the response
        formatted_data = {
            "trainingSources": updated_setup.get("training_sources", {}),
            "businessInformation": updated_setup.get("business_information", {}),
            "messageTaking": updated_setup.get("message_taking", {}),
            "callNotifications": updated_setup.get("call_notifications", {})
        }
        
        # Create or update the agent using the centralized function
        success, message, _ = await create_or_update_agent_from_setup(user_id, formatted_data)
        if not success:
            logging.warning(f"Agent creation/update during retraining: {message}")
        
        return RetrainAgentResponse(
            success=True,
            business_overview=business_overview,
            setup_data=formatted_data,
            error=None
        )
    except Exception as e:
        logging.error(f"Error retraining agent: {str(e)}")
        return RetrainAgentResponse(
            success=False,
            business_overview=None,
            setup_data=None,
            error=str(e)
        )
