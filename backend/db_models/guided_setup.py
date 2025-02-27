from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class TradeInSource(BaseModel):
    id: str
    name: str
    enabled: bool
    description: str


class BusinessInformation(BaseModel):
    business_name: str
    industry: str
    website: str
    description: str


class MessageTrackingChannels(BaseModel):
    email: bool = False
    sms: bool = False
    whatsapp: bool = False


class MessageTracking(BaseModel):
    enabled: bool = False
    channels: MessageTrackingChannels


class CallNotification(BaseModel):
    enabled: bool = False
    notify_email: str = ""
    notify_sms: str = ""


class CompletedSteps(BaseModel):
    trade_in_sources: bool = False
    business_information: bool = False
    message_tracking: bool = False
    call_notifications: bool = False


class GuidedSetupData(BaseModel):
    user_id: str
    trade_in_sources: List[TradeInSource] = []
    business_information: Optional[BusinessInformation] = None
    message_tracking: MessageTracking = Field(default_factory=MessageTracking)
    call_notifications: CallNotification = Field(default_factory=CallNotification)
    completed_steps: CompletedSteps = Field(default_factory=CompletedSteps)
    current_step: Literal["trade_in_sources", "business_information", "message_tracking", "call_notifications", "completed"] = "trade_in_sources"


class GuidedSetupUpdate(BaseModel):
    trade_in_sources: Optional[List[TradeInSource]] = None
    business_information: Optional[BusinessInformation] = None
    message_tracking: Optional[MessageTracking] = None
    call_notifications: Optional[CallNotification] = None
    completed_steps: Optional[CompletedSteps] = None
    current_step: Optional[Literal["trade_in_sources", "business_information", "message_tracking", "call_notifications", "completed"]] = None