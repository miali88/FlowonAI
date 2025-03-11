from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from uuid import UUID


class NotificationSettings(BaseModel):
    """User notification settings"""
    email_notifications: Optional[bool] = True
    push_notifications: Optional[bool] = True
    sms_notifications: Optional[bool] = False


class AccountSettings(BaseModel):
    """User account settings"""
    timezone: Optional[str] = "UTC"
    language: Optional[str] = "en-US"
    theme: Optional[str] = "light"


class TelephonyNumbers(BaseModel):
    """User's telephony numbers configuration"""
    active_numbers: Optional[List[str]] = []
    pending_numbers: Optional[List[str]] = []


class UserBase(BaseModel):
    """Base model for user data"""
    username: str
    email: str
    is_active: Optional[bool] = True
    role: Optional[str] = "user"
    notification_settings: Optional[Dict[str, Any]] = Field(default_factory=dict)
    account_settings: Optional[Dict[str, Any]] = Field(default_factory=dict)
    user_plan: Optional[str] = None
    telephony_numbers: Optional[Dict[str, Any]] = Field(default_factory=dict)
    stripe_customer_id: Optional[str] = None
    onboarding_completed: Optional[bool] = False
    
    # Trial related fields
    is_trial: Optional[bool] = False
    trial_start_date: Optional[datetime] = None
    trial_end_date: Optional[datetime] = None
    trial_plan_type: Optional[str] = None
    trial_minutes_used: Optional[int] = 0
    trial_minutes_total: Optional[int] = 25

    # Flag for test users from webhooks
    is_test_user: Optional[bool] = None


class UserCreate(UserBase):
    """Schema for creating a new user"""
    password: Optional[str] = None
    phone_number: Optional[str] = None


class UserUpdate(BaseModel):
    """Schema for updating user data"""
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None
    notification_settings: Optional[Dict[str, Any]] = None
    account_settings: Optional[Dict[str, Any]] = None
    user_plan: Optional[str] = None
    telephony_numbers: Optional[Dict[str, Any]] = None
    stripe_customer_id: Optional[str] = None
    onboarding_completed: Optional[bool] = None
    
    # Trial related fields
    is_trial: Optional[bool] = None
    trial_start_date: Optional[datetime] = None
    trial_end_date: Optional[datetime] = None
    trial_plan_type: Optional[str] = None
    trial_minutes_used: Optional[int] = None
    trial_minutes_total: Optional[int] = None


class UserInDB(BaseModel):
    """Schema for user as stored in database, matching the actual DB table structure"""
    id: str  # Clerk user ID
    username: str
    email: str
    password_hash: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    is_active: bool = True
    role: str = "user"
    notification_settings: Dict[str, Any] = Field(default_factory=dict)
    account_settings: Dict[str, Any] = Field(default_factory=dict)
    user_plan: Optional[str] = None
    telephony_numbers: Dict[str, Any] = Field(default_factory=dict)
    stripe_customer_id: Optional[str] = None
    onboarding_completed: Optional[bool] = False
    trial_start_date: Optional[datetime] = None
    trial_end_date: Optional[datetime] = None
    is_trial: bool = False
    trial_plan_type: Optional[str] = None
    trial_minutes_used: int = 0
    trial_minutes_total: int = 25
    is_test_user: Optional[bool] = None


class UserResponse(BaseModel):
    """Schema for user response data"""
    id: str
    username: str
    email: str
    is_active: bool
    role: str
    notification_settings: Dict[str, Any]
    account_settings: Dict[str, Any]
    user_plan: Optional[str]
    onboarding_completed: Optional[bool] = False
    created_at: datetime
    updated_at: Optional[datetime]
    last_login: Optional[datetime]
    is_trial: bool
    trial_start_date: Optional[datetime]
    trial_end_date: Optional[datetime]
    trial_plan_type: Optional[str]
    trial_minutes_used: int
    trial_minutes_total: int


class UserListResponse(BaseModel):
    """Schema for list of users response"""
    data: List[UserResponse]


class UserMetadataRequest(BaseModel):
    """Schema for requesting user metadata"""
    clerk_user_id: str


class UserMetadataResponse(BaseModel):
    """Schema for user metadata response"""
    customer_id: Optional[str] = None
