from fastapi import Request, HTTPException, APIRouter, Response
from fastapi.responses import JSONResponse
import json

from services.vapi.vapi import handle_vapi_webhook
from services.db.supabase_ops import supabase_ops

# twilio vapi endpoint to connect. 
#https://api.vapi.ai/twilio/inbound

router = APIRouter()

@router.api_route('/', methods=['POST', 'GET'])
async def webhook(request: Request):

    #try:
    print('\n\n /vapi')
    #data = await request.json()

    print("\n data received:", request)

    return "hi"
    
    # except Exception as e:
    #     print(f"Error in /vapi : {e}")
    #     raise HTTPException(status_code=500, detail=str(e))