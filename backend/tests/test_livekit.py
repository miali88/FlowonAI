import pytest
from fastapi import Request, BackgroundTasks
from unittest.mock import Mock, AsyncMock, patch

from app.api.routes.livekit import get_token

@pytest.mark.asyncio
async def test_get_token_success():
    # Arrange
    mock_request = Mock(spec=Request)
    mock_request.query_params = {
        "agent_id": "test_agent_id",
        "user_id": "test_user_id",
        "medium": "voice"
    }
    
    mock_background_tasks = Mock(spec=BackgroundTasks)
    
    expected_response = {
        "accessToken": "mock_token",
        "url": "wss://mock.livekit.url",
        "roomName": "mock_room_name"
    }
    
    # Act
    with patch('app.api.routes.livekit.token_gen', 
              AsyncMock(return_value=("mock_token", "wss://mock.livekit.url", "mock_room_name"))):
        result = await get_token(mock_request, mock_background_tasks)
    
    # Assert
    assert result == expected_response

@pytest.mark.asyncio
async def test_get_token_missing_agent_id():
    # Arrange
    mock_request = Mock(spec=Request)
    mock_request.query_params = {
        "user_id": "test_user_id",
        "medium": "voice"
    }
    
    mock_background_tasks = Mock(spec=BackgroundTasks)
    
    # Act & Assert
    with patch('app.api.routes.livekit.token_gen', 
              AsyncMock(return_value=("mock_token", "wss://mock.livekit.url", "mock_room_name"))) as mock_token_gen:
        result = await get_token(mock_request, mock_background_tasks)
        # Verify token_gen was called with None for agent_id
        mock_token_gen.assert_awaited_once_with(None, "test_user_id", mock_background_tasks, "voice")
        assert result == {
            "accessToken": "mock_token",
            "url": "wss://mock.livekit.url",
            "roomName": "mock_room_name"
        }

@pytest.mark.asyncio
async def test_get_token_missing_user_id():
    # Arrange
    mock_request = Mock(spec=Request)
    mock_request.query_params = {
        "agent_id": "test_agent_id",
        "medium": "voice"
    }
    
    mock_background_tasks = Mock(spec=BackgroundTasks)
    
    # Act & Assert
    with patch('app.api.routes.livekit.token_gen', 
              AsyncMock(return_value=("mock_token", "wss://mock.livekit.url", "mock_room_name"))) as mock_token_gen:
        result = await get_token(mock_request, mock_background_tasks)
        # Verify token_gen was called with None for user_id
        mock_token_gen.assert_awaited_once_with("test_agent_id", None, mock_background_tasks, "voice")
        assert result == {
            "accessToken": "mock_token",
            "url": "wss://mock.livekit.url",
            "roomName": "mock_room_name"
        }

@pytest.mark.asyncio
async def test_get_token_missing_medium():
    # Arrange
    mock_request = Mock(spec=Request)
    mock_request.query_params = {
        "agent_id": "test_agent_id",
        "user_id": "test_user_id"
    }
    
    mock_background_tasks = Mock(spec=BackgroundTasks)
    
    # Act & Assert
    with patch('app.api.routes.livekit.token_gen', 
              AsyncMock(return_value=("mock_token", "wss://mock.livekit.url", "mock_room_name"))) as mock_token_gen:
        result = await get_token(mock_request, mock_background_tasks)
        # Verify token_gen was called with None for medium
        mock_token_gen.assert_awaited_once_with("test_agent_id", "test_user_id", mock_background_tasks, None)
        assert result == {
            "accessToken": "mock_token",
            "url": "wss://mock.livekit.url",
            "roomName": "mock_room_name"
        } 