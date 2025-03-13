from typing import Dict, Any
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

async def update_user_minutes(user_id: str, duration_minutes: int) -> Dict[str, Any]:
    """
    Update minutes for a user after a call is completed.
    Handles both trial and non-trial users accordingly.
    
    Args:
        user_id: ID of the user to update
        duration_minutes: Duration of the call in minutes
        
    Returns:
        Dict with success status and updated usage information
    """
    logger.info(f"Updating minutes for user {user_id}, adding {duration_minutes} minutes")
    
    supabase = await get_supabase()
    
    # Check if user exists
    user_result = await supabase.table("users").select(
        "is_trial, trial_minutes_used, trial_minutes_total, total_call_time, user_plan"
    ).eq("id", user_id).execute()
    
    if not user_result.data:
        logger.warning(f"User {user_id} not found")
        return {"success": False, "message": "User not found"}
    
    user_data = user_result.data[0]
    is_trial = user_data.get("is_trial", False)
    
    update_data = {}
    response_data = {"success": True}
    
    # Handle trial users
    if is_trial:
        # Update trial minutes used
        trial_minutes_used = user_data.get("trial_minutes_used", 0) + duration_minutes
        trial_minutes_total = user_data.get("trial_minutes_total", 25)
        
        logger.info(f"Updating trial minutes for user {user_id}: {trial_minutes_used}/{trial_minutes_total}")
        
        update_data["trial_minutes_used"] = trial_minutes_used
        
        # Log milestone reached if applicable (50%, 80%, 100%)
        percentage_used = (trial_minutes_used / trial_minutes_total) * 100
        if percentage_used >= 80 and (percentage_used - duration_minutes / trial_minutes_total * 100) < 80:
            logger.info(f"User {user_id} has reached 80% of trial minutes")
            # TODO: Send notification about reaching 80% of trial minutes
        elif percentage_used >= 50 and (percentage_used - duration_minutes / trial_minutes_total * 100) < 50:
            logger.info(f"User {user_id} has reached 50% of trial minutes")
            # TODO: Send notification about reaching 50% of trial minutes
        
        if trial_minutes_used >= trial_minutes_total:
            logger.info(f"User {user_id} has exhausted trial minutes")
            # TODO: Send notification about trial minutes exhausted
        
        response_data.update({
            "message": "Trial minutes updated successfully",
            "minutes_used": trial_minutes_used,
            "minutes_total": trial_minutes_total,
            "percentage_used": percentage_used
        })
    
    # Always update total_call_time for all users (trial and non-trial)
    try:
        # Get current total time
        current_total = user_data.get("total_call_time", "0")
        # Convert to int (assuming it's stored as seconds or minutes)
        try:
            # First try parsing as integer seconds
            total_minutes = int(current_total)
        except ValueError:
            # If it contains formatting like "HH:MM:SS", extract just the numeric part or use 0
            logger.warning(f"Could not parse total_call_time '{current_total}' as integer, defaulting to 0")
            total_minutes = 0
        
        # Add the current duration
        new_total = total_minutes + duration_minutes
        
        # Update the value
        update_data["total_call_time"] = str(new_total)
        
        logger.info(f"Updated total call time for user {user_id}: {current_total} -> {new_total} minutes")
        
        response_data.update({
            "total_call_time": new_total
        })
        
    except Exception as e:
        logger.error(f"Error updating total_call_time: {str(e)}")
    
    # Apply updates to the database
    if update_data:
        await supabase.table("users").update(update_data).eq("id", user_id).execute()
    
    return response_data 