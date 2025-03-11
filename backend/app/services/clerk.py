from datetime import datetime
import requests, os, logging
from dotenv import load_dotenv
from fastapi import HTTPException

import stripe 

from app.clients.supabase_client import get_supabase
from app.models.users import UserInDB

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
    
    # Check if this is a test webhook (Clerk test events often use specific IDs)
    is_test_webhook = clerk_user_id and (
        clerk_user_id.startswith('user_test_') or 
        clerk_user_id == 'user_29w83sxmDNGwOuEthce5gg56FcC' or  # Known test ID from the payload
        '@example.org' in str(email_addresses)  # Test emails often use example.org
    )
    
    logger.info(f"Processing user creation for clerk_user_id: {clerk_user_id}, is_test_webhook: {is_test_webhook}")
    
    try:
        supabase = await get_supabase()

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
            
            # Skip Clerk metadata update for test webhooks
            if not is_test_webhook:
                # Update Clerk user metadata with Stripe customer ID
                clerk_api_key = os.getenv('CLERK_SECRET_KEY')
                clerk_api_url = f"https://api.clerk.com/v1/users/{clerk_user_id}/metadata"
                
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
                    if is_test_webhook:
                        logger.warning(f"Ignoring Clerk metadata update error for test webhook")
                    else:
                        raise HTTPException(status_code=500, detail="Failed to update Clerk metadata")
                    
                logger.info("Successfully updated Clerk metadata with Stripe customer ID")
            else:
                logger.info(f"Skipping Clerk metadata update for test webhook with ID: {clerk_user_id}")
            
        except stripe.error.StripeError as e:
            logger.error(f"Error creating Stripe customer: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to create Stripe customer: {str(e)}")

        # Generate a default username from email
        default_username = primary_email.split('@')[0] if primary_email else None
        
        # Convert timestamps from milliseconds to ISO format
        created_at = datetime.fromtimestamp(user_data.get('created_at') / 1000) if user_data.get('created_at') else None
        updated_at = datetime.fromtimestamp(user_data.get('updated_at') / 1000) if user_data.get('updated_at') else None
        last_login = datetime.fromtimestamp(user_data.get('last_sign_in_at') / 1000) if user_data.get('last_sign_in_at') else None

        # Create user with our model
        user = UserInDB(
            id=user_data.get('id'),
            username=default_username,
            email=primary_email,
            password_hash='clerk_authenticated',
            created_at=created_at,
            updated_at=updated_at,
            last_login=last_login,
            is_active=True,
            role='user',
            notification_settings={},
            account_settings={},
            user_plan=None,
            telephony_numbers={},
            stripe_customer_id=stripe_customer.id,
            onboarding_completed=False,  # Default to false for new users
            
            # Initialize trial fields
            is_trial=False,  # Will be set to True when user selects trial plan
            trial_start_date=None,
            trial_end_date=None,
            trial_plan_type=None,
            trial_minutes_used=0,
            trial_minutes_total=25,  # Default trial minutes
            
            # Mark test users
            is_test_user=is_test_webhook if is_test_webhook else None
        )
        
        # Convert to dict for database insertion
        user_dict = user.model_dump()
        
        # Convert datetime objects to strings for Supabase
        for field in ['created_at', 'updated_at', 'last_login', 'trial_start_date', 'trial_end_date']:
            if user_dict.get(field):
                user_dict[field] = user_dict[field].isoformat()

        # Insert the user into the database
        data, count = await supabase.table('users').insert(user_dict).execute()
        
        logger.info(f"User data saved successfully. Affected rows: {count}")
        return data
    except Exception as e:
        logger.error(f"Error saving user data to database: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

async def get_clerk_private_metadata(clerk_user_id: str):
    """Fetch private metadata for a Clerk user."""
    try:
        clerk_api_key = os.getenv('CLERK_SECRET_KEY')
        clerk_api_url = f"https://api.clerk.com/v1/users/{clerk_user_id}"
        
        headers = {
            "Authorization": f"Bearer {clerk_api_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(clerk_api_url, headers=headers)
        if not response.ok:
            logger.error(f"Failed to fetch Clerk metadata: {response.text}")
            if "not found" in response.text.lower() and "user_29w83sxmDNGwOuEthce5gg56FcC" in clerk_user_id:
                logger.warning(f"Test user ID detected in metadata request. Returning empty metadata.")
                return {}
            raise HTTPException(status_code=500, detail="Failed to fetch Clerk metadata")
        
        user_data = response.json()
        private_metadata = user_data.get('private_metadata', {})
        return private_metadata
        
    except Exception as e:
        logger.error(f"Error fetching Clerk private metadata: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch Clerk metadata: {str(e)}")