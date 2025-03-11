import logging

from app.services.chat.chat import llm_response
from app.services.knowledge_base.web_scrape import scrape_url_simple
from app.api.schemas.guided_setup import RetrainAgentRequest, RetrainAgentResponse
from app.models.guided_setup import QuickSetupData
from app.services.guided_setup.setup_crud import get_guided_setup, save_guided_setup

async def generate_business_overview(scraped_content: str) -> str:
    """
    Generate a business overview using an LLM from the scraped content.
    
    Args:
        scraped_content: The content scraped from the website.
        
    Returns:
        A string containing the business overview.
    """
    try:
        # Use the working llm_response function from chat.py
        system_prompt = "You are a helpful assistant that generates concise business overviews. Extract key information about the business including what they do, their value proposition, target audience, and any unique selling points. You must only output the business overview, nothing else, with no other text or commentary."
        user_prompt = f"Generate a business overview from the following content. You must only output the business overview, nothing else, with no other text or commentary. Focus on creating a clear, professional summary that captures the essence of the business in 3-5 sentences:\n\n{scraped_content}"
        
        # Call the llm_response function with appropriate parameters
        response = await llm_response(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            conversation_history=None,  # No conversation history needed for this task
            model="claude",  # Using Claude as the default model
            token_size=300  # Increase token count for more detailed overview
        )
        
        return response.strip() if response else "Unable to generate business overview."
    except Exception as e:
        logging.error(f"Error generating business overview: {str(e)}")
        # Return a fallback message instead of raising an exception
        return "Unable to generate business overview due to an error."

async def retrain_agent_service(user_id: str, request: RetrainAgentRequest) -> RetrainAgentResponse:
    """
    Business logic for retraining an agent with website data.
    """
    try:
        logging.info(f"Retraining agent for user {user_id} with URL: {request.url}")
        
        # Get existing setup data for the user
        existing_setup = await get_guided_setup(user_id)
        if not existing_setup:
            logging.warning(f"No existing setup data found for user {user_id}")
        else:
            logging.info(f"Found existing guided setup data for user {user_id}")
            if "agent_id" in existing_setup and existing_setup["agent_id"]:
                logging.info(f"Found existing agent_id in guided setup: {existing_setup['agent_id']}")
            else:
                logging.info(f"No agent_id found in existing guided setup for user {user_id}")
            
        # Log specific questions if provided in setup data
        if request.setup_data and request.setup_data.messageTaking:
            specific_questions = request.setup_data.messageTaking.specificQuestions
            question_count = len(specific_questions)
            logging.info(f"Received {question_count} specific questions for retraining")
            if question_count > 0:
                for i, q in enumerate(specific_questions):
                    logging.info(f"Question {i+1}: '{q.question}' (Required: {q.required})")
        
        # Generate business overview from the URL
        # 1. Crawl the website to get content
        scraped_content = await scrape_url_simple(request.url)

        # 2. Generate business overview from content using LLM
        business_overview = await generate_business_overview(scraped_content)
        
        logging.info(f"Generated business overview for user {user_id}")
        
        # Use provided setup data or create minimal setup data
        setup_data = {}
        if request.setup_data:
            logging.info(f"Using provided setup data for update")
            setup_data = request.setup_data.model_dump()
        elif existing_setup:
            # Convert database format to frontend format
            setup_data = {
                "trainingSources": existing_setup.get("training_sources", {}),
                "businessInformation": existing_setup.get("business_information", {}),
                "messageTaking": existing_setup.get("message_taking", {}),
                "callNotifications": existing_setup.get("call_notifications", {})
            }
            logging.info(f"Using existing setup data from database for user {user_id}")
        else:
            # Create minimal setup data with the business overview
            setup_data = {
                "trainingSources": {"businessWebsite": request.url},
                "businessInformation": {
                    "businessName": "",
                    "businessOverview": business_overview,
                    "primaryBusinessAddress": "",
                    "primaryBusinessPhone": "",
                    "coreServices": [],
                    "businessHours": {}
                },
                "messageTaking": {
                    "callerName": {"required": True, "alwaysRequested": True},
                    "callerPhoneNumber": {"required": True, "automaticallyCaptured": True},
                    "specificQuestions": []
                },
                "callNotifications": {
                    "emailNotifications": {"enabled": False, "email": None},
                    "smsNotifications": {"enabled": False, "phoneNumber": None}
                }
            }
            logging.info(f"Created minimal setup data for user {user_id}")
        
        # Always update the business overview with the newly generated one
        if "businessInformation" in setup_data:
            setup_data["businessInformation"]["businessOverview"] = business_overview
            logging.info("Updated business overview in setup data")
        
        # Convert to QuickSetupData for saving
        quick_setup_data = QuickSetupData(**setup_data)
        # Save the updated or new data
        try:
            # Default to English (US) if agent language is not specified
            agent_language = "en-us"
            
            # Try to extract language from the scraping result or existing setup
            if "businessInformation" in setup_data and "language" in setup_data["businessInformation"]:
                agent_language = setup_data["businessInformation"]["language"]
            elif existing_setup and "agent_language" in existing_setup:
                agent_language = existing_setup["agent_language"]
                
            await save_guided_setup(user_id, quick_setup_data, agent_language=agent_language)
            logging.info(f"{'Updated' if existing_setup else 'Created new'} guided setup data for user {user_id}")
            logging.info(f"Agent language set to: {agent_language}")
        except Exception as save_error:
            logging.error(f"Error saving guided setup data: {str(save_error)}")
            return RetrainAgentResponse(
                success=False,
                business_overview=None,
                setup_data=None,
                error=f"Error saving guided setup data: {str(save_error)}"
            )
        
        # Get the freshly updated setup data
        updated_setup = await get_guided_setup(user_id)
        if not updated_setup:
            logging.error("Failed to retrieve updated setup data after save")
            return RetrainAgentResponse(
                success=False,
                business_overview=business_overview,
                setup_data=None,
                error="Failed to retrieve updated setup data after save"
            )
        
        # Convert back to frontend format for the response
        formatted_data = {
            "trainingSources": updated_setup.get("training_sources", {}),
            "businessInformation": updated_setup.get("business_information", {}),
            "messageTaking": updated_setup.get("message_taking", {}),
            "callNotifications": updated_setup.get("call_notifications", {})
        }
        
        return RetrainAgentResponse(
            success=True,
            business_overview=business_overview,
            setup_data=formatted_data,
            error=None
        )
    
    except Exception as e:
        logging.error(f"Error in retrain_agent_service: {str(e)}")
        error_msg = f"Error retraining agent: {str(e)}"
        return RetrainAgentResponse(
            success=False,
            business_overview=None,
            setup_data=None,
            error=error_msg
        ) 