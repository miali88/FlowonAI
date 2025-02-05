from typing import Dict, Optional, List
from services.db.supabase_services import get_supabase
from services.composio import get_calendar_slots

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
# The main cache dictionary
agent_metadata_cache: List[Dict[str, dict]] = []


async def get_all_agents() -> list:
    supabase = await get_supabase()

    response = await supabase.table("agents").select("*").execute()
    agent_metadata_cache.extend(response.data)
    return agent_metadata_cache


async def get_agent_metadata(agent_id: str) -> Optional[dict]:
    supabase = await get_supabase()

    """Get agent metadata from cache"""
    response = await supabase.table("agents").select("*").execute()
    agents_dict = {agent['id']: agent for agent in response.data}
    agent = agents_dict.get(agent_id)
    if agent is not None:
        print("\n\n\n agents_dict:", agent.get('dataSource', None))
    return agent

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
