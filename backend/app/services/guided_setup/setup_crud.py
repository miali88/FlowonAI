import logging
from typing import Dict, Any

from app.clients.supabase_client import get_supabase
from app.models.guided_setup import QuickSetupData

async def save_guided_setup(user_id: str, quick_setup_data: QuickSetupData, phone_number: str = "(814) 261-0317"):
    """Save the guided setup data to Supabase."""
    
    # Check if the user already has setup data
    existing_setup = await get_guided_setup(user_id)
    
    # Convert Pydantic models to dictionaries for JSONB columns
    setup_data = {
        "user_id": user_id,
        "training_sources": quick_setup_data.trainingSources.dict(),
        "business_information": quick_setup_data.businessInformation.dict(),
        "message_taking": quick_setup_data.messageTaking.dict(),
        "call_notifications": quick_setup_data.callNotifications.dict(),
        "phone_number": phone_number,
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
            logging.info(f"Successfully updated guided setup data for user {user_id}")
        else:
            # Insert new record
            result = await supabase.table("guided_setup").insert(setup_data).execute()
            logging.info(f"Successfully created guided setup data for user {user_id}")
        
        # Supabase client might return different response object types
        if hasattr(result, 'error') and result.error:
            logging.error(f"Database error with guided setup: {result.error}")
    except Exception as e:
        logging.error(f"Exception during guided setup save: {str(e)}")
    
    # Verify the data was saved correctly
    updated_setup = await get_guided_setup(user_id)
    if updated_setup:
        # Check if agent_id was preserved
        if "agent_id" in setup_data and setup_data["agent_id"]:
            if updated_setup.get("agent_id") == setup_data["agent_id"]:
                logging.info(f"Verified agent_id was correctly preserved: {setup_data['agent_id']}")
            else:
                logging.warning(f"agent_id was not correctly preserved. Expected: {setup_data['agent_id']}, Got: {updated_setup.get('agent_id')}")
    else:
        logging.error(f"Failed to verify guided setup data save for user {user_id}")
    
    return setup_data

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
    
    # Format and return the setup data
    return {
        "success": True,
        "setup_data": setup_data,
        "setup_completed": setup_data.get("setup_completed", False)
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