from typing import Dict 

from app.clients.supabase_client import supabase_client
from app.services.redis_service import agent_metadata_cache
from app.services.composio import get_calendar_slots

""" CALENDAR CACHE """
calendar_cache: Dict[str, dict] = {}

async def initialize_calendar_cache(user_id: str, app: str) -> Dict:
    """Initialize the calendar cache"""
    calendar_slots: Dict = await get_calendar_slots(user_id, "googlecalendar")
    calendar_cache[user_id] = calendar_slots
    print(f"Calendar cache initialized for user_id: {user_id}")
    return calendar_slots


""" LIVEKIT WEBHOOK CACHE """
call_data: Dict[str, dict] = {}


""" DATABASE CACHE """

kb_cache: Dict[str, dict] = {}

# async def get_kb_cache(agent_id: str) -> Optional[dict]:


""" AGENT METADATA CACHE """
get_all_agents = agent_metadata_cache.get_all_agents
get_agent_metadata = agent_metadata_cache.get_agent_metadata
clear_cache = agent_metadata_cache.clear_cache
