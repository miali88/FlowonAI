from fastapi import APIRouter, Request, Depends

router = APIRouter()

"""
event types:

https://developers.hubspot.com/docs/guides/apps/public-apps/create-generic-webhook-subscriptions
"""
@router.post("/hubspot/webhook")
async def hubspot_webhook(request: Request):
    return {"message": "Hubspot webhook received"}