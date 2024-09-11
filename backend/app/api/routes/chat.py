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

    response = {
                "response": {
                    "answer": answer
                }
            }

    return response
