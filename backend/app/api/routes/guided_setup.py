from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Union
import logging

from services.supabase.client import get_supabase
from app.core.auth import get_current_user_mock as get_current_user
from services.knowledge_base.web_scrape import scrape_url, scrape_url_simple  # Import the scrape function
from services.llm import generate_business_overview  # Import the new LLM function

router = APIRouter()

# Models matching the frontend types
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
    
    # If record exists, preserve the is_setup_complete value if it exists
    # If it's a new record, don't set is_setup_complete field
    if existing_setup:
        # Only include is_setup_complete if it exists in the existing setup
        if "is_setup_complete" in existing_setup:
            setup_data["is_setup_complete"] = existing_setup.get("is_setup_complete", False)
        logging.info(f"Updating existing guided setup data for user {user_id}")
    else:
        # New record, don't set is_setup_complete field
        logging.info(f"Creating new guided setup data for user {user_id}")
    
    # Update or insert the record
    supabase = await get_supabase()
    try:
        if existing_setup:
            # Update existing record
            result = await supabase.table("guided_setup").update(setup_data).eq("user_id", user_id).execute()
        else:
            # Insert new record
            result = await supabase.table("guided_setup").insert(setup_data).execute()
        
        logging.info(f"Saved guided setup data for user {user_id}")
        return setup_data
    except Exception as e:
        logging.error(f"Error saving guided setup data: {str(e)}")
        # Return the data anyway so the rest of the function can continue
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
    return setup is not None and setup.get("is_setup_complete", False)

@router.post("/quick_setup")
async def submit_quick_setup(data: QuickSetupData, current_user: str = Depends(get_current_user)):
    """
    Endpoint to receive quick setup data and return a mock phone number
    for the Talk to Rosie step.
    """
    try:
        
        # Mock phone number - in production this would be dynamically assigned
        phone_number = "(814) 261-0317"
        
        # Save the setup data to Supabase
        await save_guided_setup(current_user, data, phone_number)
        
        logging.info(f"Quick setup completed for user {current_user}")
        return {
            "success": True,
            "phoneNumber": phone_number,
            "message": "Quick setup data received successfully"
        }
    except Exception as e:
        logging.error(f"Error in quick-setup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/quick_setup")
async def options_quick_setup():
    """
    Handle OPTIONS requests for CORS preflight.
    """
    return {}

@router.get("/phone_number")
async def get_rosie_phone_number(current_user: str = Depends(get_current_user)):
    """
    Endpoint to get the Rosie phone number for the Talk to Rosie step.
    """
    try:
        
        # Try to retrieve existing setup
        setup = await get_guided_setup(current_user)
        
        if setup and "phone_number" in setup:
            logging.info(f"Retrieved phone number for user {current_user}: {setup['phone_number']}")
            return {
                "success": True,
                "phoneNumber": setup["phone_number"]
            }
        
        # If no setup exists or no phone number, return mock number
        default_number = "(814) 261-0317"
        logging.info(f"No phone number found for user {current_user}, returning default: {default_number}")
        return {
            "success": True,
            "phoneNumber": default_number
        }
    except Exception as e:
        logging.error(f"Error getting phone number: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/phone_number")
async def options_phone_number():
    """
    Handle OPTIONS requests for CORS preflight.
    """
    return {}

@router.get("/setup_status", response_model=dict)
async def get_setup_status(user_id: str = Depends(get_current_user)):
    """
    Check if the user has completed the guided setup
    """
    try:
        logging.info(f"Checking setup status for user: {user_id}")
        
        # Get user's guided setup data
        setup_data = await get_guided_setup(user_id)
        
        # Check if setup is complete
        is_complete = setup_data.get("is_setup_complete", False) if setup_data else False
        
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

@router.post("/mark_complete", response_model=dict)
async def mark_setup_complete(user_id: str = Depends(get_current_user)):
    """
    Mark the guided setup as complete
    """
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
        updated_data = {**setup_data, "is_setup_complete": True}
        
        # Update in the database
        supabase = await get_supabase()
        response = await supabase.table("guided_setup").update(
            updated_data
        ).eq("user_id", user_id).execute()
        
        if response.error:
            logging.error(f"Error updating guided setup: {response.error}")
            raise Exception(response.error.message)
            
        logging.info(f"Successfully marked setup as complete for user: {user_id}")
        
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

@router.get("/setup_data")
async def get_setup_data(current_user: str = Depends(get_current_user)):
    """
    Endpoint to retrieve the complete guided setup data for the current user.
    """
    try:
        
        setup = await get_guided_setup(current_user)
        
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
    except Exception as e:
        logging.error(f"Error retrieving setup data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/setup_data")
async def options_setup_data():
    """
    Handle OPTIONS requests for CORS preflight.
    """
    return {}

@router.post("/retrain_agent", response_model=RetrainAgentResponse)
async def retrain_agent(request: RetrainAgentRequest, current_user: str = Depends(get_current_user)):
    """
    Retrain the agent for the current user by crawling and scraping a website URL.
    Updates the business information and returns the updated agent data.
    
    Args:
        request: Contains the URL to scrape and optional setup data
        current_user: The authenticated user token
        
    Returns:
        A response with the updated agent data or an error message
    """
    try:
        logging.info(f"Retraining agent for user {current_user} with URL: {request.url}")
        
        # Get existing setup data for the user
        existing_setup = await get_guided_setup(current_user)
        if not existing_setup:
            logging.warning(f"No existing setup data found for user {current_user}")
        
        # Use the simplified scraping function that doesn't save to database
        scraped_content = await scrape_url_simple(request.url)
        
        # Generate business overview using LLM
        business_overview = await generate_business_overview(scraped_content)
        
        logging.info(f"Generated business overview for user {current_user}: {business_overview}")
        
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
        
        # If we have existing data, update it
        if existing_setup:
            # Convert to QuickSetupData for saving
            quick_setup_data = QuickSetupData(**setup_data)
            # Save the updated data
            updated_data = await save_guided_setup(current_user, quick_setup_data)
            logging.info(f"Updated guided setup data for user {current_user}")
        else:
            # Create new setup data
            quick_setup_data = QuickSetupData(**setup_data)
            # Save the setup data
            updated_data = await save_guided_setup(current_user, quick_setup_data)
            logging.info(f"Created new guided setup data for user {current_user}")
        
        return {
            "success": True,
            "business_overview": business_overview,
            "setup_data": setup_data,
            "error": None
        }
    except Exception as e:
        logging.error(f"Error retraining agent: {str(e)}")
        return {
            "success": False,
            "business_overview": None,
            "setup_data": None,
            "error": str(e)
        }

@router.options("/retrain_agent")
async def options_retrain_agent():
    """
    Handle OPTIONS requests for CORS preflight.
    """
    return {}
