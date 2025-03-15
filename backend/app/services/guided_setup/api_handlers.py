import logging
from typing import Dict, Any, Optional
import base64
from datetime import datetime, timedelta

from app.clients.supabase_client import get_supabase
from app.models.guided_setup import (QuickSetupData)
from app.services.guided_setup.setup_crud import get_guided_setup, save_guided_setup
from app.services.guided_setup.agent_operations import create_or_update_vapi_assistant
from app.services.guided_setup.audio_generation import generate_greeting_preview, generate_message_preview

async def submit_quick_setup(user_id: str, setup_data: QuickSetupData) -> Dict[str, Any]:
    """Process quick setup data submission."""
    try:
        # Log the specific questions for debugging
        specific_questions = setup_data.messageTaking.specificQuestions if setup_data.messageTaking else []
        question_count = len(specific_questions)
        logging.info(f"Received {question_count} specific questions for user {user_id}")
        if question_count > 0:
            for i, q in enumerate(specific_questions):
                logging.info(f"Question {i+1}: '{q.question}' (Required: {q.required})")
        
        # Save the setup data to Supabase with improved error handling
        success, setup_data_dict, error_msg = await save_guided_setup(user_id, setup_data)
        
        if not success:
            logging.error(f"Failed to save guided setup during quick setup: {error_msg}")
            return {
                "success": False,
                "error": f"Failed to save setup data: {error_msg}"
            }
        
        logging.info(f"Quick setup completed for user {user_id}")
        
        # Create or update the VAPI assistant using the refactored function
        try:
            vapi_success, vapi_message, vapi_result = await create_or_update_vapi_assistant(user_id, setup_data)
            
            # Extract the VAPI assistant ID from the result
            vapi_assistant_id = vapi_result.get('id') if vapi_success and vapi_result else None
            
            if vapi_success:
                logging.info(f"VAPI assistant operation successful: {vapi_message}")
                return {
                    "success": True,
                    "message": "Quick setup data processed successfully",
                    "vapi_assistant_id": vapi_assistant_id
                }
            else:
                logging.warning(f"VAPI assistant operation issue: {vapi_message}")
                return {
                    "success": True,  # Still consider overall successful since data was saved
                    "message": "Quick setup data saved, but assistant creation/update had issues",
                    "warning": vapi_message
                }
        except Exception as e:
            logging.error(f"Error with VAPI assistant: {str(e)}")
            return {
                "success": True,  # Still consider overall successful since data was saved
                "message": "Quick setup data saved, but assistant creation failed",
                "warning": str(e)
            }
            
    except Exception as e:
        logging.error(f"Error in quick-setup: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

async def check_setup_status(user_id: str) -> Dict[str, Any]:
    """Check if the user has completed the guided setup."""
    try:
        logging.info(f"Checking setup status for user: {user_id}")
        
        # Get user's guided setup data
        setup_data = await get_guided_setup(user_id)
        
        # Check if setup is complete
        is_complete = setup_data.get("setup_completed", False) if setup_data else False
        
        return {
            "success": True,
            "isComplete": is_complete
        }
    except Exception as e:
        logging.error(f"Error checking setup status: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

async def generate_onboarding_preview_service(
    user_id: str,
    business_name: str,
    business_description: str,
    business_website: str,
    agent_language: str = "en-US"
) -> Dict[str, Any]:
    """
    Service function to generate audio previews for onboarding with minimal business information.
    This returns both greeting and message-taking audio samples.
    
    Args:
        user_id: The ID of the user
        business_name: Name of the business
        business_description: Brief description of the business
        business_website: Website URL of the business
        agent_language: Language code for the agent (default: en-US)
        
    Returns:
        Dictionary with success status, audio data, and text
    """
    try:
        logging.info(f"Generating onboarding preview for user {user_id} with business name: {business_name}")
        
        # Generate greeting audio
        greeting_result = await generate_greeting_preview(
            user_id=user_id,
            business_name=business_name,
            business_description=business_description,
            business_website=business_website,
            language=agent_language
        )
        
        # Generate message-taking audio
        message_result = await generate_message_preview(
            user_id=user_id,
            business_name=business_name,
            language=agent_language
        )
        
        if not greeting_result.get("success") or not message_result.get("success"):
            error_message = greeting_result.get("error") or message_result.get("error") or "Failed to generate audio previews"
            return {
                "success": False,
                "error": error_message
            }
        
        # Convert binary audio data to base64 strings
        greeting_audio_base64 = base64.b64encode(greeting_result.get("audio_data")).decode('utf-8')
        message_audio_base64 = base64.b64encode(message_result.get("audio_data")).decode('utf-8')
        
        # Prepend the proper data URL prefix for audio data
        greeting_audio_data = f"data:audio/mp3;base64,{greeting_audio_base64}"
        message_audio_data = f"data:audio/mp3;base64,{message_audio_base64}"
        
        # Return a response with the properly formatted audio data and text
        return {
            "success": True,
            "greeting_audio_data_base64": greeting_audio_data,
            "message_audio_data_base64": message_audio_data,
            "greeting_text": greeting_result.get("text"),
            "message_text": message_result.get("text")
        }
    except Exception as e:
        logging.error(f"Error in generate_onboarding_preview_service: {str(e)}")
        return {"success": False, "error": str(e)}

async def set_trial_plan_service(
    user_id: str, 
    trial_plan_type: str
) -> Dict[str, Any]:
    """
    Service function to set up a trial plan for a user.
    This will mark the user as being in a trial and set the appropriate trial parameters.
    
    Args:
        user_id: The ID of the user
        trial_plan_type: The type of trial plan to set up
        
    Returns:
        Dictionary with success status and message
    """
    try:
        logging.info(f"Setting up trial plan '{trial_plan_type}' for user {user_id}")
        
        supabase = await get_supabase()
        
        # Get current timestamp for trial start
        trial_start_date = datetime.now().isoformat()
        trial_end_date = (datetime.now() + timedelta(days=14)).isoformat()
        
        # Update user record with trial information
        response = await supabase.table('users').update({
            'is_trial': True,
            'trial_start_date': trial_start_date,
            'trial_end_date': trial_end_date,
            'trial_plan_type': trial_plan_type,
            'trial_minutes_total': 25,
            'trial_minutes_used': 0
        }).eq('id', user_id).execute()
        
        if not response.data:
            logging.error(f"Failed to update user {user_id} with trial information")
            return {
                "success": False,
                "error": "Failed to set up trial plan"
            }
        
        logging.info(f"Successfully set up trial plan for user {user_id}")
        
        return {
            "success": True, 
            "message": f"Trial plan {trial_plan_type} set up successfully"
        }
    
    except Exception as e:
        logging.error(f"Error setting up trial plan: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        } 