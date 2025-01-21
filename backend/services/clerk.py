from datetime import datetime
import requests, os, logging
from dotenv import load_dotenv
from fastapi import HTTPException

import stripe 

from services.db.supabase_services import supabase_client

load_dotenv()

# Set your Stripe secret key
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

logger = logging.getLogger(__name__)

async def post_user(payload):
    user_data = payload.get('data', {})
    
    # Extract all required fields
    email_addresses = user_data.get('email_addresses', [])
    primary_email_address_id = user_data.get('primary_email_address_id')
    clerk_user_id = user_data.get('id')  # Get Clerk user ID
    
    try:
        # Find the primary email address
        primary_email = next((email['email_address'] for email in email_addresses if email['id'] == primary_email_address_id), None)
        
        # Get user's full name from Clerk data
        first_name = user_data.get('first_name', '')
        last_name = user_data.get('last_name', '')
        full_name = f"{first_name} {last_name}".strip() or None

        try:
            # Create Stripe customer
            stripe_customer = stripe.Customer.create(
                email=primary_email,
                name=full_name,
                metadata={
                    'signup_date': datetime.now().isoformat()
                }
            )
            logger.info(f"Stripe customer created successfully: {stripe_customer.id}")
            
            # Update Clerk user metadata with Stripe customer ID
            clerk_api_key = os.getenv('CLERK_SECRET_KEY')
            clerk_api_url = f"https://api.clerk.dev/v1/users/{clerk_user_id}/metadata"
            
            headers = {
                "Authorization": f"Bearer {clerk_api_key}",
                "Content-Type": "application/json"
            }
            
            metadata_payload = {
                "private_metadata": {
                    "stripe_customer_id": stripe_customer.id
                }
            }
            
            response = requests.patch(clerk_api_url, json=metadata_payload, headers=headers)
            
            if not response.ok:
                logger.error(f"Failed to update Clerk metadata: {response.text}")
                raise HTTPException(status_code=500, detail="Failed to update Clerk metadata")
                
            logger.info("Successfully updated Clerk metadata with Stripe customer ID")
            
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

async def get_clerk_private_metadata(clerk_user_id: str):
    """Fetch private metadata for a Clerk user."""
    try:
        clerk_api_key = os.getenv('CLERK_SECRET_KEY')
        clerk_api_url = f"https://api.clerk.dev/v1/users/{clerk_user_id}"
        
        headers = {
            "Authorization": f"Bearer {clerk_api_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(clerk_api_url, headers=headers)
        if not response.ok:
            logger.error(f"Failed to fetch Clerk metadata: {response.text}")
            raise HTTPException(status_code=500, detail="Failed to fetch Clerk metadata")
        
        user_data = response.json()
        private_metadata = user_data.get('private_metadata', {})
        return private_metadata
        
    except Exception as e:
        logger.error(f"Error fetching Clerk private metadata: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch Clerk metadata: {str(e)}")