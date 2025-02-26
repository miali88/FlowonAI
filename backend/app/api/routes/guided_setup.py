from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Union
import logging
from services.supabase.client import get_supabase

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

async def save_guided_setup(user_id: str, quick_setup_data: QuickSetupData, phone_number: str = "(814) 261-0317"):
    """Save the guided setup data to Supabase."""
    supabase = await get_supabase()
    
    # Convert Pydantic models to dictionaries for JSONB columns
    setup_data = {
        "user_id": user_id,
        "training_sources": quick_setup_data.trainingSources.dict(),
        "business_information": quick_setup_data.businessInformation.dict(),
        "message_taking": quick_setup_data.messageTaking.dict(),
        "call_notifications": quick_setup_data.callNotifications.dict(),
        "phone_number": phone_number,
        "setup_completed": True
    }
    
    # Insert data into the guided_setup table
    result = await supabase.table("guided_setup").insert(setup_data).execute()
    
    logging.info(f"Saved guided setup data for user {user_id}")
    return result

async def get_guided_setup(user_id: str):
    """Retrieve the guided setup data for a user from Supabase."""
    supabase = await get_supabase()
    
    # Query the guided_setup table for the user's data
    result = await supabase.table("guided_setup").select("*").eq("user_id", user_id).execute()
    
    if result.data and len(result.data) > 0:
        logging.info(f"Retrieved guided setup data for user {user_id}")
        return result.data[0]
    
    logging.warning(f"No guided setup data found for user {user_id}")
    return None

async def has_completed_setup(user_id: str) -> bool:
    """Check if a user has completed the guided setup."""
    setup = await get_guided_setup(user_id)
    return setup is not None and setup.get("setup_completed", False)

@router.post("/quick-setup")
async def submit_quick_setup(data: QuickSetupData):
    """
    Endpoint to receive quick setup data and return a mock phone number
    for the Talk to Rosie step.
    """
    try:
        # In a production environment, get the user_id from authentication context
        # For now, using a placeholder user_id
        user_id = "placeholder_user_id"  # Replace with actual user authentication
        
        # Mock phone number - in production this would be dynamically assigned
        phone_number = "(814) 261-0317"
        
        # Save the setup data to Supabase
        await save_guided_setup(user_id, data, phone_number)
        
        logging.info(f"Quick setup completed for user {user_id}")
        return {
            "success": True,
            "phoneNumber": phone_number,
            "message": "Quick setup data received successfully"
        }
    except Exception as e:
        logging.error(f"Error in quick-setup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/quick-setup")
async def options_quick_setup():
    """
    Handle OPTIONS requests for CORS preflight.
    """
    return {}

@router.get("/phone-number")
async def get_rosie_phone_number():
    """
    Endpoint to get the Rosie phone number for the Talk to Rosie step.
    """
    try:
        # In a production environment, get the user_id from authentication context
        user_id = "placeholder_user_id"  # Replace with actual user authentication
        
        # Try to retrieve existing setup
        setup = await get_guided_setup(user_id)
        
        if setup and "phone_number" in setup:
            logging.info(f"Retrieved phone number for user {user_id}: {setup['phone_number']}")
            return {
                "success": True,
                "phoneNumber": setup["phone_number"]
            }
        
        # If no setup exists or no phone number, return mock number
        default_number = "(814) 261-0317"
        logging.info(f"No phone number found for user {user_id}, returning default: {default_number}")
        return {
            "success": True,
            "phoneNumber": default_number
        }
    except Exception as e:
        logging.error(f"Error getting phone number: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/phone-number")
async def options_phone_number():
    """
    Handle OPTIONS requests for CORS preflight.
    """
    return {}

@router.get("/setup-status")
async def get_setup_status():
    """
    Endpoint to check if the current user has completed the guided setup.
    """
    try:
        # In a production environment, get the user_id from authentication context
        user_id = "placeholder_user_id"  # Replace with actual user authentication
        
        completed = await has_completed_setup(user_id)
        
        return {
            "success": True,
            "setupCompleted": completed
        }
    except Exception as e:
        logging.error(f"Error checking setup status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/setup-status")
async def options_setup_status():
    """
    Handle OPTIONS requests for CORS preflight.
    """
    return {}

@router.get("/setup-data")
async def get_setup_data():
    """
    Endpoint to retrieve the complete guided setup data for the current user.
    """
    try:
        # In a production environment, get the user_id from authentication context
        user_id = "placeholder_user_id"  # Replace with actual user authentication
        
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
    except Exception as e:
        logging.error(f"Error retrieving setup data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/setup-data")
async def options_setup_data():
    """
    Handle OPTIONS requests for CORS preflight.
    """
    return {}
