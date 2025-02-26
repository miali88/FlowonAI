from supabase import create_client
from supabase._sync.client import SyncClient
import os
from dotenv import load_dotenv
from typing import Any

load_dotenv()


def supabase_client(key: str = "service_role_key") -> SyncClient:
    url = os.getenv("SUPABASE_URL")
    if not url:
        raise ValueError("SUPABASE_URL is not set in the environment variables")

    supabase_key: str
    if key == "service_role_key":
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        if not supabase_key:
            raise ValueError("SUPABASE_SERVICE_ROLE_KEY is not set in the environment variables")
    else:
        supabase_key = os.getenv("SUPABASE_KEY", "")
        if not supabase_key:
            raise ValueError("SUPABASE_KEY is not set in the environment variables")

    return create_client(url, supabase_key)

# Create a singleton instance of the Supabase client
supabase = supabase_client()
