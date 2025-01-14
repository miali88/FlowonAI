# flake8: noqa: E501
import os
from typing import Dict
from dotenv import load_dotenv
from nylas import Client
from services.db.supabase_services import supabase_client
from services.cache import get_all_agents
import ast
import html

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
    response = (
        supabase.table('users')
        .select('id, account_settings')
        .in_('id', user_ids)
        .execute()
    )

    if response.data:
        # Create a mapping of user_id to their settings
        user_settings_map = {
            user['id']: user.get('account_settings', {})
            for user in response.data
        }

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
                # Extract the dictionary string and convert to actual dictionary
                data_str: str = (
                    message["user_message"].split("user input data:")[1].strip()
                )
                # Use ast.literal_eval instead of eval for safety
                user_data: Dict = ast.literal_eval(data_str)

                print("\n\n\n\n +_+_+_ nylas convo extracted user_data:", user_data)
                print("Email Address:", user_data.get("Email Address"))
                break

        if not user_data:
            raise ValueError("No user data found in conversation history")

        # Email to Flowon User
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
            message = nylas.messages.send(
                identifier="5ef0555c-25ab-4b4e-b4a1-02fd8ba4d255",
                request_body=user_request_body
            )

        # Email to Lead
        lead_email = user_data.get("Email Address")
        lead_name = html.escape(user_data.get("Full Name", ""))
        
        if lead_email:
            email_template = """
                <div>
                    <p>Hi {name}</p>
                    <p>Thank you for connecting with our landing page agent! At Flowon AI, 
                    we're offering a select group of business owners the chance to collaborate 
                    with us on building bespoke conversational AI agents tailored to their 
                    unique needs.</p>
                    <p>These agents are designed to revolutionize customer interactions, 
                    streamline operations, and give businesses a competitive edge—but we can 
                    only take on a limited number of projects at a time.</p>
                    <p>If you'd like to secure your spot, let's chat soon before the 
                    remaining slots fill up:</p>
                    <p>Book a quick demo here: 
                    <a href='https://calendly.com/michael-flowon/30min?month=2024-11'>
                    https://calendly.com/michael-flowon/30min?month=2024-11</a><br>
                    Or simply reply to this email to start the conversation.</p>
                    <p>I'd love to explore how we can create a custom AI solution for 
                    your business!</p>
                    <p>Looking forward to hearing from you,<br>
                    Michael<br>
                    Founder @ Flowon AI<br>
                    michael@flowon.ai</p>
                </div>
            """
            
            lead_request_body = {
                "to": [{"email": lead_email}],
                "reply_to": [{"email": recipient_email}],
                "subject": "Flowon: Custom AI Agents for Visionary Businesses",
                "body": email_template.format(name=lead_name)
            }

            # Send email, grant_id default from michael@flowon.ai
            message = nylas.messages.send(
                identifier="5ef0555c-25ab-4b4e-b4a1-02fd8ba4d255",
                request_body=lead_request_body
            )

        nylas_notification = {
            "participant_identity": participant_identity,
            "user_request_body": user_request_body,
            "lead_request_body": lead_request_body
        }

        # Store notification in Supabase
        supabase.table('conversation_logs').update(
            {"nylas_notification": nylas_notification}
        ).eq('participant_identity', participant_identity).execute()

        return message

    except Exception as e:
        print(f"Error sending email: {str(e)}")
        raise  # Re-raise the exception for proper error handling upstream
