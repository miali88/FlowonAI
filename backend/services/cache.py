from typing import Dict, Optional, List
from services.db.supabase_services import supabase_client

from services.composio import get_calendar_slots

supabase = supabase_client()


""" CALENDAR CACHE """
calendar_cache: Dict[str, dict] = {}

async def initialize_calendar_cache(user_id: str, app: str) -> None:
    """Initialize the calendar cache"""
    calendar_slots: Dict = await get_calendar_slots(user_id, "googlecalendar")
    calendar_cache[user_id] = calendar_slots
    print(f"Calendar cache initialized for user_id: {user_id}")
    return calendar_slots



""" LIVEKIT WEBHOOK CACHE """
call_data = {}


""" DATABASE CACHE """

kb_cache: Dict[str, dict] = {}

# async def get_kb_cache(agent_id: str) -> Optional[dict]:


""" AGENT METADATA CACHE """
# The main cache dictionary
agent_metadata_cache: List[Dict[str, dict]] = []

async def get_all_agents() -> list:
    response = supabase.table("agents").select("*").execute()
    agent_metadata_cache.extend(response.data)
    return agent_metadata_cache

async def get_agent_metadata(agent_id: str) -> Optional[dict]:
    """Get agent metadata from cache"""
    response = supabase.table("agents").select("*").execute()
    agents_dict = {agent['id']: agent for agent in response.data}
    return agents_dict.get(agent_id)

# async def update_agent_metadata(agent_id: str, metadata: dict) -> None:
#     """Update agent metadata in cache"""
#     agent_metadata_cache[agent_id] = metadata


# async def delete_agent_metadata(agent_id: str) -> None:
#     """Remove agent metadata from cache"""
#     agent_metadata_cache.pop(agent_id, None)

# Optional: Clear entire cache if needed
async def clear_cache() -> None:
    """Clear entire cache"""
    agent_metadata_cache.clear()