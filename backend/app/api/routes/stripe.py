from pydantic import BaseModel
from typing import Optional
import os 
from dotenv import load_dotenv
import logging

import stripe
from fastapi import APIRouter, HTTPException, Request, Header, Depends

from app.services.stripe.services import create_payment_link, handle_subscription_completed, payment_result, create_subscription_link, SubscriptionLinkRequest
from app.core.auth import get_current_user
load_dotenv()
router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PaymentLinkRequest(BaseModel):
    product_id: str = "prod_Ryi6M9XhsSdInn" #"prod_RcfvpRgzSUvVXj" # live product id
    quantity: int = 1
    unit_amount: int 
    currency: Optional[str] = "usd"
    customer_id: str
    twilio_number: str

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

""" TODO: COMPARE THIS ENDPOINT WITH THAT OF BELOW. Simply need to identiy the newly purchase number
and invoke the twilio number purchase function, update user's database with the number.

 """
@router.post("/webhook")
async def webhook(request: Request, stripe_signature: str = Header(None, alias="Stripe-Signature")):
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    logger.info("Stripe webhook event received")
    logger.info(f"Stripe-Signature header present: {bool(stripe_signature)}")
    try:
        payload = await request.body()
        logger.debug(f"Received payload size: {len(payload)} bytes")
        
        if not stripe_signature or not endpoint_secret:
            logger.error("Missing Stripe signature or endpoint secret")
            raise HTTPException(status_code=400, detail="Invalid configuration")
            
        try:
            logger.debug("Attempting to verify Stripe webhook signature...")
            event = stripe.Webhook.construct_event(
                payload,
                stripe_signature,
                endpoint_secret
            )
            logger.info("Stripe webhook signature successfully verified")
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Signature verification failed: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        logger.info(f"Received Stripe event type: {event.type}")
        
        if event.type == 'checkout.session.completed':
            session = event.data.object
            # Add detailed logging of the session metadata
            logger.info(f"Session metadata received: {session.metadata}")
            logger.info(f"Session mode: {session.mode}")
            
            if session.mode == 'subscription':
                logger.info("Processing subscription completion")
                await handle_subscription_completed(session)
                logger.info("Subscription processing completed successfully")
                
        elif event.type == 'payment_intent.succeeded':
            payment_intent = event.data.object
            logger.info(f"Payment succeeded for payment_intent_id: {payment_intent.id}")
        else:
            logger.info(f"Unhandled Stripe event type: {event.type}, no action taken")
            
        logger.info("Stripe webhook processing completed")
        logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        return {"status": "success"}
        
    except ValueError as e:
        logger.error(f"ValueError in webhook: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Invalid payload: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in webhook: {str(e)}", exc_info=True)
        logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        raise HTTPException(status_code=400, detail=str(e))
    

""" Abdul to create the payment result frontend component which requests data from this endpoint """
@router.post("/payment-result")
async def payment_result_handler(checkout_session_id: str):
    logger.info(f"Payment result for checkout_session_id: {checkout_session_id}")
    checkout_result = await payment_result(checkout_session_id)

    return checkout_result

# @router.post("/create-subscription-link")
# async def create_subscription_link_handler(
#     request: SubscriptionLinkRequest,
#     current_user: str = Depends(get_current_user)
# ):
#     logger.info("Received request to create subscription link")
#     try:
#         if not current_user:
#             raise HTTPException(status_code=401, detail="Authorization header is required")
            
#         logger.info(f"Creating subscription link for user: {current_user}")
#         payment_link = await create_subscription_link(request, current_user)
#         logger.info("Successfully created subscription link")
#         return {"payment_link": payment_link}
#     except Exception as e:
#         logger.error(f"Error creating subscription link: {str(e)}", exc_info=True)
#         raise HTTPException(status_code=400, detail=str(e))
