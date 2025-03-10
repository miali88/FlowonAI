import logging
from typing import Dict, Any, Tuple, Optional

from app.services import prompts
from app.services.voice.agents import create_agent, get_agents, update_agent
from .setup_crud import get_guided_setup, update_guided_setup_agent_id

async def create_or_update_agent_from_setup(user_id: str, setup_data: Dict[str, Any]) -> Tuple[bool, str, Any]:
    """
    Helper function to create or update an agent based on guided setup data.
    
    Args:
        user_id: The user ID
        setup_data: The setup data in frontend format (not database format)
        
    Returns:
        Tuple of (success, message, agent_data)
    """
    try:
        logging.info(f"Checking for existing agents for user {user_id}")
        
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
        
        # Extract business information for agent creation/update
        business_info = setup_data.get("businessInformation", {})
        business_name = business_info.get("businessName", "My Business")
        business_overview = business_info.get("businessOverview", "")
        
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
                    },}

        # Prepare agent data
        agent_data = {
            "userId": user_id,
            "agentName": f"{business_name} Assistant",
            "agentPurpose": "telephone-agent",  # Default purpose
            "instructions": prompts.answering_service.format(company_name=business_name, business_overview=business_overview),  # Include both variables
            "dataSource": "guided_setup",  # Mark this agent as created from guided setup
            "openingLine": f"Hello! Thank you for calling {business_name}. Our call may be recorded for quality control purposes, my name is Fiona. How can I help you today?",
            "language": "en-US",  # Default to English
            "voice": "Ize3YDdGqJYYKQSDLORJ", # jessica
            "features" : features,
            "assigned_telephone" : phone_number,  # Use the phone number from guided setup
            "voiceProvider" : "elevenlabs",
            "notify": True,  # Enable notifications
        }
        
        # Add guided_setup_id reference to agent data if available
        if guided_setup_id:
            agent_data["guided_setup_id"] = guided_setup_id
            logging.info(f"Added guided_setup_id {guided_setup_id} to agent data")
        
        # Add specific questions as form fields if available
        specific_questions = setup_data.get("messageTaking", {}).get("specificQuestions", [])
        if specific_questions:
            form_fields = []
            for q in specific_questions:
                # Handle both dict and SpecificQuestion object types
                if isinstance(q, dict) and "question" in q:
                    form_fields.append({
                        "name": q["question"],
                        "required": q.get("required", False)
                    })
                elif hasattr(q, "question") and hasattr(q, "required"):
                    form_fields.append({
                        "name": q.question,
                        "required": q.required
                    })
            if form_fields:
                agent_data["form_fields"] = form_fields
                logging.info(f"Added {len(form_fields)} form fields to agent data")
        
        # First check if we have an agent_id in the guided_setup table
        if agent_id:
            logging.info(f"Updating existing agent with ID from guided_setup: {agent_id}")
            
            # Make sure guided_setup_id is also updated for this existing agent
            if guided_setup_id:
                logging.info(f"Adding guided_setup_id {guided_setup_id} to existing agent {agent_id}")
            
            result = await update_agent(agent_id, agent_data)
            logging.info(f"Successfully updated agent for user {user_id}")
            return True, f"Updated existing agent with ID: {agent_id}", result
        else:
            # If no agent_id in guided_setup, check if there's an existing agent with dataSource=guided_setup
            user_agents = await get_agents(user_id)
            existing_agent = None
            
            if user_agents and user_agents.data:
                logging.info(f"Found {len(user_agents.data)} agents for user {user_id}")
                for agent in user_agents.data:
                    logging.info(f"Checking agent: {agent.get('id')} with dataSource: {agent.get('dataSource')}")
                    if agent.get("dataSource") == "guided_setup":
                        existing_agent = agent
                        logging.info(f"Found existing guided setup agent with ID: {agent.get('id')}")
                        break
            else:
                logging.info(f"No existing agents found for user {user_id}")
            
            # Update or create the agent
            if existing_agent:
                agent_id = existing_agent.get("id")
                logging.info(f"Updating existing agent with ID: {agent_id}")
                
                # Make sure guided_setup_id is also updated if it's not already set
                if guided_setup_id and not existing_agent.get("guided_setup_id"):
                    logging.info(f"Adding guided_setup_id {guided_setup_id} to existing agent {agent_id}")
                    # Don't overwrite any existing guided_setup_id
                elif existing_agent.get("guided_setup_id") and existing_agent.get("guided_setup_id") != guided_setup_id:
                    logging.warning(f"Agent already has a different guided_setup_id: {existing_agent.get('guided_setup_id')} vs new: {guided_setup_id}")
                
                result = await update_agent(agent_id, agent_data)
                
                # Store the agent_id in the guided_setup table for future reference
                update_success = await update_guided_setup_agent_id(user_id, agent_id)
                if update_success:
                    logging.info(f"Successfully stored agent_id in guided_setup table")
                else:
                    logging.warning(f"Failed to store agent_id in guided_setup table")
                
                logging.info(f"Successfully updated agent for user {user_id}")
                return True, f"Updated existing agent with ID: {agent_id}", result
            else:
                logging.info(f"Creating new agent for user {user_id}")
                result = await create_agent(agent_data)
                
                # Store the created agent_id in the guided_setup table
                if result and "id" in result:
                    new_agent_id = result["id"]
                    update_success = await update_guided_setup_agent_id(user_id, new_agent_id)
                    if update_success:
                        logging.info(f"Successfully stored new agent_id {new_agent_id} in guided_setup table")
                    else:
                        logging.warning(f"Failed to store new agent_id {new_agent_id} in guided_setup table")
                else:
                    logging.warning(f"Created agent result does not contain an ID: {result}")
                
                logging.info(f"Successfully created new agent for user {user_id}")
                return True, "Created new agent", result
    except Exception as e:
        logging.error(f"Error creating/updating agent from setup: {str(e)}")
        return False, f"Error creating/updating agent: {str(e)}", None 