from typing import Dict, Optional

# The main cache dictionary
agent_metadata_cache: Dict[str, dict] = {}

async def get_agent_metadata(agent_id: str) -> Optional[dict]:
    """Get agent metadata from cache"""
    return agent_metadata_cache.get(agent_id)

async def update_agent_metadata(agent_id: str, metadata: dict) -> None:
    """Update agent metadata in cache"""
    agent_metadata_cache[agent_id] = metadata

async def delete_agent_metadata(agent_id: str) -> None:
    """Remove agent metadata from cache"""
    agent_metadata_cache.pop(agent_id, None)

# Optional: Clear entire cache if needed
async def clear_cache() -> None:
    """Clear entire cache"""
    agent_metadata_cache.clear()