import logging
from typing import Dict, Any, Tuple, Optional
from datetime import datetime

from app.clients.supabase_client import get_supabase
from app.models.guided_setup import QuickSetupData

async def check_user_exists(user_id: str) -> bool:
    """Check if a user exists in the users table."""
    try:
        supabase = await get_supabase()
        result = await supabase.table("users").select("id").eq("id", user_id).execute()
        return result.data and len(result.data) > 0
    except Exception as e:
        logging.error(f"Error checking if user exists: {str(e)}")
        return False

async def save_guided_setup(user_id: str, quick_setup_data: QuickSetupData) -> Tuple[bool, Dict[str, Any], Optional[str]]:
    """
    Save the guided setup data to Supabase.
    
    Args:
        user_id: The ID of the user
        quick_setup_data: The QuickSetupData Pydantic model
        
    Returns:
        Tuple of (success, data_dict, error_message)
    """
    # First check if the user exists
    user_exists = await check_user_exists(user_id)
    
    if not user_exists:
        error_message = f"User with ID {user_id} does not exist in the users table"
        logging.error(error_message)
        # Continue anyway, since we want to allow setup creation even if user record doesn't exist yet
        logging.warning(f"Proceeding with guided setup creation despite missing user record")
    
    # Check if the user already has setup data
    existing_setup = await get_guided_setup(user_id)
    
    # Convert Pydantic models to dictionaries for JSONB columns
    setup_data = {
        "user_id": user_id,
        "training_sources": quick_setup_data.trainingSources.model_dump(),
        "business_information": quick_setup_data.businessInformation.model_dump(),
        "message_taking": quick_setup_data.messageTaking.model_dump(),
        "call_notifications": quick_setup_data.callNotifications.model_dump(),
        "agent_language": quick_setup_data.agentLanguage,
    }
    
    # If record exists, preserve the setup_completed value and agent_id
    # If it's a new record, set setup_completed to False by default
    if existing_setup:
        # Preserve the existing setup_completed status 
        setup_data["setup_completed"] = existing_setup.get("setup_completed", False)
        
        # Preserve the existing agent_id if it exists
        if "agent_id" in existing_setup and existing_setup["agent_id"]:
            setup_data["agent_id"] = existing_setup["agent_id"]
            logging.info(f"Preserving existing agent_id: {existing_setup['agent_id']} for user {user_id}")
        else:
            logging.info(f"No agent_id to preserve for user {user_id}")
            
        logging.info(f"Updating existing guided setup data for user {user_id}")
    else:
        # New record, not completed yet
        setup_data["setup_completed"] = False
        logging.info(f"Creating new guided setup data for user {user_id}")
    
    # Update or insert the record
    supabase = await get_supabase()
    try:
        if existing_setup:
            # Update existing record
            result = await supabase.table("guided_setup").update(setup_data).eq("user_id", user_id).execute()
            if hasattr(result, 'error') and result.error:
                error_message = f"Database error updating guided setup: {result.error}"
                logging.error(error_message)
                return False, {}, error_message
            logging.info(f"Successfully updated guided setup data for user {user_id}")
        else:
            # Insert new record
            result = await supabase.table("guided_setup").insert(setup_data).execute()
            if hasattr(result, 'error') and result.error:
                error_message = f"Database error inserting guided setup: {result.error}"
                logging.error(error_message)
                return False, {}, error_message
            logging.info(f"Successfully created guided setup data for user {user_id}")
        
    except Exception as e:
        error_message = f"Exception during guided setup save: {str(e)}"
        logging.error(error_message)
        return False, {}, error_message
    
    # Verify the data was saved correctly
    updated_setup = await get_guided_setup(user_id)
    if updated_setup:
        # Check if agent_id was preserved
        if "agent_id" in setup_data and setup_data["agent_id"]:
            if updated_setup.get("agent_id") == setup_data["agent_id"]:
                logging.info(f"Verified agent_id was correctly preserved: {setup_data['agent_id']}")
            else:
                logging.warning(f"agent_id was not correctly preserved. Expected: {setup_data['agent_id']}, Got: {updated_setup.get('agent_id')}")
        return True, setup_data, None
    else:
        error_message = f"Failed to verify guided setup data save for user {user_id}"
        logging.error(error_message)
        return False, {}, error_message

async def get_guided_setup(user_id: str):
    """Retrieve the guided setup data for a user from Supabase."""
    supabase = await get_supabase()
    
    # Query the guided_setup table for the user's data
    result = await supabase.table("guided_setup").select("*").eq("user_id", user_id).execute()
    
    if result.data and len(result.data) > 0:
        logging.info(f"Retrieved guided setup data for user {user_id}")
        return result.data[0]
    
    logging.info(f"No guided setup data found for user {user_id}")
    return None

