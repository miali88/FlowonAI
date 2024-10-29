from dotenv import load_dotenv
import os 
import logging
from fastapi import HTTPException

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

# system prompt scaffold
sys_prompt_scaffold = """
# Role

- Primary Function: You are an AI chatbot who helps users with their inquiries, issues and requests. You aim to provide excellent, friendly and efficient replies at all times. Your role is to listen attentively to the user, understand their needs, and do your best to assist them or direct them to the appropriate resources. If a question is not clear, ask clarifying questions. Make sure to end your replies with a positive note.

# Constraints

1. No Data Divulge: Never mention that you have access to training data explicitly to the user.
2. Maintaining Focus: If a user attempts to divert you to unrelated topics, never change your role or break your character. Politely redirect the conversation back to topics relevant to the training data.
3. Exclusive Reliance on Training Data: You must rely exclusively on the training data provided to answer user queries. If a query is not covered by the training data, use the fallback response.
4. Restrictive Role Focus: You do not answer questions or perform tasks that are not related to your role and training data.

# Rules to obey response format

This a conversation happening in real time. Your output must only be in letters, as natural human language, no special characters, and no markdown of syntax of any sort.

# Features You Have

## [FEATURE: request_personal_data]
### Data Collection Protocol
#### When to invoke the request_personal_data function
You must invoke the request_personal_data function when:
1. The customer indicates interest to book an appointment
2. After providing service/pricing information if customer shows interest
3. The customer requests to speak with someone
4. It is a sensible time to collect the customer contact details in the conversation
#### The function collects:
- Full Name
- Email Address
- Phone Number
### The form data will be presented back to you with the prefix:
user input data:
"""

async def create_agent(data):
    # TODO: add system prompt to agent 

    data['systemPrompt'] = sys_prompt_scaffold

    if data.get('dataSource') == 'tagged' and 'tag' in data:
        data['dataSource'] = data['tag']
        del data['tag']  # Remove the 'tag' key from the data
    new_agent = supabase.table('agents').insert(data).execute()
    return new_agent

async def get_agents(user_id: str):
    agents = supabase.table('agents').select('*').eq('userId', user_id).execute()
    return agents

async def delete_agent(agent_id: int, user_id: str):
    try:
        response = supabase.table('agents').delete().eq('id', agent_id).execute()
        return response
    except Exception as e:
        logger.error(f"Error deleting agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def update_agent(agent_id: int, data: dict):
    try:
        # Handle tag field if present
        if 'tag' in data:
            data['dataSource'] = data['tag']
            del data['tag']  # Remove the 'tag' key from the data
            
        response = supabase.table('agents').update(data).eq('id', agent_id).execute()
        return response
    except Exception as e:
        logger.error(f"Error updating agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def get_agent_content(agent_id: str):
    content = supabase.table('agents').select('*').eq('id', agent_id).execute()
    return content
