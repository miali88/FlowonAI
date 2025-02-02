from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import stripe
from typing import Optional
import os 
from dotenv import load_dotenv
from services.db.supabase_services import supabase_client
import logging

load_dotenv()

# Initialize Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

logger = logging.getLogger(__name__)

class PaymentLinkRequest(BaseModel):
    product_id: str = "prod_RcfvpRgzSUvVXj"
    quantity: int = 1
    unit_amount: int 
    currency: Optional[str] = "usd"
    customer_id: str

async def create_payment_link(request: PaymentLinkRequest):
    try:
        # Create a Price object with the dynamic amount
        price = stripe.Price.create(
            unit_amount=request.unit_amount,
            currency=request.currency,
            product=request.product_id,
        )

        # Create a Payment Link with metadata
        payment_link = stripe.PaymentLink.create(
            line_items=[{
                'price': price.id,
                'quantity': request.quantity,
            }],
            after_completion={'type': 'redirect', 'redirect': {'url': os.getenv('FRONTEND_BASE_URL') + '/dashboard/agenthub'}},
            metadata={
                'customer_id': request.customer_id,
                'product_id': request.product_id,
            } if request.customer_id else {}
        )

        return payment_link.url
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))    
    

async def update_user_features(
    customer_id: str,
    product_id: str,
    quantity: int
) -> None:
    """
    Updates user features based on their Stripe purchase.
    
    Args:
        customer_id: The Stripe customer ID
        product_id: The Stripe product ID that was purchased
        quantity: The quantity of the product purchased
    """
    try:
        logger.info(f"Starting feature update for customer_id: {customer_id}, product_id: {product_id}, quantity: {quantity}")
        
        # First get the clerk_user_id from customer_id
        logger.debug(f"Fetching clerk_user_id for customer_id: {customer_id}")
        response = await supabase_client.table('users').select('clerk_user_id').eq('stripe_customer_id', customer_id).execute()
        
        if not response.data or len(response.data) == 0:
            logger.error(f"No user found for customer_id: {customer_id}")
            raise HTTPException(status_code=404, detail=f"User not found for customer_id: {customer_id}")
            
        clerk_user_id = response.data[0]['clerk_user_id']
        logger.debug(f"Found clerk_user_id: {clerk_user_id}")
        
        # Map product IDs to feature updates
        feature_updates = {
            "prod_RcfvpRgzSUvVXj": {  # Phone number product
                "table": "user_features",
                "updates": {
                    "available_phone_numbers": quantity
                }
            },
            # Add other product mappings as needed
        }
        
        if product_id not in feature_updates:
            logger.warning(f"Unknown product_id: {product_id}. No feature updates will be applied.")
            return
            
        # Get the update configuration for this product
        update_config = feature_updates[product_id]
        logger.debug(f"Applying feature updates: {update_config['updates']} for table: {update_config['table']}")
        
        # Update the appropriate features table
        response = await supabase_client.table(update_config["table"]).upsert({
            "clerk_user_id": clerk_user_id,
            **update_config["updates"]
        }).execute()
        
        if response.error:
            logger.error(f"Database update failed for clerk_user_id: {clerk_user_id}. Error: {response.error.message}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to update user features: {response.error.message}"
            )
            
        logger.info(f"Successfully updated features for user {clerk_user_id}. Updates applied: {update_config['updates']}")
        
    except Exception as e:
        logger.error(f"Error updating user features for customer_id: {customer_id}, product_id: {product_id}. Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update user features: {str(e)}"
        )