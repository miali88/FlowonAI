from datetime import datetime
import stripe
from dotenv import load_dotenv
import os
import logging

from fastapi import Request, APIRouter, Header, HTTPException, Query
from svix.webhooks import Webhook, WebhookVerificationError
from services.db.supabase_services import supabase_client

load_dotenv()

logger = logging.getLogger(__name__)

router = APIRouter()


# Set your Stripe secret key
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

@router.post('')
async def handle_clerk_event(request: Request, svix_id: str = Header(None), \
                             svix_timestamp: str = Header(None), svix_signature: str = Header(None)):
    print("\n\nclerk endpoint:\n\n")

    # Validate the webhook
    payload = await request.body()
    headers = {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature
    }
    secret = os.getenv("CLERK_SIGNING_SECRET")
    if not secret:
        raise HTTPException(status_code=500, detail="CLERK_SIGNING_SECRET not set")

    webhook = Webhook(secret)

    try:
        event = webhook.verify(payload, headers)
    except WebhookVerificationError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    event_type = event.get('type')
    logger.info(f"Received event type: {event_type}")
    print("\n\nEVENT TYPE\n\n")
    print(event_type)

    if event_type == "user.created":
        print("user created")
        await post_user(event)
        
    elif event_type == "session.created":
        print("session created")
        # await post_session(payload)

    # Process the event as needed
    return {"status": "success"}


async def post_user(payload):
    user_data = payload.get('data', {})
    
    # Extract all required fields
    email_addresses = user_data.get('email_addresses', [])
    primary_email_address_id = user_data.get('primary_email_address_id')
    
    try:
        # Find the primary email address
        primary_email = next((email['email_address'] for email in email_addresses if email['id'] == primary_email_address_id), None)
        
        # Get user's full name from Clerk data
        first_name = user_data.get('first_name', '')
        last_name = user_data.get('last_name', '')
        full_name = f"{first_name} {last_name}".strip() or None

        # Create Stripe customer
        try:
            stripe_customer = stripe.Customer.create(
                email=primary_email,
                name=full_name,
                metadata={
                    'clerk_user_id': user_data.get('id'),
                    'signup_date': datetime.now().isoformat()
                }
            )
            logger.info(f"Stripe customer created successfully: {stripe_customer.id}")
        except stripe.error.StripeError as e:
            logger.error(f"Error creating Stripe customer: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to create Stripe customer: {str(e)}")

        # Generate a default username from email
        default_username = primary_email.split('@')[0] if primary_email else None
        
        # Convert timestamps from milliseconds to ISO format
        created_at = datetime.fromtimestamp(user_data.get('created_at') / 1000).isoformat() if user_data.get('created_at') else None
        updated_at = datetime.fromtimestamp(user_data.get('updated_at') / 1000).isoformat() if user_data.get('updated_at') else None
        last_login = datetime.fromtimestamp(user_data.get('last_sign_in_at') / 1000).isoformat() if user_data.get('last_sign_in_at') else None

        # Prepare user data matching the table schema
        user_record = {
            'id': user_data.get('id'),
            'username': default_username,
            'email': primary_email,
            'phone_number': None,
            'password_hash': 'clerk_authenticated',
            'created_at': created_at,
            'updated_at': updated_at,
            'last_login': last_login,
            'is_active': True,
            'role': 'user',
            'notification_settings': {},
            'account_settings': {},
            'user_plan': 'free',
            'telephony_numbers': {},
            'stripe_customer_id': stripe_customer.id  # Add Stripe customer ID to user record
        }

        data, count = supabase_client().table('users').insert(user_record).execute()
        
        logger.info(f"User data saved successfully. Affected rows: {count}")
        return data
    except Exception as e:
        logger.error(f"Error saving user data to database: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")
