from fastapi import HTTPException, Request
from services import twilio
from services.db_queries import db_case_locator
from app.core.config import settings
from typing import Dict, Any, Tuple, Optional

class AppBooking:
    def __init__(self, in_memory_cache: Any):
        self.in_memory_cache = in_memory_cache

        