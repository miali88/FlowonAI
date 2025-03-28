from typing import Dict, Any
import datetime
from app.core.logging_setup import logger
from fastapi import HTTPException
import math

from app.clients.supabase_client import get_supabase

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
        "is_trial, trial_minutes_used, trial_minutes_total, trial_start_date, trial_end_date, total_call_time"
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
    
    # Get total call time (in seconds) and convert to minutes
    total_call_time_seconds = user_data.get("total_call_time", 0)
    
    # Handle None values
    if total_call_time_seconds is None:
        total_call_time_seconds = 0
        logger.info(f"Found NULL value for total_call_time for user {user_id}, defaulting to 0")
    
    # Convert seconds to minutes (round up to nearest minute)
    total_call_time_minutes = math.ceil(total_call_time_seconds / 60)
    logger.info(f"User {user_id} call time: {total_call_time_seconds} seconds ({total_call_time_minutes} minutes)")
    
    # Update user's trial minutes based on call time
    trial_minutes_used = total_call_time_minutes
    trial_minutes_total = user_data.get("trial_minutes_total", 25)
    
    # Update the database with the calculated minutes
    try:
        await supabase.table("users").update({
            "trial_minutes_used": trial_minutes_used
        }).eq("id", user_id).execute()
        logger.info(f"Updated trial_minutes_used for user {user_id} to {trial_minutes_used} based on call time")
    except Exception as e:
        logger.error(f"Error updating trial_minutes_used: {str(e)}")
    
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
    
    # Calculate remaining minutes
    remaining_minutes = max(0, trial_minutes_total - trial_minutes_used)
    
    # Calculate percentage used
    percentage_used = (trial_minutes_used / trial_minutes_total * 100) if trial_minutes_total > 0 else 100
    percentage_used = min(100, percentage_used)  # Cap at 100%
    
    logger.info(f"User {user_id} trial status: {remaining_minutes}/{trial_minutes_total} minutes remaining, {remaining_days} days left")
    
    return {
        "is_trial": True,
        "minutes_used": trial_minutes_used,
        "minutes_total": trial_minutes_total,
        "minutes_remaining": remaining_minutes,
        "minutes_exceeded": minutes_exceeded,
        "percentage_used": round(percentage_used, 1),
        "remaining_days": remaining_days,
        "trial_end_date": trial_end_date
    } 

async def update_user_minutes(user_id: str, duration_seconds: int) -> Dict[str, Any]:
    """
    Update usage statistics for a user after a call is completed.
    Handles both trial and non-trial users accordingly.
    
    Args:
        user_id: ID of the user to update
        duration_seconds: Duration of the call in seconds (rounded)
        
    Returns:
        Dict with success status and updated usage information
    """
    logger.info(f"Updating usage for user {user_id}, adding {duration_seconds} seconds")
    
    supabase = await get_supabase()
    
    # Check if user exists
    user_result = await supabase.table("users").select(
        "is_trial, trial_minutes_used, trial_minutes_total, total_call_time, call_count, user_plan"
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
        # Convert seconds to minutes for trial tracking (maintain existing structure)
        duration_minutes = math.ceil(duration_seconds / 60)
        
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
        # Get current total time in seconds - now as native integer
        current_total = user_data.get("total_call_time", 0)
        
        # Handle None values
        if current_total is None:
            current_total = 0
            logger.info(f"Found NULL value for total_call_time, defaulting to 0")
        
        # Direct integer arithmetic - no need for string conversion
        new_total = current_total + duration_seconds
        
        # Update the value
        update_data["total_call_time"] = new_total
        
        logger.info(f"Updated total call time for user {user_id}: {current_total} -> {new_total} seconds")
        
        response_data.update({
            "total_call_time": new_total
        })
        
        # Also increment call count
        call_count = user_data.get("call_count", 0)
        if call_count is None:
            call_count = 0
        
        new_call_count = call_count + 1
        update_data["call_count"] = new_call_count
        
        logger.info(f"Updated call count for user {user_id}: {call_count} -> {new_call_count}")
        
        response_data.update({
            "call_count": new_call_count
        })
        
    except Exception as e:
        logger.error(f"Error updating call statistics: {str(e)}")
    
    # Apply updates to the database
    if update_data:
        await supabase.table("users").update(update_data).eq("id", user_id).execute()
    
    return response_data 

async def update_call_duration(call_data: Dict[str, Any], source: str = "unknown") -> Dict[str, Any]:
    """
    Update user's call usage metrics based on call duration.
    This function can be called from different sources (Twilio, VAPI, etc.).
    
    Args:
        call_data: Dictionary containing call information:
            - duration_seconds: Duration of the call in seconds
            - user_id: ID of the user who made/received the call
        source: Source of the call data (e.g., "twilio", "vapi")
        
    Returns:
        Dict with success status and updated usage information
    """
    logger.info(f"Processing call duration update from {source}")
    
    try:
        # Extract required data
        duration_seconds = call_data.get("duration_seconds")
        user_id = call_data.get("user_id")
        
        if not user_id:
            logger.warning(f"Missing user_id in call data")
            return {"success": False, "message": "Missing user_id in call data"}
        
        # Handle missing or None duration
        if duration_seconds is None or duration_seconds == "":
            logger.warning(f"Missing or null duration_seconds, defaulting to 60 seconds")
            duration_seconds = 60  # Default to 60 seconds
        
        # Round the duration to the nearest second
        try:
            duration_seconds_rounded = round(float(duration_seconds))
            logger.info(f"Call duration: {duration_seconds}s rounded to {duration_seconds_rounded}s")
        except (ValueError, TypeError) as e:
            logger.warning(f"Could not convert duration '{duration_seconds}' to float: {str(e)}, defaulting to 60 seconds")
            duration_seconds_rounded = 60
        
        # Update user time in seconds
        result = await update_user_minutes(user_id, duration_seconds_rounded)
        logger.info(f"Updated user {user_id} call statistics: {result}")
        
        return {
            "success": True,
            "message": f"Call duration updated from {source}",
            "user_id": user_id,
            "duration_seconds": duration_seconds_rounded,
            "details": result
        }
        
    except Exception as e:
        logger.error(f"Error updating call duration: {str(e)}")
        return {"success": False, "message": f"Error: {str(e)}"} 