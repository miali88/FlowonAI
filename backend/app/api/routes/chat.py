from fastapi import Request, HTTPException, APIRouter
from fastapi.responses import StreamingResponse
import logging
import json
from pydantic import BaseModel
from services.chat.lk_chat import lk_chat_process

router = APIRouter()
logger = logging.getLogger(__name__)

class ChatMessage(BaseModel):
    message: str
    agent_id: str

@router.post("/")
async def chat_message(request: Request):    
    print("\n /chat endpoint, data:")

    try:
        user_query = await request.json()
        agent_id = user_query.get("agent_id")
        if not all(key in user_query for key in ['message', 'agent_id']):
            raise HTTPException(status_code=400, detail="Missing required fields")

        async def event_generator():
            try:
                seen_chunks = set()  # Track all seen chunks
                async for chunk in lk_chat_process(
                    user_query['message'], 
                    agent_id
                ):
                    chunk_hash = hash(chunk)  # Create a hash of the chunk
                    if chunk and chunk_hash not in seen_chunks:
                        seen_chunks.add(chunk_hash)
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
