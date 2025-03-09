import os 
from fastapi import HTTPException
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import logging

import stripe

from app.clients.supabase_client import get_supabase
from app.services.livekit.inbound_trunk import number_purchased

""" TODO: create the twilio number purchase function, also add new numb metadata """

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
                'twilio_number': request.twilio_number,
            } if request.customer_id else {}
        )

        return payment_link.url
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))    


async def add_new_number_to_db(
    customer_id: str,
    product_id: str,
    quantity: int,
    twilio_number: str,
    unit_amount: int,
    currency: str
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
        supabase = await get_supabase()
        response = await supabase.table('users').select('id').eq('stripe_customer_id', customer_id).execute()
        
        if not response.data or len(response.data) == 0:
            logger.error(f"No user found for customer_id: {customer_id}")
            raise HTTPException(status_code=404, detail=f"User not found for customer_id: {customer_id}")
            
        clerk_user_id = response.data[0]['id']
        logger.debug(f"Found clerk_user_id: {clerk_user_id}")
        
        response = await supabase.table("twilio_numbers").insert({
            "phone_number": twilio_number,
            "status": "available",
            "owner_user_id": clerk_user_id,
            "user_paid_cost": unit_amount,
            "currency": currency
        }).execute()


    except Exception as e:
        logger.error(f"Error updating user features for customer_id: {customer_id}, product_id: {product_id}. Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update user features: {str(e)}"
        )
    
    
async def payment_result(session_id: str):
    try:
        checkout_session = stripe.checkout.Session.retrieve(session_id)
        if checkout_session.status == "complete":
        
            session = stripe.checkout.Session.retrieve(session_id)

            # Get the payment intent ID
            payment_intent_id = session.payment_intent

            # If you need the payment details, you can retrieve the PaymentIntent
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)


            return {"status": "success"}

        else:
            return {"status": "failure"}
    except Exception as e:
        logger.error(f"Error getting payment result for session_id: {session_id}. Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get payment result: {str(e)}")
    
    
async def handle_subscription_completed(session):
    """
    Handles the checkout.session.completed event for subscriptions.
    
    Args:
        session: The Stripe session object from the webhook
    """
    customer_id = session.metadata.get('customer_id')
    logger.info(f"Processing checkout.session.completed for customer_id: {customer_id}")
    
    if not customer_id:
        logger.error("Missing customer_id in session metadata")
        raise HTTPException(status_code=400, detail="Missing customer_id in session metadata")

    # Retrieve subscription with expanded price data
    subscription = stripe.Subscription.retrieve(
        session.subscription,
        expand=['items.data.price.product']
    )
    
    # Access the first subscription item
    subscription_item = subscription['items']['data'][0]
    quantity = subscription_item['quantity']
    unit_amount = subscription_item['plan']['amount']
    currency = subscription_item['plan']['currency']

    product_id = session.metadata.get('product_id')
    twilio_number = session.metadata.get('twilio_number')
    if not twilio_number:
        logger.error("Missing twilio_number in session metadata")
        raise HTTPException(status_code=400, detail="Missing twilio_number in session metadata")

    logger.info(f"Updating user features - customer_id: {customer_id}, product_id: {product_id}, quantity: {quantity}")
    await add_new_number_to_db(
        customer_id=customer_id,
        product_id=product_id,
        quantity=quantity,
        twilio_number=twilio_number,
        unit_amount=unit_amount,
        currency=currency
    )   
    logger.info(f"Successfully updated user features for customer_id: {customer_id}")

    # await 

