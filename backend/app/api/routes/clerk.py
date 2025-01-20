from fastapi import Request, APIRouter, Header, HTTPException
from svix.webhooks import Webhook, WebhookVerificationError
import os

import logging
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post('/')
async def handle_clerk_event(
    request: Request, svix_id: str = Header(None),
    svix_timestamp: str = Header(None), svix_signature: str = Header(None)
) -> dict:
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
        # await post_user(request_data)

    elif event_type == "session.created":
        print("session created")
        # await post_session(payload)

    # Process the event as needed
    return {"status": "success"}


# async def post_user(payload):
#     user_data = payload.get('data', {})
#     user_id = user_data.get('id')
#     first_name = user_data.get('first_name')
#     last_name = user_data.get('last_name')
#     email_addresses = user_data.get('email_addresses', [])
#     primary_email_address_id = user_data.get('primary_email_address_id')

#     print("\n\npost_user function called with user_id:", user_id)

#     try:
#         # Find the primary email address
#         primary_email = next(
#              (email['email_address']
#              for email in email_addresses
#              if email['id'] == primary_email_address_id),
#             None
#         )

#         # Convert timestamps from milliseconds to ISO format strings
#         created_at = (
#             datetime.fromtimestamp(user_data.get('created_at') / 1000).isoformat()
#             if user_data.get('created_at')
#         )
#         last_sign_in_at = (
#            datetime.fromtimestamp(user_data.get('last_sign_in_at') / 1000).isoformat()
#             if user_data.get('last_sign_in_at')
#         )
#         updated_at = (
#            datetime.fromtimestamp(user_data.get('updated_at') / 1000).isoformat()
#            if user_data.get('updated_at')
#            else None
#         )
#         data, count = supabase.table('users_data').insert({
#             'user_id': user_id,
#             'first_name': first_name,
#             'last_name': last_name,
#             'email': primary_email,
#             'created_at': created_at,
#             'last_sign_in_at': last_sign_in_at,
#             'image_url': user_data.get('image_url'),
#             'object': user_data.get('object'),
#             'updated_at': updated_at
#         }).execute()

#         print(f"User data saved successfully. Affected rows: {count}")
#         return data
#     except Exception as e:
#         print(f"Error saving user data to database: {str(e)}")
#         return None
