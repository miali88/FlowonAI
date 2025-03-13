import logging

from fastapi import HTTPException, Depends, APIRouter

from app.services.user.usage import check_user_trial_status
from app.core.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()
@router.get("/check_trial_status/{user_id}")
async def check_trial_status(user_id: str, current_user: str = Depends(get_current_user)):
    """Check if a user has exceeded their trial limits"""
    try:
        return await check_user_trial_status(user_id=user_id, current_user=current_user)
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error checking trial status: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error checking trial status: {str(e)}")
