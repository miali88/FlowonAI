import os
import logging

from fastapi import Request, APIRouter, Header, HTTPException
from svix.webhooks import Webhook, WebhookVerificationError
from services.clerk import post_user, get_clerk_private_metadata

logger = logging.getLogger(__name__)

router = APIRouter()

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
        await post_user(request_data)
        
    elif event_type == "session.created":
        print("session created")
        # await post_session(payload)

    # Process the event as needed
    return {"status": "success"}


@router.get('/get-customer-id')
async def get_user_metadata(clerk_user_id: str):
    """Endpoint to fetch a user's Clerk private metadata."""
    print("get_user_metadata")
    try:
        metadata = await get_clerk_private_metadata(clerk_user_id)
        customer_id = metadata['stripe_customer_id']
        return {"customer_id": customer_id}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error fetching user metadata: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch user metadata: {str(e)}")