from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class MessageQuestion(BaseModel):
    question: str
    answered: bool = False

class MessageTaking(BaseModel):
    opening_line: Optional[str] = None
    closing_line: Optional[str] = None
    questions: Optional[List[MessageQuestion]] = []
    # Include other guided_setup fields

class AgentDetails(BaseModel):
    cool_off: Optional[int] = None  # Cool off period in seconds
    number_of_retries: Optional[int] = 3

class ClientStatus(BaseModel):
    status: str = "queued"  # queued, in_progress, called
    number_of_calls: int = 0
    call_id: Optional[str] = None  # Reference to vapi_calls.call_id

class Client(BaseModel):
    name: str
    phone_number: str
    language: Optional[str] = "en"
    personal_details: Optional[Dict[str, Any]] = {}
    status: ClientStatus = ClientStatus()

class CampaignBase(BaseModel):
    name: str
    business_information: Optional[Dict[str, Any]] = {}  # Same as guided_setup
    message_taking: Optional[MessageTaking] = None
    agent_details: Optional[AgentDetails] = None
    clients: Optional[List[Client]] = []
    status: str = "created"  # created, started, paused, finished
    user_text_file_id: Optional[str] = None  # References to user_text_files.id
    user_web_data_id: Optional[str] = None  # References to user_web_data.id

class CampaignCreate(CampaignBase):
    pass

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    business_information: Optional[Dict[str, Any]] = None
    message_taking: Optional[MessageTaking] = None
    agent_details: Optional[AgentDetails] = None
    clients: Optional[List[Client]] = None
    status: Optional[str] = None
    user_text_file_id: Optional[List[str]] = None
    user_web_data_id: Optional[List[str]] = None

class CampaignResponse(CampaignBase):
    id: str
    user_id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None 