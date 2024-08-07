from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import Response, JSONResponse

from services.retellai.retellai import handle_form_webhook
import logging
import traceback

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/")
async def webhook(request: Request):
    logger.info("Received webhook request")
    try:
        print('\n\n /retell')
        result = await handle_form_webhook(request)
        
        # Check if result is already a JSONResponse
        if isinstance(result, JSONResponse):
            return result
        else:
            # If it's not a JSONResponse, wrap it in one
            return JSONResponse(content=result)
    except Exception as e:
        print(f"Error in webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))