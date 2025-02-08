from supabase._async.client import AsyncClient
import os
from dotenv import load_dotenv
import logging
from typing import Optional
import asyncio

load_dotenv()

logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL is not set in the environment variables")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY is not set in the environment variables")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_KEY")
if not SUPABASE_ANON_KEY:
    raise ValueError("SUPABASE_KEY is not set in the environment variables")

class SupabaseConnection:
    _client: Optional[AsyncClient] = None
    _initialization_lock = asyncio.Lock()
    _initialized = False

    @classmethod
    async def get_client(cls) -> AsyncClient:
        """Get or initialize the Supabase client with proper locking."""
        if not cls._initialized:
            async with cls._initialization_lock:
                if not cls._initialized:  # Double-check pattern
                    logger.info("Initializing Supabase client...")
                    url = os.getenv("SUPABASE_URL")
                    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
                    
                    if not url or not key:
                        raise ValueError("Missing Supabase credentials in environment variables")
                    
                    try:
                        cls._client = AsyncClient(url, key)
                        cls._initialized = True
                        logger.info("Supabase client initialized successfully")
                    except Exception as e:
                        logger.error(f"Failed to initialize Supabase client: {e}")
                        raise

        return cls._client

    @classmethod
    async def close(cls) -> None:
        """Close the Supabase client connection."""
        cls._client = None
        cls._initialized = False
        logger.info("Supabase client connection closed")

# Create the global instance
supabase_client = SupabaseConnection()

# This is the global variable that will be imported by other modules
# Add type annotation that explicitly allows None
supabase: Optional[AsyncClient] = None

async def get_supabase() -> AsyncClient:
    """
    Helper function to get the initialized client.
    This ensures the client is initialized before use.
    """
    global supabase
    if supabase is None:
        supabase = await supabase_client.get_client()
    return supabase

