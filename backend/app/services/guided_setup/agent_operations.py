import logging
from typing import Dict, Any, Tuple

from app.services import prompts
from app.services.voice.agents import create_agent, get_agents, update_agent
from app.services.vapi.assistants import create_assistant, update_assistant
from app.services.vapi.constants.voice_ids import voice_ids, get_voice_for_country
from app.services.vapi.constants.inbound_sys_prompt import SYS_PROMPT_TEMPLATE
from app.clients.supabase_client import get_supabase
from .setup_crud import get_guided_setup, update_guided_setup_agent_id
from app.models.guided_setup import QuickSetupData
from .language_utils import extract_country_and_language

# Map country codes to language codes
COUNTRY_TO_LANGUAGE = {
    # English-speaking countries with specific dialects
    "GB": "en-GB",  # United Kingdom
    "IE": "en-GB",  # Ireland uses British English
    "US": "en-US",  # United States
    "CA": "en-US",  # Canada uses American English
    "AU": "en-US",  # Australia defaults to US English for now
    "NZ": "en-US",  # New Zealand defaults to US English for now
}

# Default language if country not found
DEFAULT_LANGUAGE = "en-US"

def get_language_for_country(country_code: str) -> str:
    """Get the appropriate language code based on country code."""
    return COUNTRY_TO_LANGUAGE.get(country_code, DEFAULT_LANGUAGE)

async def format_vapi_system_prompt(setup_data: QuickSetupData) -> Tuple[str, str]:
    """
    Format the system prompt for a VAPI assistant based on guided setup data.
    
    Args:
        setup_data: The setup data as a QuickSetupData Pydantic model
        
    Returns:
        Tuple of (formatted system prompt string, business name)
    """
    logging.info("Formatting system prompt from guided setup data")
    
    # Get business information with proper None checks
    if setup_data.businessInformation:
        business_name = setup_data.businessInformation.businessName
        business_overview = getattr(setup_data.businessInformation, 'businessOverview', '')
        business_address = getattr(setup_data.businessInformation, 'primaryBusinessAddress', '')
        business_phone = getattr(setup_data.businessInformation, 'primaryBusinessPhone', '')
        core_services = getattr(setup_data.businessInformation, 'coreServices', [])
        business_hours = getattr(setup_data.businessInformation, 'businessHours', {})
    else:
        business_name = "Your Business"
        business_overview = ""
        business_address = ""
        business_phone = ""
        core_services = []
        business_hours = {}

    # Format comprehensive business information with markdown headings if they exist
    business_info_lines = []
    if business_overview and business_overview.strip():
        business_info_lines.append("## Business Information")
        business_info_lines.append(f"{business_overview}\n")
    
    if business_address or business_phone or core_services:
        if not business_info_lines:
            business_info_lines.append("## Business Information")
        
        if business_address:
            business_info_lines.append(f"**Address:** {business_address}")
        
        if business_phone:
            business_info_lines.append(f"**Phone:** {business_phone}")
        
        if core_services and len(core_services) > 0:
            business_info_lines.append("**Core Services:**")
            for service in core_services:
                business_info_lines.append(f"- {service}")
    
    # Add business hours to business information
    if business_hours:
        if business_info_lines:
            business_info_lines.append("")  # Add a blank line for separation
        
        business_info_lines.append("## Business Hours")
        for day, hours in business_hours.items():
            business_info_lines.append(f"- {day}: {hours.open} - {hours.close}")
        
        logging.info("Added business hours to business information")
    
    formatted_business_information = "\n".join(business_info_lines) if business_info_lines else ""
    
    # We'll still format business hours separately for logging purposes
    if business_hours:
        hours_lines = ["## Business Hours"]
        for day, hours in business_hours.items():
            hours_lines.append(f"- {day}: {hours.open} - {hours.close}")
        standalone_hours = "\n".join(hours_lines)
    else:
        logging.info("No business hours to format")
    
    # Format message taking information if it exists
    formatted_message_taking = ""
    if setup_data.messageTaking:
        message_taking_info = []
        message_taking_info.append("## Message Taking Instructions")
        
        # Caller name requirements
        caller_name = setup_data.messageTaking.callerName
        if caller_name:
            name_required = "Required" if caller_name.required else "Optional"
            always_asked = "Always ask" if caller_name.alwaysRequested else "Ask only if needed"
            message_taking_info.append(f"- Caller Name: {name_required}, {always_asked}")
        
        # Caller phone number requirements
        caller_phone = setup_data.messageTaking.callerPhoneNumber
        if caller_phone:
            phone_required = "Required" if caller_phone.required else "Optional"
            auto_capture = "Automatically captured" if caller_phone.automaticallyCaptured else "Needs to be asked"
            message_taking_info.append(f"- Caller Phone Number: {phone_required}, {auto_capture}")
        
        # Specific questions to ask
        specific_questions = setup_data.messageTaking.specificQuestions
        if specific_questions and len(specific_questions) > 0:
            message_taking_info.append("\n### Specific Questions to Ask:")
            for i, q in enumerate(specific_questions, 1):
                required_mark = "(Required)" if q.required else "(Optional)"
                message_taking_info.append(f"{i}. {q.question} {required_mark}")
        
        formatted_message_taking = "\n".join(message_taking_info)
    else:
        formatted_message_taking = ""
        logging.info("No message taking information to format")
    
    # Format system prompt with business information (which now includes hours) and message taking
    sys_prompt = SYS_PROMPT_TEMPLATE.format(
        business_name=business_name,
        business_information=formatted_business_information,
        message_taking=formatted_message_taking
    )
    
    logging.info("System prompt formatting completed")
    return sys_prompt, business_name

