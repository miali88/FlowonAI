from fastapi import Request, HTTPException, APIRouter
from fastapi.responses import StreamingResponse
import logging
import json

from services.chat.lk_chat import lk_chat_process

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/")
async def chat_message(request: Request):
    print("\n /chat endpoint")
    try:
        user_query = await request.json()
        
        if not all(key in user_query for key in ['message', 'agent_id']):
            raise HTTPException(status_code=400, detail="Missing required fields")

        async def event_generator():
            try:
                # Track the last chunk to avoid duplicates
                last_chunk = ""
                async for chunk in lk_chat_process(
                    user_query['message'], 
                    user_query['agent_id']
                ):
                    if chunk and chunk != last_chunk:  # Only yield if chunk is new
                        last_chunk = chunk
                        yield f"data: {json.dumps({'response': {'answer': str(chunk)}})}\n\n"
            except Exception as e:
                logger.error(f"Error in stream: {str(e)}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
            finally:
                yield "data: [DONE]\n\n"

        return StreamingResponse(
            event_generator(), 
            media_type="text/event-stream"
        )

    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
