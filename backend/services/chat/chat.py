from fastapi import Request, Response
from fastapi.responses import JSONResponse
from services.db.supabase_ops import supabase_ops
from app.core.config import settings
from dotenv import load_dotenv
import json
import logging

load_dotenv()

logger = logging.getLogger(__name__)

from services.chat.lm import agent_retriever, cx_sys_prompt, retriever_prompt

async def handle_chat_webhook(request: Request):
    try:
        logger.info("Received chat webhook request")
        body = await request.json()
        user_message = body.get('message')
        if not user_message:
            logger.warning("No message found in request body")
            return JSONResponse({"error": "No message provided"}, status_code=400)
        
        logger.info(f"User message: {user_message}")
        
        bot_response = agent_retriever(cx_sys_prompt, retriever_prompt.format(query=user_message))
        
        logger.info(f"Bot response generated successfully")
        
        return JSONResponse({"response": bot_response})
    except json.JSONDecodeError:
        logger.error("Invalid JSON in request body")
        return JSONResponse({"error": "Invalid JSON in request body"}, status_code=400)
    except Exception as e:
        logger.error(f"Error in handle_chat_webhook: {str(e)}")
        return JSONResponse({"error": "An error occurred while processing your request"}, status_code=500)