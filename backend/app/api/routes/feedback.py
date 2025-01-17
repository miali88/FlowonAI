# backend/app/api/routes/feedback.py

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class ResponseFeedback(BaseModel):
    thumbs_up: bool
    room_id: str

@router.post("/{response_id}")
async def handle_response_feedback(response_id: str, feedback: ResponseFeedback):
    try:
        # Here you would typically save the feedback to your database
        # For now, we'll just log it
        logger.info(f"Received feedback for response {response_id}: thumbs_up={feedback.thumbs_up}")
        
        # Return success response
        return JSONResponse(
            content={
                "status": "success",
                "message": "Feedback recorded successfully"
            },
            status_code=200
        )

    except Exception as e:
        logger.error(f"Error handling feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")