async def has_completed_setup(user_id: str) -> bool:
    """Check if a user has completed the guided setup."""
    setup = await get_guided_setup(user_id)
    
    if not setup:
        return False
    
    return setup.get("setup_completed", False)

async def update_guided_setup_agent_id(user_id: str, agent_id: str) -> bool:
    """Update the agent_id for a user's guided setup."""
    supabase = await get_supabase()
    
    try:
        # Update the agent_id field
        result = await supabase.table("guided_setup").update({"agent_id": agent_id}).eq("user_id", user_id).execute()
        
        if hasattr(result, 'error') and result.error:
            logging.error(f"Error updating agent_id for user {user_id}: {result.error}")
            return False
            
        logging.info(f"Successfully updated agent_id to {agent_id} for user {user_id}")
        return True
    except Exception as e:
        logging.error(f"Exception updating agent_id for user {user_id}: {str(e)}")
        return False

async def mark_setup_complete(user_id: str) -> Dict[str, Any]:
    """Mark the guided setup as complete for a user."""
    supabase = await get_supabase()
    
    try:
        # Mark setup as completed
        result = await supabase.table("guided_setup").update({"setup_completed": True}).eq("user_id", user_id).execute()
        
        if hasattr(result, 'error') and result.error:
            logging.error(f"Error marking setup complete for user {user_id}: {result.error}")
            return {"success": False, "error": str(result.error)}
            
        logging.info(f"Successfully marked setup as complete for user {user_id}")
        return {"success": True}
    except Exception as e:
        logging.error(f"Exception marking setup complete for user {user_id}: {str(e)}")
        return {"success": False, "error": str(e)}

async def get_formatted_setup_data(user_id: str) -> Dict[str, Any]:
    """Get the formatted setup data for a user."""
    setup_data = await get_guided_setup(user_id)
    
    if not setup_data:
        return {"success": False, "error": "No setup data found for user"}
    
    # Convert snake_case to camelCase for frontend compatibility
    formatted_data = {
        "trainingSources": setup_data.get("training_sources", {}),
        "businessInformation": setup_data.get("business_information", {}),
        "messageTaking": setup_data.get("message_taking", {}),
        "callNotifications": setup_data.get("call_notifications", {})
    }
    
    # Format and return the setup data
    return {
        "success": True,
        "setupData": formatted_data,
        "setupCompleted": setup_data.get("setup_completed", False)
    }

async def get_rosie_phone_number(user_id: str) -> Dict[str, Any]:
    """Get the Rosie phone number for a user."""
    setup_data = await get_guided_setup(user_id)
    
    if not setup_data:
        return {"success": False, "error": "No setup data found for user"}
    
    phone_number = setup_data.get("phone_number", "")
    
    return {
        "success": True,
        "phone_number": phone_number
    }

async def diagnose_and_repair_database_issues(user_id: str) -> Dict[str, Any]:
    """
    Diagnostic and repair function to check for issues in the database related to a user's setup.
    This can be used to troubleshoot foreign key constraint issues.
    
    Args:
        user_id: The user ID to diagnose
        
    Returns:
        Dictionary with diagnostic results and any repairs made
    """
    results = {
        "diagnosis": [],
        "repairs": [],
        "success": True
    }
    
    try:
        # Check if user exists
        user_exists = await check_user_exists(user_id)
        results["diagnosis"].append({"user_exists": user_exists})
        
        if not user_exists:
            results["diagnosis"].append({"note": "User does not exist in database. This could cause foreign key constraint issues."})
        
        # Check guided setup
        setup_data = await get_guided_setup(user_id)
        if setup_data:
            results["diagnosis"].append({"guided_setup_exists": True})
            
            # Check if agent exists
            if "agent_id" in setup_data and setup_data["agent_id"]:
                # Verify the agent exists
                supabase = await get_supabase()
                agent_result = await supabase.table("agents").select("id").eq("id", setup_data["agent_id"]).execute()
                
                agent_exists = agent_result.data and len(agent_result.data) > 0
                results["diagnosis"].append({"agent_exists": agent_exists})
                
                if not agent_exists:
                    # The agent referenced in guided_setup doesn't exist - clear the reference
                    fix_result = await supabase.table("guided_setup").update({"agent_id": None}).eq("user_id", user_id).execute()
                    results["repairs"].append("Cleared invalid agent_id reference in guided_setup")
            else:
                results["diagnosis"].append({"agent_exists": "No agent_id in guided_setup"})
        else:
            results["diagnosis"].append({"guided_setup_exists": False})
        
        return results
    except Exception as e:
        results["success"] = False
        results["error"] = str(e)
        return results 