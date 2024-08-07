from fastapi import HTTPException
from services import twilio
from services.db_queries import db_case_locator
from app.core.config import settings

class Outbound:
    def __init__(self, in_memory_cache):
        self.in_memory_cache = in_memory_cache

    async def callee_information(self, event, request):
        twilio_response = await twilio.callee_information(event, request)
        print(twilio_response)

        return twilio_response

    async def info_retrieve(self, event, request):
        twilio_response = await twilio.info_retrieve(event, request)
        print(twilio_response)

        return twilio_response
    