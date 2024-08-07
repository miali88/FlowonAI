from fastapi import Request, HTTPException, APIRouter, Response
from fastapi.responses import JSONResponse
import json

from services.vapi.vapi import handle_vapi_webhook
from services.db.supabase_ops import supabase_ops

# twilio vapi endpoint to connect. 
#https://api.vapi.ai/twilio/inbound

router = APIRouter()

@router.api_route('/', methods=['POST', 'GET'])
async def webhook(request: Request) -> Response:
    try:
        print('\n\n /vapi')
        await handle_vapi_webhook(request)            
        return Response(status_code=200)
    except Exception as e:
        print(f"Error in /vapi : {e}")
        raise HTTPException(status_code=500, detail=str(e))