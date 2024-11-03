import os 
from dotenv import load_dotenv
from nylas import Client

from services.db.supabase_services import supabase_client
from services.cache import get_all_agents

supabase = supabase_client()

load_dotenv()

NYLAS_API_KEY = os.getenv("NYLAS_API_KEY")
NYLAS_API_URI = os.getenv("NYLAS_API_URI")

nylas = Client(
    api_key=NYLAS_API_KEY,
    api_uri=NYLAS_API_URI
)

async def get_agent_user_cache():
    agents = await get_all_agents()
    # Convert list of agents to a dictionary mapping agent_id to user_id
    agent_user_cache = {agent['id']: agent['userId'] for agent in agents}
    
    # Fetch additional user data from Supabase
    expanded_agent_user_cache = {}
    user_ids = list(agent_user_cache.values())
    response = supabase.table('users').select('id, account_settings').in_('id', user_ids).execute()

    if response.data:
        # Create a mapping of user_id to their settings
        user_settings_map = {user['id']: user.get('account_settings', {}) for user in response.data}
        
        # Map the settings back to agent_ids
        for agent_id, user_id in agent_user_cache.items():
            user_settings = user_settings_map.get(user_id, {})
            expanded_agent_user_cache[agent_id] = {
                'user_id': user_id,
                'email': user_settings.get('email'),
                'account_settings': user_settings
            }

    return expanded_agent_user_cache

async def send_email(participant_identity, conversation_history, agent_id):
    try:
        # Get the agent-user cache first
        agent_user_cache = await get_agent_user_cache()
        
        # Initialize user_data as None
        user_data = None
        
        # Loop through conversation history and extract user input data
        for message in conversation_history:
            if "user_message" in message and "user input data:" in message["user_message"]:
                # Extract the dictionary string and convert to actual dictionary using eval()
                data_str = message["user_message"].split("user input data:")[1].strip()
                user_data = eval(data_str)  # Note: eval() can be unsafe, consider using ast.literal_eval()
                break  # Exit loop after finding the first match
        
        if not user_data:
            raise ValueError("No user data found in conversation history")

        # Now this line will work because we have the cache
        recipient_email = agent_user_cache[agent_id]["email"]

        print("recipient_email:", recipient_email)

        request_body = {
                "to": [{"email": recipient_email}],
                "reply_to": [{"email": recipient_email}],
                "subject": "New lead from Flowon AI",
                "body": (
                    f"User submitted the following information: {user_data}\n\n"
                    "Please log in to your dashboard for full transcript"
                )
            }

        nylas_notification = {"participant_identity": participant_identity, 
                             "nylas_request_body": request_body}

        # Store notification in Supabase
        store_notification =supabase.table('conversation_logs').update(
            {"nylas_notification": nylas_notification}
        ).eq('participant_identity', participant_identity).execute()

        # Send email, grant_id default from michael@flowon.ai
        # c9e0a3fa-69b2-46fd-8626-ec25ed85b6ee
        message = nylas.messages.send(
            identifier="5ef0555c-25ab-4b4e-b4a1-02fd8ba4d255",
            request_body=request_body
        )
        return message
        
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        raise  # Re-raise the exception for proper error handling upstream
