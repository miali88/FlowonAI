from supabase._async.client import AsyncClient
import os
from dotenv import load_dotenv
from app.core.logging_setup import logger 
from typing import Optional
import asyncio

load_dotenv()

# Load the appropriate environment file based on ENVIRONMENT
environment = os.getenv("ENVIRONMENT", "local")
env_file = f".env.{environment}"
logger.info(f"Loading environment from {env_file}")
load_dotenv(env_file)


# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
print("SUPABASE_URL", SUPABASE_URL)
if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL is not set in the environment variables")

SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY is not set in the environment variables")

SUPABASE_ANON_KEY = os.getenv("SUPABASE_KEY")
if not SUPABASE_ANON_KEY:
    raise ValueError("SUPABASE_KEY is not set in the environment variables")

logger.info(f"Initialized Supabase configuration for environment: {environment}")

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
                    logger.info(f"Initializing Supabase client for {environment} environment...")
                    url = os.getenv("SUPABASE_URL")
                    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
                    
                    if not url or not key:
                        raise ValueError("Missing Supabase credentials in environment variables")
                    
                    try:
                        cls._client = AsyncClient(url, key)
                        cls._initialized = True
                        logger.info(f"Supabase client initialized successfully for {environment}")
                    except Exception as e:
                        logger.error(f"Failed to initialize Supabase client: {e}")
                        raise

        return cls._client

    @classmethod
    async def close(cls) -> None:
        """Close the Supabase client connection."""
        if cls._client:
            cls._client = None
            cls._initialized = False
            logger.info(f"Supabase client connection closed for {environment}")

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
        logger.debug(f"Getting Supabase client for {environment} environment")
        supabase = await supabase_client.get_client()
    return supabase

