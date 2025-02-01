import pytest
from fastapi import HTTPException, Request
from unittest.mock import Mock, patch, AsyncMock
import json

from app.api.routes.chat import chat_message, ChatMessage

@pytest.mark.asyncio
async def test_chat_message_success():
    # Arrange
    mock_req = Mock()
    mock_req.json = AsyncMock(return_value={
        "message": "Hello",
        "agent_id": "test_agent",
        "room_name": "test_room"
    })
    
    # Simulate streaming chunks
    async def mock_lk_chat_process(*args, **kwargs):
        yield "Hello"  # Regular message
        yield "[RAG_RESULTS]:some_results"  # RAG results
        yield json.dumps({"response_id": "123"})  # Response ID
        yield "How can I help?"  # Regular message

    # Act
    with patch('app.api.routes.chat.lk_chat_process', side_effect=mock_lk_chat_process):
        response = await chat_message(mock_req)
        
        # Collect all streaming responses
        chunks = []
        async for chunk in response.body_iterator:
            chunks.append(chunk)  # Remove decode() as chunks are already strings

    # Assert
    assert response.media_type == "text/event-stream"
    assert response.headers["Cache-Control"] == "no-cache"
    assert response.headers["Connection"] == "keep-alive"
    
    # Verify the chunks
    assert len(chunks) == 3  # 2 content chunks + [DONE]
    
    # Parse and verify first chunk
    first_chunk = json.loads(chunks[0].replace("data: ", ""))
    assert first_chunk["response"]["answer"] == "Hello"
    assert first_chunk["response"]["response_id"] is None
    assert first_chunk["response"]["has_source"] is False
    
    # Parse and verify second chunk
    second_chunk = json.loads(chunks[1].replace("data: ", ""))
    assert second_chunk["response"]["answer"] == "How can I help?"
    assert second_chunk["response"]["response_id"] == "123"
    assert second_chunk["response"]["has_source"] is True
    
    # Verify DONE message
    assert chunks[-1] == "data: [DONE]\n\n"

@pytest.mark.asyncio
async def test_chat_message_missing_fields():
    # Arrange
    mock_req = Mock()
    mock_req.json = AsyncMock(return_value={
        "message": "Hello"
        # Missing agent_id and room_name
    })

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await chat_message(mock_req)
    
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Missing required fields"

@pytest.mark.asyncio
async def test_chat_message_processing_error():
    # Arrange
    mock_req = Mock()
    mock_req.json = AsyncMock(return_value={
        "message": "Hello",
        "agent_id": "test_agent",
        "room_name": "test_room"
    })
    
    # Simulate an error in the chat process
    async def mock_lk_chat_process(*args, **kwargs):
        raise Exception("Chat processing error")
        yield 

    # Act
    with patch('app.api.routes.chat.lk_chat_process', new=mock_lk_chat_process):
        response = await chat_message(mock_req)
        
        # Collect all streaming responses
        chunks = []
        async for chunk in response.body_iterator:
            chunks.append(chunk)

    # Assert
    assert len(chunks) == 2  # Error message + [DONE]
    
    # Parse and verify error chunk
    error_chunk = json.loads(chunks[0].replace("data: ", ""))
    assert "error" in error_chunk
    assert "Chat processing error" in error_chunk["error"]
    
    # Verify DONE message
    assert chunks[-1] == "data: [DONE]\n\n"

@pytest.mark.asyncio
async def test_chat_message_request_error():
    # Arrange
    mock_req = Mock()
    mock_req.json = AsyncMock(side_effect=Exception("Request parsing error"))

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await chat_message(mock_req)
    
    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "Internal server error" 