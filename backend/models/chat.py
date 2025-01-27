from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from database import Base
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# SQLAlchemy Model for database
class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True)
    message = Column(Text, nullable=False)
    agent_id = Column(String, nullable=False)
    room_name = Column(String, nullable=False)
    response_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Pydantic Models for request/response validation
class ChatMessageCreate(BaseModel):
    message: str
    agent_id: str
    room_name: str

class ChatMessageResponse(BaseModel):
    id: str
    message: str
    agent_id: str
    room_name: str
    response_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True 