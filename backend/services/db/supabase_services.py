from supabase import create_client
import os  
from dotenv import load_dotenv

load_dotenv()

def supabase_client(key: str = "service_role_key"):
    url = os.getenv("SUPABASE_URL")
    
    if key == "service_role_key":
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    else:
        key = os.getenv("SUPABASE_KEY")

    return create_client(url, key)
