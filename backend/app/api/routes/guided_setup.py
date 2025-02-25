from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Optional

router = APIRouter(tags=["guided_setup"])

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

@router.post("/quick-setup")
async def submit_quick_setup(data: QuickSetupData):
    """
    Endpoint to receive quick setup data and return a mock phone number
    for the Talk to Rosie step.
    """
    try:
        # In a real implementation, this would save the data to a database
        # and generate or retrieve a real phone number
        
        # For now, just return a mock phone number
        return {
            "success": True,
            "phoneNumber": "(814) 261-0317",
            "message": "Quick setup data received successfully"
        }
    except Exception as e:
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
        # In a real implementation, this would retrieve the phone number from a database
        # based on the user's account or business
        
        # For now, just return a mock phone number
        return {
            "success": True,
            "phoneNumber": "(814) 261-0317"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/phone-number")
async def options_phone_number():
    """
    Handle OPTIONS requests for CORS preflight.
    """
    return {}
