from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import Response, JSONResponse

#from services.retellai.retellai import handle_form_webhook
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/onboarding_up")
async def onboarding_endpoint(request: Request):
    logger.info("Received new form")
    try:
        print('\n\n /onboarding_up')
        print(await request.json())
        # result = await handle_onboarding_endpoint(request)
        
        # # Check if result is already a JSONResponse
        # if isinstance(result, JSONResponse):
        #     return result
        # else:
        #     # If it's not a JSONResponse, wrap it in one
        #     return JSONResponse(content=result)
    except Exception as e:
        print(f"Error in webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
from enum import Enum

class ImageRatio(str, Enum):
    square = "1024x1024"
    landscape = "1024x768"
    portrait = "768x1024"