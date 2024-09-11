from fastapi import Request, HTTPException, APIRouter, Response
from fastapi.responses import JSONResponse
import json
import logging
from openai import OpenAI

from services.chat.chat import chat_process

# from services.db.supabase_ops import supabase_ops

router = APIRouter()
logger = logging.getLogger(__name__)

@router.api_route('/', methods=['POST', 'GET'])
async def chat_webhook(request: Request):
    user_query = await request.json()

    print(user_query)

    answer = await chat_process(user_query['message'], user_query['user_id'])

    # Format the answer with headers and new lines
    formatted_answer = format_answer(answer)

    response = {
        "response": {
            "answer": formatted_answer
        }
    }

    return response

def format_answer(answer):
    # Split the answer into sections
    sections = answer.split('\n\n')
    formatted_sections = []

    for section in sections:
        if ':' in section:
            # Add markdown header formatting
            header, content = section.split(':', 1)
            formatted_sections.append(f"### {header.strip()}\n{content.strip()}")
        else:
            formatted_sections.append(section.strip())

    # Join sections with double newlines
    return '\n\n'.join(formatted_sections)
