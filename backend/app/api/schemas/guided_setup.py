from pydantic import BaseModel, Field
from typing import Optional
from backend.app.models.guided_setup import QuickSetupData

class OnboardingPreviewRequest(BaseModel):
    """Request model for generating onboarding preview audio with minimal business information."""
    businessName: str
    businessDescription: str
    businessWebsite: Optional[str] = None
    businessAddress: Optional[str] = None
    businessPhone: Optional[str] = None
    agentLanguage: Optional[str] = "en-US"  # Default language is English (US)

class OnboardingSaveRequest(BaseModel):
    """Request model for saving onboarding data."""
    businessWebsite: Optional[str] = None
    businessName: str
    businessDescription: str
    businessAddress: Optional[str] = None
    businessPhone: Optional[str] = None
    agentLanguage: Optional[str] = "en-US"

class AudioPreviewResponse(BaseModel):
    """Response model for audio preview generation."""
    success: bool
    greeting_audio_data_base64: Optional[str] = None  # Base64 encoded audio data for greeting
    message_audio_data_base64: Optional[str] = None   # Base64 encoded audio data for message
    greeting_text: Optional[str] = None               # Text for greeting audio
    message_text: Optional[str] = None                # Text for message audio
    error: Optional[str] = None

class RetrainAgentResponse(BaseModel):
    success: bool
    business_overview: Optional[str] = None
    error: Optional[str] = None
    setup_data: Optional[dict] = None
    
class TrialPlanRequest(BaseModel):
    """Request model for setting up a trial plan."""
    trial_plan_type: str = Field(..., description="The type of trial plan to set up (e.g., 'pro', 'scale')")

class RetrainAgentRequest(BaseModel):
    url: str = Field(..., description="URL of the website to scrape for agent retraining")
    setup_data: Optional[QuickSetupData] = Field(None, description="Optional setup data for agent retraining")

class RetrainAgentResponse(BaseModel):
    success: bool
    business_overview: Optional[str] = None
    error: Optional[str] = None
    setup_data: Optional[dict] = None 
