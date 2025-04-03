from pydantic import BaseModel, Field, HttpUrl
from typing import Dict, List, Optional, Any

# Pydantic models for guided setup
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

class BookingLink(BaseModel):
    url: Optional[HttpUrl] = None

    def model_dump(self, **kwargs):
        data = super().model_dump(**kwargs)
        if data.get('url'):
            data['url'] = str(data['url'])  # Convert HttpUrl to string for JSON serialization
        return data

class QuickSetupData(BaseModel):
    trainingSources: TrainingSource
    businessInformation: BusinessInformation
    messageTaking: MessageTaking
    callNotifications: CallNotifications
    bookingLink: Optional[BookingLink] = None
    agentLanguage: str = "en-US"

    @classmethod
    def from_db(cls, data: dict):
        """Convert database data to QuickSetupData model"""
        if data.get('booking_link', {}).get('url'):
            # Ensure URL is properly formatted
            data['booking_link']['url'] = str(data['booking_link']['url'])
        return cls(**data)