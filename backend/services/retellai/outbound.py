from fastapi import HTTPException
from services import twilio
from services.db_queries import db_case_locator
from app.core.config import settings
from typing import Any, Dict

class Outbound:
    def __init__(self, in_memory_cache: Any) -> None:
        self.in_memory_cache = in_memory_cache

#     async def callee_information(self, event: Dict[str, Any], request: Any) -> Dict[str, Any]:
#         twilio_response = await twilio.get_callee_information(event, request)
#         print(twilio_response)

#         return twilio_response

#     async def info_retrieve(self, event: Dict[str, Any], request: Any) -> Dict[str, Any]:
#         twilio_response = await twilio.get_info_retrieve(event, request)
#         print(twilio_response)

#         return twilio_response