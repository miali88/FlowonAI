from app.core.logging_setup import logger
from typing import Dict, Any, Tuple, Optional
from datetime import datetime

from app.clients.supabase_client import get_supabase
from app.models.guided_setup import QuickSetupData
from .language_utils import extract_country_and_language

async def check_user_exists(user_id: str) -> bool:
    """Check if a user exists in the users table."""
    try:
        supabase = await get_supabase()
        result = await supabase.table("users").select("id").eq("id", user_id).execute()
        return result.data and len(result.data) > 0
    except Exception as e:
        logger.error(f"Error checking if user exists: {str(e)}")
        return False

async def get_user_email(user_id: str) -> Optional[str]:
    """Get the user's email from the users table."""
    try:
        supabase = await get_supabase()
        result = await supabase.table("users").select("email").eq("id", user_id).execute()
        if result.data and len(result.data) > 0:
            return result.data[0].get("email")
        return None
    except Exception as e:
        logger.error(f"Error getting user email: {str(e)}")
        return None

async def save_guided_setup(user_id: str, quick_setup_data: QuickSetupData) -> Tuple[bool, Dict[str, Any], Optional[str]]:
    """
    Save the guided setup data to Supabase.
    
    Args:
        user_id: The ID of the user
        quick_setup_data: The QuickSetupData Pydantic model
        
    Returns:
        Tuple of (success, data_dict, error_message)
    """
    logger.info(f"[SERVICE] save_guided_setup: Starting save process for user {user_id}")
    
    # First check if the user exists
    user_exists = await check_user_exists(user_id)
    
    if not user_exists:
        error_message = f"User with ID {user_id} does not exist in the users table"
        logger.error(error_message)
        # Continue anyway, since we want to allow setup creation even if user record doesn't exist yet
        logger.warning(f"Proceeding with guided setup creation despite missing user record")
    
    try:
        # Check if the user already has setup data
        existing_setup = await get_guided_setup(user_id)
        
        # Extract country code and language from business address
        _, agent_language = extract_country_and_language(quick_setup_data.businessInformation.primaryBusinessAddress)
        
        # Get the user's email
        user_email = await get_user_email(user_id)
        
        # Check if the email in the form is different from the user's email in the database
        form_email = None
        if (hasattr(quick_setup_data, 'callNotifications') and 
            hasattr(quick_setup_data.callNotifications, 'emailNotifications') and
            hasattr(quick_setup_data.callNotifications.emailNotifications, 'email')):
            form_email = quick_setup_data.callNotifications.emailNotifications.email
        
        # If the form email is provided and different from the user's email, update the user's email
        if form_email and form_email != user_email:
            supabase = await get_supabase()
            await supabase.table("users").update({"email": form_email}).eq("id", user_id).execute()
            user_email = form_email
        
        # If we have a user email, ensure it's set in the call notifications
        if user_email and quick_setup_data.callNotifications:
            if not hasattr(quick_setup_data.callNotifications, 'emailNotifications'):
                quick_setup_data.callNotifications.emailNotifications = {"enabled": True, "email": user_email}
            else:
                quick_setup_data.callNotifications.emailNotifications.email = user_email
        
        # Convert Pydantic models to dictionaries for JSONB columns
        setup_data = {
            "user_id": user_id,
            "training_sources": quick_setup_data.trainingSources.model_dump(),
            "business_information": quick_setup_data.businessInformation.model_dump(),
            "message_taking": quick_setup_data.messageTaking.model_dump(),
            "call_notifications": quick_setup_data.callNotifications.model_dump(),
            "agent_language": agent_language,  # Set the determined language
            "setup_completed": False,  # Default to False for new records
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # If record exists, preserve certain values
        if existing_setup:
            setup_data["setup_completed"] = existing_setup.get("setup_completed", False)
            if "vapi_assistant_id" in existing_setup and existing_setup["vapi_assistant_id"]:
                setup_data["vapi_assistant_id"] = existing_setup["vapi_assistant_id"]
            if "phone_number" in existing_setup and existing_setup["phone_number"]:
                setup_data["phone_number"] = existing_setup["phone_number"]
            logger.info(f"Updating existing guided setup data for user {user_id}")
        else:
            logger.info(f"Creating new guided setup data for user {user_id}")
        
        # Update or insert the record
        supabase = await get_supabase()
        
        if existing_setup:
            # Update existing record
            result = await supabase.table("guided_setup").update(setup_data).eq("user_id", user_id).execute()
        else:
            # Insert new record
            result = await supabase.table("guided_setup").insert(setup_data).execute()
        
        if hasattr(result, 'error') and result.error:
            error_message = f"Database error {'updating' if existing_setup else 'inserting'} guided setup: {result.error}"
            logger.error(error_message)
            return False, {}, error_message
        
        # Verify the data was saved correctly
        updated_setup = await get_guided_setup(user_id)
        if not updated_setup:
            error_message = f"Failed to verify guided setup data save for user {user_id}"
            logger.error(error_message)
            return False, {}, error_message
            
        logger.info(f"Successfully {'updated' if existing_setup else 'created'} guided setup data for user {user_id}")
        return True, updated_setup, None
        
    except Exception as e:
        error_message = f"Exception during guided setup save: {str(e)}"
        logger.error(error_message)
        return False, {}, error_message

async def get_guided_setup(user_id: str):
    """Retrieve the guided setup data for a user from Supabase."""
    supabase = await get_supabase()
    
    # Query the guided_setup table for the user's data
    result = await supabase.table("guided_setup").select("*").eq("user_id", user_id).execute()
    
    if result.data and len(result.data) > 0:
        logger.info(f"Retrieved guided setup data for user {user_id}")
        return result.data[0]
    
    logger.info(f"No guided setup data found for user {user_id}")
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
            logger.error(f"Error updating agent_id for user {user_id}: {result.error}")
            return False
            
        logger.info(f"Successfully updated agent_id to {agent_id} for user {user_id}")
        return True
    except Exception as e:
        logger.error(f"Exception updating agent_id for user {user_id}: {str(e)}")
        return False

async def mark_setup_complete(user_id: str) -> Dict[str, Any]:
    """Mark the guided setup as complete for a user."""
    supabase = await get_supabase()
    
    try:
        # Mark setup as completed
        result = await supabase.table("guided_setup").update({"setup_completed": True}).eq("user_id", user_id).execute()
        
        if hasattr(result, 'error') and result.error:
            logger.error(f"Error marking setup complete for user {user_id}: {result.error}")
            return {"success": False, "error": str(result.error)}
            
        logger.info(f"Successfully marked setup as complete for user {user_id}")
        return {"success": True}
    except Exception as e:
        logger.error(f"Exception marking setup complete for user {user_id}: {str(e)}")
        return {"success": False, "error": str(e)}

async def get_formatted_setup_data(user_id: str) -> Dict[str, Any]:
    """Get the formatted setup data for a user."""
    setup_data = await get_guided_setup(user_id)
    
    if not setup_data:
        return {"success": False, "error": "No setup data found for user"}
    
    # Get the user's email if not already in the call_notifications
    user_email = await get_user_email(user_id)
    call_notifications = setup_data.get("call_notifications", {})
    
    # Check if we need to update the email in call_notifications
    if user_email and (
        not call_notifications.get("emailNotifications") or 
        not call_notifications.get("emailNotifications", {}).get("email")
    ):
        # Update the email in call_notifications
        if not call_notifications.get("emailNotifications"):
            call_notifications["emailNotifications"] = {"enabled": True, "email": user_email}
        else:
            call_notifications["emailNotifications"]["email"] = user_email
        
        # Update the database
        supabase = await get_supabase()
        await supabase.table("guided_setup").update({
            "call_notifications": call_notifications
        }).eq("user_id", user_id).execute()
        
        # Update the setup_data for the return value
        setup_data["call_notifications"] = call_notifications
    
    # Convert snake_case to camelCase for frontend compatibility
    formatted_data = {
        "trainingSources": setup_data.get("training_sources", {}),
        "businessInformation": setup_data.get("business_information", {}),
        "messageTaking": setup_data.get("message_taking", {}),
        "callNotifications": setup_data.get("call_notifications", {}),
        "trained_on_website": setup_data.get("trained_on_website", False),
        "userEmail": setup_data.get("call_notifications", {}).get("emailNotifications", {}).get("email", "")
    }
    
    # Format and return the setup data
    return {
        "success": True,
        "setupData": formatted_data,
        "setupCompleted": setup_data.get("setup_completed", False)
    }

async def get_phone_number_handler(user_id: str) -> Dict[str, Any]:
    """Get the phone number for a user."""
    setup_data = await get_guided_setup(user_id)
    if not setup_data:
        return {"success": False, "error": "No setup data found for user"}
    
    phone_number = setup_data.get("phone_number", "")

    if not phone_number:
        return {
            "success": False,
            "error": "No phone number found for user"
        }
    else:
        return {
            "success": True,
            "phone_number": phone_number
        }

async def update_training_status_service(user_id: str, trained_status: bool) -> Dict[str, Any]:
    """
    Update the trained_on_website status for a user in the guided_setup table.
    
    Args:
        user_id: The ID of the user
        trained_status: The new training status
        
    Returns:
        Dict containing success status and any error message
    """
    try:
        supabase = await get_supabase()
        
        # Update the trained_on_website status
        result = await supabase.table('guided_setup') \
            .update({'trained_on_website': trained_status}) \
            .eq('user_id', user_id) \
            .execute()
            
        if not result.data or len(result.data) == 0:
            logger.error(f"No guided setup record found for user {user_id}")
            return {
                'success': False,
                'error': 'No guided setup record found for user'
            }
            
        logger.info(f"Updated training status to {trained_status} for user {user_id}")
        return {
            'success': True,
            'data': result.data[0]
        }
            
    except Exception as e:
        logger.error(f"Error updating training status: {str(e)}")
        return {
            'success': False,
            'error': f"Failed to update training status: {str(e)}"
        }
