from typing import Dict, Any, Optional
import math
import datetime
import logging
from fastapi import HTTPException

from app.clients.supabase_client import get_supabase

logger = logging.getLogger(__name__)

async def check_user_trial_status(user_id: str, current_user: str) -> Dict[str, Any]:
    """
    Check if a user has exceeded their trial limits
    
    Args:
        user_id: ID of the user to check
        current_user: ID of the current authenticated user
        
    Returns:
        Dict with trial status information
        
    Raises:
        HTTPException: If not authorized or user not found
    """
    # Ensure the current user is checking their own status
    if current_user != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this resource")
    
    supabase = await get_supabase()
    result = await supabase.table("users").select(
        "is_trial, trial_minutes_used, trial_minutes_total, trial_start_date, trial_end_date"
    ).eq("id", user_id).execute()
    
    if not result.data:
        logger.warning(f"User {user_id} not found")
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = result.data[0]
    is_trial = user_data.get("is_trial", False)
    
    if not is_trial:
        return {
            "is_trial": False,
            "message": "User is not on trial"
        }
    
    # Check trial expiration
    trial_end_date = user_data.get("trial_end_date")
    if trial_end_date:
        trial_end = datetime.datetime.fromisoformat(trial_end_date.replace('Z', '+00:00'))
        now = datetime.datetime.now(datetime.timezone.utc)
        
        if now > trial_end:
            return {
                "is_trial": True,
                "trial_expired": True,
                "message": "Trial period has expired"
            }
    
    # Check minutes usage
    trial_minutes_used = user_data.get("trial_minutes_used", 0)
    trial_minutes_total = user_data.get("trial_minutes_total", 25)
    
    minutes_exceeded = trial_minutes_used >= trial_minutes_total
    
    # Calculate remaining days in trial
    trial_start_date = user_data.get("trial_start_date")
    remaining_days = None
    
    if trial_start_date and trial_end_date:
        trial_start = datetime.datetime.fromisoformat(trial_start_date.replace('Z', '+00:00'))
        trial_end = datetime.datetime.fromisoformat(trial_end_date.replace('Z', '+00:00'))
        now = datetime.datetime.now(datetime.timezone.utc)
        
        trial_total_days = (trial_end - trial_start).days
        days_elapsed = (now - trial_start).days
        remaining_days = max(0, trial_total_days - days_elapsed)
    
    return {
        "is_trial": True,
        "minutes_used": trial_minutes_used,
        "minutes_total": trial_minutes_total,
        "minutes_exceeded": minutes_exceeded,
        "remaining_days": remaining_days,
        "trial_end_date": trial_end_date
    } 