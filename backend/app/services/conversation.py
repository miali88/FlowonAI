from app.core.logging_setup import logger

from app.services.chat.chat import llm_response
from app.clients.supabase_client import get_supabase

async def transcript_summary(transcript: str, job_id: str) -> str | None:
    """
    Generate and store a summary of a conversation transcript.
    
    Args:
        transcript: string of conversation 
        job_id: Unique identifier for the conversation
    
    Returns:
        str | None: Generated summary or None if error occurs
    """
    print("\n\n transcript_summary func called")
    system_prompt = """
    you are an ai agent designed to summarise transcript of phone conversations between an AI agent and a caller. 

    You will be as concise as possible, and only respond with the outcome of the conversation and facts related to the caller's responses.
    Do not assume anything, not even the currency of any amounts or monies mentioned. If transcript is empty, return "No conversation was held"

    Your output will be in bullet points, with no prefix like "the calller is" or "the caller asks"
    """
    logger.info(f"Starting transcript summary for job_id: {job_id}")
    logger.debug(f"Received transcript: {transcript}")
    
    if not transcript:
        logger.info("Empty transcript received")
        return "No conversation was held"
    
    transcript_str = str(transcript)
    logger.debug(f"Transcript string length: {len(transcript_str)}")
    
    try:
        supabase = await get_supabase()

        logger.info("Calling llm_response...")
        logger.debug(f"System prompt: {system_prompt}")
        logger.debug(f"Transcript input (first 200 chars): {transcript_str[:200]}...")
        
        summary = await llm_response(
            user_prompt=transcript_str, 
            system_prompt=system_prompt,
            model="claude",  # Explicitly specify model
            token_size=2000  # Increase token size for summaries
        )
        
        if not summary:
            logger.error("llm_response returned None")
            return None
            
        logger.info(f"Raw summary response: {summary[:200]}...")
        logger.info(f"Transcript summary generated successfully: {summary[:100]}...")  # Log first 100 chars
        print(f"Transcript summary generated successfully: {summary[:100]}...")  # Log first 100 chars
        try:
            logger.info("Attempting to update Supabase...")
            result = await supabase.table("conversation_logs").update({
                "summary": summary
            }).eq("job_id", job_id).execute()
            logger.info(f"Summary inserted into summary table for job_id: {job_id}")
            return summary
            
        except Exception as e:
            logger.error(f"Error inserting summary to Supabase: {str(e)}", exc_info=True)
            return summary  # Still return summary even if DB update fails
            
    except Exception as e:
        logger.error(f"Error generating transcript summary: {str(e)}", exc_info=True)
        return None
