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
        logger.debug("Request headers: %s", request.headers)
        body = await request.json()
        logger.debug("Request body: %s", body)
        
        result = await handle_form_webhook(request)
        logger.info("Webhook processed successfully")
        return JSONResponse(content=result)
    except Exception as e:
        logger.error("Error in webhook: %s", str(e))
        logger.error("Full traceback: %s", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))