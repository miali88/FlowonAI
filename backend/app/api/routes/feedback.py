# backend/app/api/routes/feedback.py

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/response-feedback/{response_id}")
async def handle_response_feedback(response_id: str, request: Request):
    try:
        # Get the request body
        data = await request.json()
        thumbs_up = data.get("thumbs_up")
        
        if thumbs_up is None:
            raise HTTPException(status_code=400, detail="Missing thumbs_up field in request body")

        # Here you would typically save the feedback to your database
        # For now, we'll just log it
        logger.info(f"Received feedback for response {response_id}: thumbs_up={thumbs_up}")
        
        # Return success response
        return JSONResponse(
            content={
                "status": "success",
                "message": "Feedback recorded successfully",
                "data": {
                    "response_id": response_id,
                    "thumbs_up": thumbs_up
                }
            },
            status_code=200
        )

    except Exception as e:
        logger.error(f"Error handling feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")