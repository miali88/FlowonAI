from fastapi import APIRouter, Request, HTTPException, Response

router = APIRouter()

@router.get("/")
async def verify_webhook(request: Request):
    """
    Validates the webhook when a GET request is made. This is often required by
    third-party services (like Facebook or WhatsApp) to verify the endpoint.
    """
    hub_mode = request.query_params.get("hub.mode")
    hub_challenge = request.query_params.get("hub.challenge")
    hub_verify_token = request.query_params.get("hub.verify_token")
    
    # Replace 'test_token' with your actual verify token.
    if hub_mode == "subscribe" and hub_verify_token == "test_token":
        # Return a plain text response with the hub.challenge value.
        return Response(content=hub_challenge, media_type="text/plain", status_code=200)
    
    raise HTTPException(status_code=403, detail="Verification failed")

@router.post("/webhook")
async def send_message(request: Request):
    print(await request.json())
    return {"message": "ok"}