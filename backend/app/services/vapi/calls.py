from typing import Dict, Any, List, Optional
import logging
from app.clients.supabase_client import get_supabase
from app.services.vapi.helper import VapiEndOfCallReport

logger = logging.getLogger(__name__)
async def store_call_data(webhook_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Store summarized call data in Supabase.
    
    Args:
        webhook_data: The webhook payload containing VAPI call data
        
    Returns:
        Dict containing the stored call data, including user_id
    """
    try:
        logger.info("Processing call data for storage in vapi_calls table")
        
        # Create structured data object from webhook
        call_data = await VapiEndOfCallReport.from_webhook(webhook_data)
        
        # Convert to dictionary for storage
        data_dict = call_data.to_dict()
        
        # Get Supabase client
        supabase = await get_supabase()
        
        # Store in the vapi_calls table
        logger.info(f"Storing call data for call ID: {call_data.call_id}")
        result = await supabase.table("vapi_calls").insert(data_dict).execute()
        
        logger.info(f"Successfully stored call data for call ID: {call_data.call_id}, user ID: {call_data.user_id}")
        
        # Return the data for further processing
        return data_dict
    except Exception as e:
        logger.error(f"Error storing call data: {str(e)}")
        # Return None if there was an error
        return None

async def get_calls(user_id: Optional[str] = None, limit: int = 1000, offset: int = 0) -> List[Dict[str, Any]]:
    """
    Retrieve call logs from the vapi_calls table in Supabase.
    
    Args:
        user_id: Optional user ID to filter calls by
        limit: Maximum number of records to return (default: 1000)
        offset: Number of records to skip for pagination (default: 0)
        
    Returns:
        List of call log records with limited fields
    """
    try:
        logger.info(f"Retrieving call logs from vapi_calls table{' for user: ' + user_id if user_id else ''}")
        
        # Get Supabase client
        supabase = await get_supabase()
        
        # Define specific fields to fetch, excluding call_id, started_at, ended_at, phone_number, and cost
        fields = "id, created_at, type, summary, transcript, stereo_recording_url, recording_url, ended_reason, duration_seconds, duration_minutes, customer_number, user_id"
        
        # Start building the query with specific fields instead of "*"
        result = await supabase.table("vapi_calls").select(fields).eq("user_id", user_id).execute()
        
        # Extract the data from the result
        calls = result.data
        
        logger.info(f"Successfully retrieved {len(calls)} call logs with limited fields")
        
        return calls
    except Exception as e:
        logger.error(f"Error retrieving call logs: {str(e)}")
        # Return empty list if there was an error
        return []

async def get_call_by_id(call_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve a single call log by its ID from the vapi_calls table in Supabase.
    
    Args:
        call_id: The ID of the call to retrieve
        
    Returns:
        Dictionary containing the call data or None if not found
    """
    try:
        logger.info(f"Retrieving call log with ID: {call_id}")
        
        # Get Supabase client
        supabase = await get_supabase()
        
        # Query the vapi_calls table for the specific call ID
        result = await supabase.table("vapi_calls").select("*").eq("id", call_id).execute()
        
        # Check if any data was returned
        if len(result.data) > 0:
            logger.info(f"Successfully retrieved call log with ID: {call_id}")
            return result.data[0]
        else:
            logger.info(f"No call log found with ID: {call_id}")
            return None
        
    except Exception as e:
        logger.error(f"Error retrieving call log with ID {call_id}: {str(e)}")
        return None

async def delete_call(call_id: str) -> bool:
    """
    Delete a call log by its ID.
    
    Args:
        call_id: The ID of the call to delete
        
    Returns:
        True if the call was successfully deleted, False otherwise
    """
    try:
        logger.info(f"Deleting call log with ID: {call_id}")
        
        # Get Supabase client
        supabase = await get_supabase()
        
        # Execute the delete query
        result = await supabase.table("vapi_calls").delete().eq("id", call_id).execute()
        
        # Check if any rows were affected
        if len(result.data) > 0:
            logger.info(f"Successfully deleted call log with ID: {call_id}")
            return True
        else:
            logger.info(f"No call log found with ID: {call_id}")
            return False
        
    except Exception as e:
        logger.error(f"Error deleting call log with ID {call_id}: {str(e)}")
        return False

