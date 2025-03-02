from typing import Dict, List, Optional, Any, Union
from uuid import UUID
from pydantic import BaseModel, Field
from datetime import datetime


class ChatUI(BaseModel):
    """Chat UI configuration for agents"""
    primaryColor: Optional[str] = None
    secondaryColor: Optional[str] = None
    logo: Optional[str] = None


class AgentFeatures(BaseModel):
    """Features configuration for agents"""
    collectInformation: Optional[bool] = False
    uploadFile: Optional[bool] = False
    voiceMode: Optional[bool] = False
    emailSummary: Optional[bool] = False


class AgentBase(BaseModel):
    """Base model for agent data"""
    agentName: str
    agentPurpose: str
    instructions: Optional[str] = None
    dataSource: Optional[str] = None
    openingLine: Optional[str] = None
    voice: Optional[str] = None
    language: Optional[str] = "en-US"
    features: Optional[AgentFeatures] = None
    assigned_telephone: Optional[str] = None
    form_fields: Optional[List[str]] = None
    voiceProvider: Optional[str] = None
    notify: Optional[bool] = False
    multi_state: Optional[Dict[str, Any]] = None
    workflows: Optional[str] = None
    company_name: Optional[str] = None
    showSourcesInChat: Optional[bool] = False
    chat_ui: Optional[ChatUI] = None
    agent_logo: Optional[str] = None


class AgentCreate(AgentBase):
    """Schema for creating a new agent"""
    # Additional fields specific to creation can be added here
    formFields: Optional[List[str]] = None  # This will be transformed to form_fields
    agentType: Optional[str] = None  # This will be transformed to agentPurpose
    tag: Optional[str] = None  # This can be transformed to dataSource


class AgentUpdate(BaseModel):
    """Schema for updating an existing agent"""
    agentName: Optional[str] = None
    agentPurpose: Optional[str] = None
    instructions: Optional[str] = None
    dataSource: Optional[str] = None
    openingLine: Optional[str] = None
    voice: Optional[str] = None
    language: Optional[str] = None
    features: Optional[AgentFeatures] = None
    form_fields: Optional[List[str]] = None
    voiceProvider: Optional[str] = None
    notify: Optional[bool] = None
    multi_state: Optional[Dict[str, Any]] = None
    workflows: Optional[str] = None
    company_name: Optional[str] = None
    showSourcesInChat: Optional[bool] = None
    chat_ui: Optional[ChatUI] = None
    agent_logo: Optional[str] = None
    
    # UI-specific fields that will be mapped to chat_ui
    primaryColor: Optional[str] = None
    secondaryColor: Optional[str] = None
    logo: Optional[str] = None


class AgentInDB(AgentBase):
    """Schema for agent as stored in database with ID"""
    id: UUID
    userId: str
    datetime_creation: Optional[datetime] = None


class AgentResponse(BaseModel):
    """Schema for agent response data"""
    data: List[AgentInDB]


class AgentContentResponse(BaseModel):
    """Schema for agent content response"""
    data: List[AgentInDB]


class AgentCompletionRequest(BaseModel):
    """Schema for requesting agent completion"""
    prompt: str
    purpose: str


class AgentCompletionResponse(BaseModel):
    """Schema for agent completion response"""
    status: str
    completion: str


class AgentAutoCreateRequest(BaseModel):
    """Schema for auto-creating an agent from URL"""
    url: str


class AgentAutoCreateResponse(BaseModel):
    """Schema for response after starting agent auto-creation"""
    status: str
    message: str
    agent_id: str


class AgentStatusResponse(BaseModel):
    """Schema for checking agent creation status"""
    status: str
    agent_url: str


class AgentDeleteResponse(BaseModel):
    """Schema for response after deleting an agent"""
    message: str 