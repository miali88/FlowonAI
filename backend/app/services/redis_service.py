import json
from typing import Optional, Dict, Any
import redis.asyncio as redis
from datetime import datetime
import logging

from app.core.config import settings
from app.clients.supabase_client import get_supabase

# Configure logger
logger = logging.getLogger(__name__)

# Redis connection pool
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    username=settings.REDIS_USER,
    password=settings.REDIS_PASSWORD,
    db=settings.REDIS_DB,
    decode_responses=True
)

logger.info(f"Redis client initialized with host={settings.REDIS_HOST}, port={settings.REDIS_PORT}, db={settings.REDIS_DB}")

class RedisChatStorage:
    @staticmethod
    def get_chat_key(agent_id: str, room_name: str) -> str:
        """Generate a unique Redis key for a chat session"""
        return f"chat:{agent_id}"

    @staticmethod
    async def save_chat(agent_id: str, room_name: str, chat_data: Dict[str, Any]) -> None:
        """Save chat data to Redis with TTL"""
        try:
            logger.debug(f"Saving chat data for agent_id={agent_id}, room_name={room_name}")
            key = RedisChatStorage.get_chat_key(agent_id, room_name)
            
            # Handle both dictionary and ChatHistory object cases
            if hasattr(chat_data, 'to_dict'):
                chat_data = chat_data.to_dict()
                logger.debug("Converted ChatHistory object to dictionary")
            
            # Ensure each message has a timestamp
            for message in chat_data.get("messages", []):
                if "timestamp" not in message:
                    message["timestamp"] = datetime.utcnow().isoformat()
            
            serialized_data = json.dumps({
                "messages": sorted(chat_data.get("messages", []), key=lambda x: x.get("timestamp", "")),
                "response_metadata": chat_data.get("response_metadata", {}),
                "last_updated": datetime.utcnow().isoformat()
            })
            
            async with redis_client.pipeline() as pipe:
                await pipe.set(key, serialized_data)
                await pipe.expire(key, settings.REDIS_TTL)
                await pipe.execute()
            
            logger.info(f"Successfully saved chat to Redis - key: {key}, messages: {len(chat_data.get('messages', []))}")
        except Exception as e:
            logger.error(f"Error saving chat to Redis: {str(e)}", exc_info=True)
            raise

    @staticmethod
    async def get_chat(agent_id: str, room_name: str) -> Optional[Dict[str, Any]]:
        """Retrieve chat data from Redis"""
        logger.debug(f"Retrieving chat data for agent_id={agent_id}, room_name={room_name}")
        key = RedisChatStorage.get_chat_key(agent_id, room_name)
        data = await redis_client.get(key)
        
        if data:
            logger.debug(f"Found chat data for key: {key}")
            return json.loads(data)
        logger.debug(f"No chat data found for key: {key}")
        return None

    @staticmethod
    async def delete_chat(agent_id: str, room_name: str) -> None:
        """Delete chat data from Redis"""
        logger.debug(f"Deleting chat data for agent_id={agent_id}, room_name={room_name}")
        key = RedisChatStorage.get_chat_key(agent_id, room_name)
        result = await redis_client.delete(key)
        if result:
            logger.info(f"Successfully deleted chat with key: {key}")
        else:
            logger.warning(f"No chat found to delete with key: {key}")

    @staticmethod
    async def get_all_chats(agent_id: str) -> Dict[str, Any]:
        """Get all chat data for a specific agent"""
        logger.debug(f"Retrieving all chats for agent_id={agent_id}")
        pattern = f"chat:{agent_id}:*"
        chats = {}
        
        async for key in redis_client.scan_iter(match=pattern):
            # Extract room name from key
            room_name = key.split(":")[-1]  # Get last part after colon
            logger.debug(f"Found chat key: {key}, room_name: {room_name}")
            chat_data = await redis_client.get(key)
            if chat_data:
                try:
                    chats[room_name] = json.loads(chat_data)
                except json.JSONDecodeError:
                    logger.error(f"Failed to decode chat data for key: {key}")
                    continue
        
        logger.info(f"Retrieved {len(chats)} chats for agent_id={agent_id}")
        return chats

    @staticmethod
    async def get_chat_if_exists(agent_id: str, room_name: str) -> Optional[Dict[str, Any]]:
        """Get existing chat data if it exists in Redis"""
        logger.debug(f"Checking if chat exists for agent_id={agent_id}, room_name={room_name}")
        key = RedisChatStorage.get_chat_key(agent_id, room_name)
        chat_data = await redis_client.get(key)
        
        if chat_data:
            try:
                logger.debug(f"Found existing chat for key: {key}")
                return json.loads(chat_data)
            except json.JSONDecodeError:
                logger.error(f"Failed to decode chat data for key: {key}")
                return None
        logger.debug(f"No existing chat found for key: {key}")
        return None


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
        logger.debug(f"Initialized RedisRateLimiter with prefix={key_prefix}, max={max_requests}, window={window_seconds}s")

    def _get_key(self, identifier: str) -> str:
        """Generate a unique Redis key for rate limiting"""
        return f"{self.key_prefix}:{identifier}"

    async def acquire(self, identifier: str = "default") -> bool:
        """
        Check if request is allowed and update counter
        
        Returns:
            bool: True if request is allowed, False if rate limit exceeded
        """
        logger.debug(f"Checking rate limit for {self.key_prefix}, identifier={identifier}")
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

        allowed = requests_count <= self.max_requests
        if allowed:
            logger.debug(f"Rate limit allowed for {key}, count={requests_count}/{self.max_requests}")
        else:
            logger.warning(f"Rate limit exceeded for {key}, count={requests_count}/{self.max_requests}")
        return allowed

    async def get_remaining(self, identifier: str = "default") -> dict:
        """Get remaining requests and reset time"""
        logger.debug(f"Getting remaining rate limit for {self.key_prefix}, identifier={identifier}")
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

        logger.debug(f"Rate limit status for {key}: {remaining}/{self.max_requests} remaining, resets at {reset_time.isoformat()}")
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
        logger.debug("Fetching all agents from database and updating cache")
        supabase = await get_supabase()
        response = supabase.table("agents").select("*").execute()
        agents = response.data
        
        # Cache each agent individually
        async with redis_client.pipeline() as pipe:
            for agent in agents:
                key = RedisAgentMetadataCache.get_key(agent['id'])
                await pipe.set(key, json.dumps(agent), ex=RedisAgentMetadataCache.TTL)
            await pipe.execute()
        
        logger.info(f"Cached metadata for {len(agents)} agents in Redis with TTL={RedisAgentMetadataCache.TTL}s")
        return agents

    @staticmethod
    async def get_agent_metadata(agent_id: str) -> Optional[dict]:
        """Get agent metadata from Redis cache, falling back to database"""
        logger.debug(f"Getting agent metadata for agent_id={agent_id}")
        key = RedisAgentMetadataCache.get_key(agent_id)
        
        # Try to get from cache first
        cached_data = await redis_client.get(key)
        if cached_data:
            logger.debug(f"Cache hit for agent_id={agent_id}")
            return json.loads(cached_data)
        
        # If not in cache, get from database and cache it
        logger.debug(f"Cache miss for agent_id={agent_id}, fetching from database")
        supabase = await get_supabase()
        response = supabase.table("agents").select("*").execute()
        agents_dict = {agent['id']: agent for agent in response.data}
        agent = agents_dict.get(agent_id)
        
        if agent:
            logger.debug(f"Found agent_id={agent_id} in database, updating cache")
            await redis_client.set(key, json.dumps(agent), ex=RedisAgentMetadataCache.TTL)
        else:
            logger.warning(f"Agent with id={agent_id} not found in database")
        
        return agent

    @staticmethod
    async def clear_cache() -> None:
        """Clear all agent metadata from Redis cache"""
        logger.info("Clearing all agent metadata from Redis cache")
        deleted_count = 0
        async for key in redis_client.scan_iter(f"{RedisAgentMetadataCache.CACHE_KEY_PREFIX}*"):
            await redis_client.delete(key)
            deleted_count += 1
        logger.info(f"Cleared {deleted_count} agent metadata entries from cache")

# Create instance for easy access
agent_metadata_cache = RedisAgentMetadataCache()