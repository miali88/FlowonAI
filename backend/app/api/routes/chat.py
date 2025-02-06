from fastapi import Request, HTTPException, APIRouter, Body
from fastapi.responses import StreamingResponse
import logging
import json
from pydantic import BaseModel
from services.chat.lk_chat import lk_chat_process, get_chat_rag_results
from typing import AsyncGenerator, Dict
from services.redis_service import RedisChatStorage

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

@router.get("/history/{agent_id}/{room_name}")
async def get_history(agent_id: str, room_name: str):
    try:
        chat_data = await RedisChatStorage.get_chat(agent_id, room_name)
        return chat_data or {"messages": [], "response_metadata": {}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/message")
async def send_message(request: Dict):
    try:
        agent_id = request["agent_id"]
        room_name = request["room_name"]
        message = request["message"]
        
        # Get existing chat or create new one
        chat_data = await RedisChatStorage.get_chat(agent_id, room_name) or {
            "messages": [],
            "response_metadata": {}
        }
        
        # Process message with your existing logic
        # ...
        
        # Save updated chat history
        await RedisChatStorage.save_chat(agent_id, room_name, chat_data)
        
        return {"success": True, "chat_data": chat_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/existing-chat")
async def get_existing_chat(agent_id: str, room_name: str):
    """Get existing chat data if available"""
    try:
        chat_data = await RedisChatStorage.get_chat_if_exists(agent_id, room_name)
        return {
            "exists": chat_data is not None,
            "chat_data": chat_data
        }
    except Exception as e:
        logger.error(f"Error fetching existing chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/save-response")
async def save_complete_response(
    request: Request,
    response: dict = Body(...),
):
    """Save complete chat response to Redis"""
    try:
        agent_id = response.get("agent_id")
        room_name = response.get("room_name")
        response_data = response.get("response")

        if not all([agent_id, room_name, response_data]):
            raise HTTPException(status_code=400, detail="Missing required fields")

        # Get existing chat data
        chat_data = await RedisChatStorage.get_chat(agent_id, room_name)
        if not chat_data:
            chat_data = {"messages": [], "response_metadata": {}}

        # Update the specific message with complete response
        for msg in chat_data["messages"]:
            if (msg.get("role") == "assistant" and 
                msg.get("response_id") == response_data.get("response_id")):
                msg["content"] = response_data["content"]
                break

        # Save updated chat data
        await RedisChatStorage.save_chat(agent_id, room_name, chat_data)
        print("Successfully saved complete response to Redis, agent_id: ", agent_id, "room_name: ", room_name, "chat_data: ", chat_data)
        return {"status": "success"}


    except Exception as e:
        logger.error(f"Error saving complete response: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
