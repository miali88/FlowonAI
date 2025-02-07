from pydantic import BaseModel
from typing import Optional
import os 
from dotenv import load_dotenv
import logging


import stripe
from fastapi import APIRouter, HTTPException, Request, Header

from services.stripe_services import create_payment_link, update_user_features

load_dotenv()
router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PaymentLinkRequest(BaseModel):
    product_id: str = "prod_RcfvpRgzSUvVXj"
    quantity: int = 1
    unit_amount: int 
    currency: Optional[str] = "usd"
    customer_id: str

endpoint_secret = os.getenv("STRIPE_SIGNING_SECRET")

@router.post("/create-payment-link")
async def create_payment_link_handler(request: PaymentLinkRequest):
    logger.info(f"Creating payment link for customer_id: {request.customer_id}")
    try:
        payment_link = await create_payment_link(request)
        logger.info(f"Successfully created payment link for customer_id: {request.customer_id}")
        return {"payment_link": payment_link}
    except Exception as e:
        logger.error(f"Error creating payment link: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def webhook(request: Request, stripe_signature: str = Header(None, alias="Stripe-Signature")):
    try:
        payload = await request.body()
        
        if not stripe_signature or not endpoint_secret:
            logger.error("Missing Stripe signature or endpoint secret")
            raise HTTPException(status_code=400, detail="Invalid configuration")
            
        try:
            event = stripe.Webhook.construct_event(
                payload,
                stripe_signature,
                endpoint_secret
            )
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Signature verification failed: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        if event.type == 'checkout.session.completed':
            session = event.data.object
            customer_id = session.metadata.get('customer_id')
            logger.info(f"Processing checkout.session.completed for customer_id: {customer_id}")
            
            if customer_id and session.mode == 'subscription':
                # Retrieve subscription to get product details
                subscription = stripe.Subscription.retrieve(session.subscription)
                product_id = subscription.items.data[0].price.product
                quantity = subscription.items.data[0].quantity
                
                logger.info(f"Updating user features - customer_id: {customer_id}, product_id: {product_id}, quantity: {quantity}")
                await update_user_features(
                    customer_id=customer_id,
                    product_id=product_id,
                    quantity=quantity
                )
                logger.info(f"Successfully updated user features for customer_id: {customer_id}")
                
        elif event.type == 'payment_intent.succeeded':
            payment_intent = event.data.object
            logger.info(f"Payment succeeded for payment_intent_id: {payment_intent.id}")
            
        return {"status": "success"}
        
    except ValueError as e:
        logger.error(f"ValueError in webhook: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Invalid payload: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in webhook: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))
    

@router.post("/payment-result")
async def payment_result(checkout_session_id: str):
    logger.info(f"Payment result for checkout_session_id: {checkout_session_id}")
    return {"status": "success"}