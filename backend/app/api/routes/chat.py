from fastapi import Request, HTTPException, APIRouter
from fastapi.responses import StreamingResponse
import logging
import json
from pydantic import BaseModel
from services.chat.lk_chat import lk_chat_process, get_chat_rag_results

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
            response_id = None
            try:
                async for chunk in lk_chat_process(
                    user_query['message'], 
                    user_query['agent_id'],
                    user_query['room_name'],
                ):
                    if chunk:
                        # Skip RAG results chunks
                        if isinstance(chunk, str) and chunk.startswith("[RAG_RESULTS]:"):
                            continue

                        # Check if this is the response_id message
                        try:
                            chunk_data = json.loads(chunk)
                            if chunk_data.get("type") == "response_id":
                                response_id = chunk_data["response_id"]
                                continue  # Skip yielding this to the client
                        except json.JSONDecodeError:
                            # If it's not JSON, it's a regular content chunk
                            pass

                        # Yield the chunk with the response_id
                        yield f"data: {json.dumps({'response': {'answer': str(chunk), 'response_id': response_id}})}\n\n"
                
                yield "data: [DONE]\n\n"
            except Exception as e:
                logger.error(f"Error in stream: {str(e)}", exc_info=True)
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
                yield "data: [DONE]\n\n"

        return StreamingResponse(
            event_generator(), 
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )

    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/get_sources")
async def get_sources(request: Request):
    try:
        # Get query parameters
        params = dict(request.query_params)
        if not all(key in params for key in ['agent_id', 'room_name', 'response_id']):
            raise HTTPException(status_code=400, detail="Missing required parameters: agent_id, room_name, response_id")
        
        try:
            rag_results = await get_chat_rag_results(
                agent_id=params['agent_id'],
                room_name=params['room_name'],
                response_id=params['response_id']
            )
            return {"sources": rag_results}
            
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving sources: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")