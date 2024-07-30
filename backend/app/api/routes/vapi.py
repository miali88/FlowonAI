from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import Response, JSONResponse

from services.vapi import handle_vapi_webhook

# twilio vapi endpoint to connect. 
#https://api.vapi.ai/twilio/inbound

router = APIRouter()

@router.api_route('/', methods=['POST', 'GET'])
async def webhook(request: Request) -> JSONResponse:
    try:
        print('\n\n /vapi')
        return await handle_vapi_webhook(request)
    except Exception as e:
        print(f"Error in / : {e}")
        raise HTTPException(status_code=500, detail=str(e))