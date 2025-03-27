import os
from app.core.logging_setup import logger

from fastapi import Request, APIRouter, Header, HTTPException, Depends
from svix.webhooks import Webhook, WebhookVerificationError

from app.services.clerk import post_user, get_clerk_private_metadata
from app.models.users import UserMetadataResponse
from app.core.auth import get_current_user

router = APIRouter()

@router.post('')
async def handle_clerk_event(request: Request, svix_id: str = Header(None), \
                             svix_timestamp: str = Header(None), svix_signature: str = Header(None)):
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    logger.info("Clerk webhook event received")
    logger.info(f"Headers: svix_id={svix_id}, svix_timestamp={svix_timestamp}, signature_present={bool(svix_signature)}")

    # Validate the webhook
    payload = await request.body()
    logger.debug(f"Received payload size: {len(payload)} bytes")
    
    headers = {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature
    }
    
    secret = os.getenv("CLERK_SIGNING_SECRET")
    if not secret:
        logger.error("CLERK_SIGNING_SECRET environment variable not set")
        raise HTTPException(status_code=500, detail="CLERK_SIGNING_SECRET not set")
    logger.debug("CLERK_SIGNING_SECRET found in environment")

    webhook = Webhook(secret)

    try:
        logger.debug("Attempting to verify webhook signature...")
        event = webhook.verify(payload, headers)
        logger.info("Webhook signature successfully verified")
    except WebhookVerificationError as e:
        logger.error(f"Webhook verification failed: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    event_type = event.get('type')
    logger.info(f"Received event type: {event_type}")

    # Check if this is a test webhook
    is_test_event = event.get('data', {}).get('webhook_test')
    if is_test_event:
        logger.info("Detected test webhook event")
        user_id = event.get('data', {}).get('id')
        if user_id:
            logger.info(f"Detected test webhook event with user_id: {user_id}")
        return {"status": "success", "is_test": True}
    
    # Process the webhook based on event type
    if event_type == 'user.created':
        logger.info("Processing user.created event")
        user_id = event.get('data', {}).get('id')
        logger.info(f"User ID from event: {user_id}")
        
        # Check if this is a test webhook
        is_test_webhook = event.get('data', {}).get('webhook_test', False)
        logger.info(f"Processing user.created event, is_test_event: {is_test_webhook}")
        
        try:
            # Process the user creation
            await post_user(event)
            logger.info(f"Successfully processed user creation for {user_id}")
            return {"status": "success"}
        except Exception as e:
            logger.error(f"Error processing user.created event: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")
    else:
        logger.info(f"Unhandled event type: {event_type}, no action taken")
        return {"status": "success", "message": f"Unhandled event type: {event_type}"}
    
@router.get('/get-customer-id')
async def get_user_metadata(current_user: str = Depends(get_current_user)):
    """Endpoint to fetch a user's Clerk private metadata."""
    logger.info(f"Fetching customer ID for clerk_user_id: {current_user}")
    try:
        metadata = await get_clerk_private_metadata(current_user)
        customer_id = metadata.get('stripe_customer_id')
        logger.info(f"Retrieved customer_id: {customer_id} for clerk_user_id: {current_user}")
        return UserMetadataResponse(customer_id=customer_id)
    except HTTPException as he:
        logger.error(f"HTTP Exception while fetching user metadata: {str(he)}")
        raise he
    except Exception as e:
        logger.error(f"Error fetching user metadata: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch user metadata: {str(e)}")
    
    