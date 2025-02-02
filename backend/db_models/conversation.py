from pydantic import BaseModel
from typing import List, Optional

class Message(BaseModel):
    assistant_message: Optional[dict] = None
    user_message: Optional[dict] = None

class Conversation(BaseModel):
    messages: List[Message]
