from dotenv import load_dotenv
import os 


import logging

from supabase import create_client, Client

from app.core.config import settings

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

# Set up logging with timestamps
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create a custom formatter with timestamps
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

async def create_agent(data):
    if data.get('dataSource') == 'tagged' and 'tag' in data:
        data['dataSource'] = data['tag']
        del data['tag']  # Remove the 'tag' key from the data
    new_agent = supabase.table('agents').insert(data).execute()
    return new_agent

async def get_agents(user_id: str):
    agents = supabase.table('agents').select('*').eq('userId', user_id).execute()
    return agents
