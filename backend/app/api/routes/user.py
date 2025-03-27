from app.core.logging_setup import logger

from fastapi import HTTPException, Depends, APIRouter

from app.services.user.usage import check_user_trial_status
from app.core.auth import get_current_user

router = APIRouter()

@router.get("/check_trial_status")
async def check_trial_status(current_user: str = Depends(get_current_user)):
    """Check if a user has exceeded their trial limits"""
    try:
        # Use the current authenticated user's ID directly
        user_id = current_user
        logger.info(f"Checking trial status for authenticated user: {user_id}")
        return await check_user_trial_status(user_id=user_id, current_user=user_id)
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error checking trial status: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error checking trial status: {str(e)}")