async def create_or_update_vapi_assistant(user_id: str, setup_data: QuickSetupData) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Create or update a VAPI assistant based on guided setup data.
    
    Args:
        user_id: The user ID
        setup_data: The setup data as a QuickSetupData Pydantic model
        
    Returns:
        Tuple of (success, message, assistant_data)
    """
    try:
        logging.info(f"Creating or updating VAPI assistant for user {user_id}")
        
        # Format the system prompt and get business name
        sys_prompt, business_name = await format_vapi_system_prompt(setup_data)
        
        # Extract country code and language from business address
        country_code, _ = extract_country_and_language(setup_data.businessInformation.primaryBusinessAddress)
        
        # Get the appropriate voice ID based on country code
        voice_id = get_voice_for_country(country_code)
        logging.info(f"Selected voice ID {voice_id} based on country code {country_code}")
        
        # Get guided setup data to check for existing assistant
        guided_setup_data = await get_guided_setup(user_id)
        vapi_assistant_id = guided_setup_data.get("vapi_assistant_id") if guided_setup_data else None
        
        # Create or update the VAPI assistant
        if vapi_assistant_id:
            logging.info(f"Updating existing VAPI assistant with ID: {vapi_assistant_id}")
            assistant_result = await update_assistant(
                assistant_id=vapi_assistant_id,
                business_name=business_name,
                sys_prompt=sys_prompt
            )
            logging.info(f"VAPI assistant updated successfully: {assistant_result.get('id')}")
            return True, f"Updated existing VAPI assistant with ID: {vapi_assistant_id}", assistant_result
        else:
            logging.info(f"Creating new VAPI assistant for {business_name}")
            assistant_result = await create_assistant(
                business_name=business_name,
                sys_prompt=sys_prompt,
                voice_id=voice_id  # Use country-based voice selection
            )
            
            # Save the new assistant ID to the guided setup data
            new_assistant_id = assistant_result.get('id')
            if new_assistant_id:
                # Update the Supabase record with the new assistant ID
                supabase = await get_supabase()
                
                update_result = await supabase.table("guided_setup").update({
                    "vapi_assistant_id": new_assistant_id
                }).eq("user_id", user_id).execute()
                
                if not update_result.data:
                    logging.warning(f"Failed to update guided_setup with VAPI assistant ID for user {user_id}")
                    return True, f"Created VAPI assistant but failed to update guided_setup", assistant_result
                else:
                    logging.info(f"Saved VAPI assistant ID {new_assistant_id} to guided_setup for user {user_id}")
                    return True, f"Created new VAPI assistant with ID: {new_assistant_id}", assistant_result
            else:
                logging.warning(f"Created VAPI assistant result does not contain an ID")
                return False, "Failed to retrieve VAPI assistant ID from creation result", assistant_result
            
    except Exception as e:
        logging.error(f"Error creating/updating VAPI assistant: {str(e)}")
        return False, f"Error creating/updating VAPI assistant: {str(e)}", {}

async def create_or_update_agent_from_setup(user_id: str, setup_data: QuickSetupData) -> Tuple[bool, str, Any]:
    try:
        logging.info(f"Checking for existing agents for user {user_id}")
        
        # Access data directly from the Pydantic model
        business_info = setup_data.businessInformation
        business_name = business_info.businessName
        business_overview = business_info.businessOverview
        specific_questions = setup_data.messageTaking.specificQuestions if setup_data.messageTaking else []
        
        # Extract country code and language from business address
        country_code, agent_language = extract_country_and_language(business_info.primaryBusinessAddress)
        
        # Get the appropriate voice ID based on country code
        voice_id = get_voice_for_country(country_code)
        
        # Get the user's guided setup data to retrieve the phone number and agent_id
        guided_setup_data = await get_guided_setup(user_id)
        phone_number = guided_setup_data.get("phone_number", "") if guided_setup_data else ""
        agent_id = guided_setup_data.get("agent_id") if guided_setup_data else None
        guided_setup_id = guided_setup_data.get("id") if guided_setup_data else None
        
        logging.info(f"Retrieved phone number for agent assignment: {phone_number}")
        if agent_id:
            logging.info(f"Found existing agent_id in guided_setup: {agent_id}")
        else:
            logging.info(f"No agent_id found in guided_setup for user {user_id}")
            
        if guided_setup_id:
            logging.info(f"Found guided_setup_id: {guided_setup_id}")
        else:
            logging.warning(f"No guided_setup_id found for user {user_id}")
        
        logging.info(f"Preparing agent data for business: {business_name}")

        features = {
            "end_call": {
                "enabled": True
            },
            "call_transfer": {
                "enabled": True
            },
            "notifyOnInterest": {
                "enabled": True
            },
        }

        # Prepare agent data
        agent_data = {
            "userId": user_id,
            "agentName": f"{business_name} Assistant",
            "agentPurpose": "telephone-agent",  # Default purpose
            "instructions": prompts.answering_service.format(company_name=business_name, business_overview=business_overview),
            "dataSource": "guided_setup",  # Mark this agent as created from guided setup
            "openingLine": f"Hello! Thank you for calling {business_name}. Our call may be recorded for quality control purposes, my name is Fiona. How can I help you today?",
            "language": agent_language,  # Use country-specific language
            "voice": voice_id,  # Use the voice ID based on country code
            "features" : features,
            "assigned_telephone" : phone_number,  # Use the phone number from guided setup
            "voiceProvider" : "elevenlabs",
            "notify": True,  # Enable notifications
        }

        # Create or update the agent
        if agent_id:
            logging.info(f"Updating existing agent with ID: {agent_id}")
            agent_result = await update_agent(agent_id, agent_data)
            logging.info(f"Agent updated successfully: {agent_result.get('id')}")
            return True, f"Updated existing agent with ID: {agent_id}", agent_result
        else:
            logging.info(f"Creating new agent for {business_name}")
            agent_result = await create_agent(agent_data)
            
            # Save the new agent ID to the guided setup data
            new_agent_id = agent_result.get('id')
            if new_agent_id:
                await update_guided_setup_agent_id(user_id, new_agent_id)
                logging.info(f"Saved agent ID {new_agent_id} to guided_setup for user {user_id}")
                return True, f"Created new agent with ID: {new_agent_id}", agent_result
            else:
                logging.warning(f"Created agent result does not contain an ID")
                return False, "Failed to retrieve agent ID from creation result", agent_result

    except Exception as e:
        logging.error(f"Error creating/updating agent: {str(e)}")
        return False, f"Error creating/updating agent: {str(e)}", None

