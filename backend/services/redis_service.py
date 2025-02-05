import json
from typing import Optional, Dict, Any
import redis.asyncio as redis
from datetime import datetime
from app.core.config import settings
from services.db.supabase_services import supabase

# Redis connection pool
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    username=settings.REDIS_USER,
    password=settings.REDIS_PASSWORD,
    db=settings.REDIS_DB,
    decode_responses=True
)

class RedisChatStorage:
    @staticmethod
    def get_chat_key(agent_id: str, room_name: str) -> str:
        """Generate a unique Redis key for a chat session"""
        return f"chat:{agent_id}:{room_name}"

    @staticmethod
    async def save_chat(agent_id: str, room_name: str, chat_data: Dict[str, Any]) -> None:
        """Save chat data to Redis with TTL"""
        key = RedisChatStorage.get_chat_key(agent_id, room_name)
        
        # Handle both dictionary and ChatHistory object cases
        if hasattr(chat_data, 'to_dict'):
            chat_data = chat_data.to_dict()
        
        serialized_data = json.dumps({
            "messages": chat_data.get("messages", []),
            "response_metadata": chat_data.get("response_metadata", {}),
            "last_updated": datetime.utcnow().isoformat()
        })
        
        async with redis_client.pipeline() as pipe:
            await pipe.set(key, serialized_data)
            await pipe.expire(key, settings.REDIS_TTL)
            await pipe.execute()

    @staticmethod
    async def get_chat(agent_id: str, room_name: str) -> Optional[Dict[str, Any]]:
        """Retrieve chat data from Redis"""
        key = RedisChatStorage.get_chat_key(agent_id, room_name)
        data = await redis_client.get(key)
        
        if data:
            return json.loads(data)
        return None

    @staticmethod
    async def delete_chat(agent_id: str, room_name: str) -> None:
        """Delete chat data from Redis"""
        key = RedisChatStorage.get_chat_key(agent_id, room_name)
        await redis_client.delete(key)

    @staticmethod
    async def get_all_chats(agent_id: str) -> Dict[str, Any]:
        """Get all chat data for a specific agent"""
        pattern = f"chat:{agent_id}:*"
        chats = {}
        
        async for key in redis_client.scan_iter(match=pattern):
            # Extract room name from key
            room_name = key.split(":")[-1]  # Get last part after colon
            chat_data = await redis_client.get(key)
            if chat_data:
                try:
                    chats[room_name] = json.loads(chat_data)
                except json.JSONDecodeError:
                    logger.error(f"Failed to decode chat data for key: {key}")
                    continue
                
        return chats


class RedisRateLimiter:
    def __init__(self, key_prefix: str, max_requests: int, window_seconds: int = 60):
        """
        Initialize a Redis-based rate limiter
        
        Args:
            key_prefix: Prefix for the Redis key (e.g., 'rate_limit:scrape')
            max_requests: Maximum number of requests allowed in the time window
            window_seconds: Time window in seconds (default: 60 seconds)
        """
        self.key_prefix = key_prefix
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    def _get_key(self, identifier: str) -> str:
        """Generate a unique Redis key for rate limiting"""
        return f"{self.key_prefix}:{identifier}"

    async def acquire(self, identifier: str = "default") -> bool:
        """
        Check if request is allowed and update counter
        
        Returns:
            bool: True if request is allowed, False if rate limit exceeded
        """
        key = self._get_key(identifier)
        current_time = datetime.utcnow().timestamp()
        window_start = current_time - self.window_seconds

        async with redis_client.pipeline() as pipe:
            # Remove old entries
            await pipe.zremrangebyscore(key, '-inf', window_start)
            # Count requests in current window
            await pipe.zcard(key)
            # Add new request
            await pipe.zadd(key, {str(current_time): current_time})
            # Set expiration
            await pipe.expire(key, self.window_seconds)
            # Execute pipeline
            _, requests_count, *_ = await pipe.execute()

        return requests_count <= self.max_requests

    async def get_remaining(self, identifier: str = "default") -> dict:
        """Get remaining requests and reset time"""
        key = self._get_key(identifier)
        current_time = datetime.utcnow().timestamp()
        window_start = current_time - self.window_seconds

        async with redis_client.pipeline() as pipe:
            await pipe.zremrangebyscore(key, '-inf', window_start)
            await pipe.zcard(key)
            results = await pipe.execute()

        current_requests = results[1]
        remaining = max(0, self.max_requests - current_requests)
        reset_time = datetime.fromtimestamp(window_start + self.window_seconds)

        return {
            "remaining": remaining,
            "reset_time": reset_time.isoformat(),
            "limit": self.max_requests
        }

# Create rate limiters with the same limits as your original code
scrape_limiter = RedisRateLimiter("rate_limit:scrape", max_requests=20)  # 20 per minute
crawl_limiter = RedisRateLimiter("rate_limit:crawl", max_requests=3)     # 3 per minute

class RedisAgentMetadataCache:
    CACHE_KEY_PREFIX = "agent_metadata:"
    TTL = 3600  # 1 hour cache expiration

    @staticmethod
    def get_key(agent_id: str) -> str:
        """Generate a unique Redis key for agent metadata"""
        return f"{RedisAgentMetadataCache.CACHE_KEY_PREFIX}{agent_id}"

    @staticmethod
    async def get_all_agents() -> list:
        """Get all agents and cache them in Redis"""
        response = supabase.table("agents").select("*").execute()
        agents = response.data
        
        # Cache each agent individually
        async with redis_client.pipeline() as pipe:
            for agent in agents:
                key = RedisAgentMetadataCache.get_key(agent['id'])
                await pipe.set(key, json.dumps(agent), ex=RedisAgentMetadataCache.TTL)
            await pipe.execute()
        
        return agents

    @staticmethod
    async def get_agent_metadata(agent_id: str) -> Optional[dict]:
        """Get agent metadata from Redis cache, falling back to database"""
        key = RedisAgentMetadataCache.get_key(agent_id)
        
        # Try to get from cache first
        cached_data = await redis_client.get(key)
        if cached_data:
            return json.loads(cached_data)
        
        # If not in cache, get from database and cache it
        response = supabase.table("agents").select("*").execute()
        agents_dict = {agent['id']: agent for agent in response.data}
        agent = agents_dict.get(agent_id)
        
        if agent:
            await redis_client.set(key, json.dumps(agent), ex=RedisAgentMetadataCache.TTL)
        
        return agent

    @staticmethod
    async def clear_cache() -> None:
        """Clear all agent metadata from Redis cache"""
        async for key in redis_client.scan_iter(f"{RedisAgentMetadataCache.CACHE_KEY_PREFIX}*"):
            await redis_client.delete(key)

# Create instance for easy access
agent_metadata_cache = RedisAgentMetadataCache()