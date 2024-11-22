import os 
from typing import Dict
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
                data_str: str = message["user_message"].split("user input data:")[1].strip()
                user_data: Dict = eval(data_str)  # Note: eval() can be unsafe, consider using ast.literal_eval()

                print("\n\n\n\n +_+_+_ nylas convo extracted user_data:", user_data)
                print("Email Address:", user_data.get("Email Address"))
                break  # Exit loop after finding the first match
        
        if not user_data:
            raise ValueError("No user data found in conversation history")

        """ email to Flowon User """
        # Now this line will work because we have the cache
        recipient_email = agent_user_cache[agent_id]["email"]
        if recipient_email:
            print("recipient_email:", recipient_email)

            user_request_body = {
                    "to": [{"email": recipient_email}],
                    "reply_to": [{"email": recipient_email}],
                    "subject": "New lead from Flowon AI",
                    "body": (
                        f"<div>"
                        f"<p>User submitted the following information:</p>"
                        f"<pre>{user_data}</pre>"
                        f"<p>Please log in to your dashboard for full transcript</p>"
                        f"</div>"
                    )
                }

      # Send email, grant_id default from michael@flowon.ai
        # c9e0a3fa-69b2-46fd-8626-ec25ed85b6ee
        message = nylas.messages.send(
            identifier="5ef0555c-25ab-4b4e-b4a1-02fd8ba4d255",
            request_body=user_request_body
        )

        """ email to Lead """
        lead_email = user_data.get("Email Address")
        lead_name = user_data.get("Full Name")
        if lead_email:
            lead_request_body = {
                    "to": [{"email": lead_email}],
                    "reply_to": [{"email": recipient_email}],
                    "subject": "Flowon: Conversation with Agent AI",
                    "body": (
                        f"<div>"
                        f"<p>Hi {lead_name},</p>"
                        f"<p>Thank you for chatting with our landing page agent. I hope you found it informative. "
                        f"Would you like to explore ways we can help to integrate conversation AI into your business?</p>"
                        f"<p>If so, feel free to shoot me an email at michael@flowon.ai, or just schedule a demo with me here:<br>"
                        f"<a href='https://calendly.com/michael-flowon/30min?month=2024-11'>https://calendly.com/michael-flowon/30min?month=2024-11</a></p>"
                        f"<p>Thanks,<br>"
                        f"Michael, founder @ Flowon AI</p>"
                        f"</div>"
                    )
                }

      # Send email, grant_id default from michael@flowon.ai
        # c9e0a3fa-69b2-46fd-8626-ec25ed85b6ee
        message = nylas.messages.send(
            identifier="5ef0555c-25ab-4b4e-b4a1-02fd8ba4d255",
            request_body=lead_request_body
        )


        nylas_notification = {"participant_identity": participant_identity, 
                             "user_request_body": user_request_body,
                             "lead_request_body": lead_request_body}

        # Store notification in Supabase
        store_notification = supabase.table('conversation_logs').update(
            {"nylas_notification": nylas_notification}
        ).eq('participant_identity', participant_identity).execute()

  
        return message
        
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        raise  # Re-raise the exception for proper error handling upstream
