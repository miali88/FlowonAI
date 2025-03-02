import logging
import os
from app.core.config import settings
from services.chat.chat import llm_response

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
        system_prompt = "You are a helpful assistant that generates concise business overviews. Extract key information about the business including what they do, their value proposition, target audience, and any unique selling points."
        user_prompt = f"Generate a business overview from the following content. Focus on creating a clear, professional summary that captures the essence of the business in 3-5 sentences:\n\n{scraped_content}"
        
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
