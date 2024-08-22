from fastapi import Request, HTTPException, APIRouter, Response
from fastapi.responses import JSONResponse
import json
import logging

from services.chat.chat import handle_chat_webhook
from services.db.supabase_ops import supabase_ops

router = APIRouter()

@router.api_route('/', methods=['POST', 'GET'])
async def webhook(request: Request) -> Response:
    try:
        logger = logging.getLogger(__name__)
        logger.info("Received request at /chat")
        response = await handle_chat_webhook(request)
        print("\n\n\nresponse...",response)
        return response
    except Exception as e:
        logger.error(f"Error in /chat: {str(e)}")
        return JSONResponse({"error": "An error occurred while processing your request"}, status_code=500)