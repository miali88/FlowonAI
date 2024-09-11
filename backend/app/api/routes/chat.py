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
async def webhook(request: Request):
    user_query = await request.json()

    print(user_query)

    chat_process(user_query['message'], user_query['user_id'])


    response = {
                "response": {
                    "answer": "The actual response text from the AI"
                }
            }

    return response


    # try:
    #     logger.info("Received request at /chat")
    #     response = await handle_chat_webhook(request)
    #     print('response...', response)
    #     # Convert the response to a JSON-serializable format
    #     if isinstance(response, JSONResponse):
    #         # If it's already a JSONResponse, extract the content
    #         print('response is a JSONResponse...')
    #         json_response = response.body.decode()
    #         print('json_response...', json_response)
    #     else:
    #         # If it's a regular dictionary, convert it to JSON
    #         print('response is not a JSONResponse...')
    #         json_response = json.dumps(response)
    #         print('json_response...', json_response)
        
    #     # Create a new JSONResponse with the JSON-serialized content
    #     return JSONResponse(content=json.loads(json_response))
    # except Exception as e:
    #     logger.error(f"Error in /chat: {str(e)}")
    #     return JSONResponse({"error": "An error occurred while processing your request"}, status_code=500)