from fastapi import Request, HTTPException, APIRouter, Body
from fastapi.responses import StreamingResponse
import logging
import json
from pydantic import BaseModel
from typing import AsyncGenerator, Dict
from datetime import datetime

from app.services.chat.lk_chat import lk_chat_process
from app.services.redis_service import RedisChatStorage

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
        
        # Save user message immediately with timestamp
        chat_data = await RedisChatStorage.get_chat(
            user_query['agent_id'], 
            user_query['room_name']
        ) or {"messages": [], "response_metadata": {}}

        # Check if this exact message was just saved (within last second)
        current_time = datetime.utcnow()
        recent_messages = [
            msg for msg in chat_data["messages"] 
            if (msg["role"] == "user" and 
                msg["content"] == user_query['message'] and
                (current_time - datetime.fromisoformat(msg["timestamp"])).total_seconds() < 1)
        ]

        # Only save if not a duplicate
        if not recent_messages:
            chat_data["messages"].append({
                "role": "user",
                "content": user_query['message'],
                "timestamp": current_time.isoformat()
            })
            
            await RedisChatStorage.save_chat(
                user_query['agent_id'],
                user_query['room_name'],
                chat_data
            )

        async def event_generator():
            # Continue with existing streaming logic...
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
    """Save complete chat response to Redis - only for assistant messages"""
    try:
        agent_id = response.get("agent_id")
        room_name = response.get("room_name")
        response_data = response.get("response")

        print("\n=== Save Response Debug ===")
        print(f"Saving response for agent_id: {agent_id}, room_name: {room_name}")
        print(f"Response data: {response_data}")

        if not all([agent_id, room_name, response_data]):
            raise HTTPException(status_code=400, detail="Missing required fields")
            
        # Only process assistant messages
        if response_data.get("role") != "assistant":
            return {"status": "skipped", "message": "Only assistant messages should be saved here"}

        # Get existing chat data
        chat_data = await RedisChatStorage.get_chat(agent_id, room_name)
        if not chat_data:
            chat_data = {"messages": [], "response_metadata": {}}

        print(f"Current messages in Redis: {len(chat_data['messages'])}")
        
        # Check for existing message with same content
        existing_messages = [
            msg for msg in chat_data["messages"] 
            if (msg.get("role") == "assistant" and 
                msg.get("content") == response_data.get("content"))
        ]

        if existing_messages:
            print(f"Message with content already exists, skipping save")
            return {"status": "skipped", "message": "Message already exists"}

        # Add new message with timestamp
        current_time = datetime.utcnow()
        chat_data["messages"].append({
            "role": "assistant",
            "content": response_data["content"],
            "response_id": response_data.get("response_id"),
            "timestamp": current_time.isoformat()
        })

        # Save to Redis
        await RedisChatStorage.save_chat(agent_id, room_name, chat_data)
        print(f"Final message count in Redis: {len(chat_data['messages'])}")
        
        return {"status": "success"}

    except Exception as e:
        logger.error(f"Error saving complete response: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save response")

