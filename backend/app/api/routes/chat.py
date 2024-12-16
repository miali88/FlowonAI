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
    room_name: str

@router.post("/")
async def chat_message(request: Request):    

    try:
        user_query = await request.json()
        print("\n /chat endpoint, data:")
        print(user_query)

        if not all(key in user_query for key in ['message', 'agent_id', 'room_name']):
            raise HTTPException(status_code=400, detail="Missing required fields")

        async def event_generator():
            full_response = []
            try:
                async for chunk in lk_chat_process(
                    user_query['message'], 
                    user_query['agent_id'],
                    user_query['room_name']
                ):
                    if isinstance(chunk, str):
                        if chunk.startswith("[RAG_RESULTS]:"):
                            # Send RAG results as a separate event type
                            yield f"data: {json.dumps({'rag_results': chunk[13:].strip()})}\n\n"
                        else:
                            # Send normal response chunks
                            full_response.append(str(chunk))
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
