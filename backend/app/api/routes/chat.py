from fastapi import Request, HTTPException, APIRouter
from fastapi.responses import StreamingResponse
import logging
import json
from pydantic import BaseModel
from services.chat.lk_chat import lk_chat_process, get_chat_rag_results
from typing import AsyncGenerator

router = APIRouter()
logger = logging.getLogger(__name__)


class ChatMessage(BaseModel):
    message: str
    agent_id: str
    room_name: str


@router.post("/")
async def chat_message(request: Request) -> StreamingResponse:
    try:
        user_query = await request.json()
    except Exception as e:
        logger.error(f"Error parsing request: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

    # Validate required fields before proceeding
    if not all(key in user_query for key in ['message', 'agent_id', 'room_name']):
        raise HTTPException(
            status_code=400,
            detail="Missing required fields"
        )

    try:
        async def event_generator() -> AsyncGenerator[str, None]:
            response_id = None
            has_source = False
            try:
                async for chunk in lk_chat_process(
                    user_query['message'],
                    user_query['agent_id'],
                    user_query['room_name'],
                ):
                    if chunk:
                        # Track if we've seen RAG results and get its response_id
                        if (
                            isinstance(chunk, str) and
                            chunk.startswith("[RAG_RESULTS]:")
                        ):
                            has_source = True
                            continue

                        # Check if this is a RAG response_id message
                        try:
                            chunk_data = json.loads(chunk)
                            if (
                                isinstance(chunk_data, dict) and
                                "response_id" in chunk_data
                            ):
                                response_id = chunk_data["response_id"]
                                continue  # Skip yielding this to the client
                        except json.JSONDecodeError:
                            # If it's not JSON, it's a regular content chunk
                            pass

                        # Yield the chunk with response_id and has_source flag
                        yield f"data: {json.dumps({'response': {'answer': str(chunk), 'response_id': response_id, 'has_source': has_source}})}\n\n"

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
