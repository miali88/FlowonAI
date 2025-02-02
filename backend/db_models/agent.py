from datetime import datetime
from pydantic import BaseModel
from typing import Optional, Dict
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


# Request Model - what the frontend sends
class AgentCreate(BaseModel):
    agentName: str
    agentPurpose: str
    dataSource: Optional[str]
    tag: Optional[str]
    openingLine: Optional[str]
    language: str
    voice: Optional[str]
    voiceProvider: Optional[str]
    instructions: Optional[str]
    uiConfig: Optional[Dict]
    features: Dict


# Response Model - what the API returns
class AgentResponse(BaseModel):
    id: str
    agentName: str
    agentPurpose: str
    dataSource: Optional[str]
    tag: Optional[str]
    openingLine: Optional[str]
    language: str
    voice: Optional[str]
    voiceProvider: Optional[str]
    instructions: Optional[str]
    uiConfig: Optional[Dict]
    features: Dict
    created_at: datetime
    updated_at: datetime


# Database Model (if using SQLAlchemy)
class AgentDB(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True)
    agent_name = Column(String, nullable=False)
    agent_purpose = Column(String, nullable=False)
    data_source = Column(String)
    tag = Column(String)
    opening_line = Column(String)
    language = Column(String, nullable=False)
    voice = Column(String)
    voice_provider = Column(String)
    instructions = Column(String)
    ui_config = Column(JSON)
    features = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
