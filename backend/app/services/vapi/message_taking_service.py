from typing import Dict, Any, Optional
import logging
import json

from app.models.guided_setup import MessageTaking
from app.clients.supabase_client import get_supabase
from app.services.chat.chat import llm_response

# Configure logging
logger = logging.getLogger(__name__)

async def get_user_message_taking(user_id: str) -> Optional[MessageTaking]:
    """
    Retrieve message taking specifications for a user from the database.
    
    Args:
        user_id: The ID of the user
        
    Returns:
        MessageTaking object if found, None otherwise
    """
    try:
        logger.info(f"[SERVICE] get_user_message_taking: Fetching message taking specs for user {user_id}")
        supabase = await get_supabase()
        
        # Query the guided_setup table for the user's message taking specs
        result = await supabase.table("guided_setup").select("message_taking").eq("user_id", user_id).single()
        
        if result and result.get("message_taking"):
            logger.debug(f"[SERVICE] get_user_message_taking: Found message taking specs for user {user_id}")
            return MessageTaking(**result["message_taking"])
        else:
            logger.warning(f"[SERVICE] get_user_message_taking: No message taking specs found for user {user_id}")
            return None
            
    except Exception as e:
        logger.error(f"[SERVICE] get_user_message_taking: Error fetching message taking specs: {str(e)}")
        return None

async def extract_message_taking_info(
    transcript_context: str,
    message_taking_specs: MessageTaking,
    temperature: float = 0.0
) -> Dict[str, Any]:
    """
    Extract message taking information from a call transcript based on user specifications.
    
    Args:
        transcript_context: The full context including both transcript and summary
        message_taking_specs: The user's message taking specifications
        temperature: OpenAI temperature parameter (default: 0.0 for consistent outputs)
        
    Returns:
        Dictionary containing extracted information matching the message taking specs
    """
    logger.info("[SERVICE] extract_message_taking_info: Starting message extraction")
    
    try:
        # Prepare the system prompt
        system_prompt = """You are a precise information extractor specialized in analyzing call transcripts. 
        Your task is to extract specific information from a call transcript based on given specifications.
        
        Guidelines:
        1. Only extract information that was explicitly mentioned in the transcript or summary
        2. For caller name and phone number, look for clear mentions or self-identification
        3. For phone numbers, look out for o's, which can safely be assumed to be a zero
        4. For specific questions, extract answers only if they were directly addressed
        5. If information is not found, mark it as None or empty string
        6. Pay attention to both the raw transcript and the provided summary
        7. Return the information in valid JSON format matching the MessageTaking model structure
        
        The response MUST be valid JSON and match the MessageTaking model structure exactly."""

        # Prepare the user prompt with the message taking specs and transcript
        user_prompt = f"""Here are the message taking specifications:
        {message_taking_specs.model_dump_json(indent=2)}
        
        Please analyze the following call context and extract the relevant information:
        {transcript_context}
        
        Return the extracted information in valid JSON format matching the MessageTaking model structure exactly."""
        
        logger.debug("[SERVICE] extract_message_taking_info: Calling LLM for extraction")
        
        # Call the LLM
        response = await llm_response(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            conversation_history=None,  # No conversation history needed
            model="claude",  # Using Claude for better extraction accuracy
            token_size=1000  # Increased token size for detailed analysis
        )
        
        # Parse the response as JSON
        try:
            extracted_info = json.loads(response)
            # Validate against MessageTaking model
            message_taking = MessageTaking(**extracted_info)
            logger.info("[SERVICE] extract_message_taking_info: Successfully extracted and validated message taking information")
            return message_taking.model_dump()
        except json.JSONDecodeError as json_error:
            logger.error(f"[SERVICE] extract_message_taking_info: Failed to parse LLM response as JSON: {str(json_error)}")
            raise
        except Exception as validation_error:
            logger.error(f"[SERVICE] extract_message_taking_info: Failed to validate extracted info: {str(validation_error)}")
            raise
        
    except Exception as e:
        logger.error(f"[SERVICE] extract_message_taking_info: Error during extraction: {str(e)}")
        raise 