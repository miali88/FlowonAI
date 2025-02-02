import pytest
from fastapi import HTTPException
from unittest.mock import Mock, patch, AsyncMock

# Import the router and functions
from app.api.routes.agents import (
    new_agent_handler,
    get_agents_handler,
    update_agent_handler,
    delete_agent_handler,
    get_agent_content_handler,
    auto_create_agent_handler,
    check_agent_status
)

@pytest.mark.asyncio
async def test_new_agent_handler():
    # Arrange
    mock_req = Mock()
    mock_req.json = AsyncMock(return_value={
        "name": "Test Agent",
        "description": "Test Description"
    })
    
    expected_agent = {
        "id": "test_agent_id",
        "name": "Test Agent",
        "description": "Test Description",
        "userId": "test_user_id"
    }
    
    # Act
    with patch('app.api.routes.agents.create_agent', AsyncMock(return_value=expected_agent)):
        result = await new_agent_handler(mock_req, "test_user_id")
    
    # Assert
    assert result == expected_agent

@pytest.mark.asyncio
async def test_get_agents_handler():
    # Arrange
    expected_agents = [
        {"id": "1", "name": "Agent 1"},
        {"id": "2", "name": "Agent 2"}
    ]
    
    # Act
    with patch('app.api.routes.agents.get_agents', AsyncMock(return_value=expected_agents)):
        result = await get_agents_handler("test_user_id")
    
    # Assert
    assert result == expected_agents

@pytest.mark.asyncio
async def test_update_agent_handler():
    # Arrange
    mock_req = Mock()
    mock_req.json = AsyncMock(return_value={
        "name": "Updated Agent",
        "description": "Updated Description"
    })
    
    expected_update = {
        "id": "test_agent_id",
        "name": "Updated Agent",
        "description": "Updated Description"
    }
    
    # Act
    with patch('app.api.routes.agents.update_agent', AsyncMock(return_value=expected_update)):
        result = await update_agent_handler("test_agent_id", mock_req)
    
    # Assert
    assert result == expected_update

@pytest.mark.asyncio
async def test_delete_agent_handler():
    # Act
    with patch('app.api.routes.agents.delete_agent', AsyncMock(return_value=None)):
        result = await delete_agent_handler("test_agent_id", "test_user_id")
    
    # Assert
    assert result == {"message": "Agent deleted successfully"}

@pytest.mark.asyncio
async def test_get_agent_content_handler():
    # Arrange
    expected_content = {
        "id": "test_agent_id",
        "content": "Test content"
    }
    
    # Act
    with patch('app.api.routes.agents.get_agent_content', AsyncMock(return_value=expected_content)):
        result = await get_agent_content_handler("test_agent_id")
    
    # Assert
    assert result == expected_content

@pytest.mark.asyncio
async def test_auto_create_agent_handler():
    # Arrange
    mock_req = Mock()
    mock_req.json = AsyncMock(return_value={"url": "https://test.com"})
    
    expected_response = {
        "status": "success",
        "message": "Agent creation started",
        "agent_id": "test_agent_id"
    }
    
    # Act
    with patch('app.api.routes.agents.create_agents_from_urls', AsyncMock(return_value="test_agent_id")):
        result = await auto_create_agent_handler(mock_req, "test_user_id")
    
    # Assert
    assert result == expected_response

@pytest.mark.asyncio
async def test_auto_create_agent_handler_missing_url():
    # Arrange
    mock_req = Mock()
    mock_req.json = AsyncMock(return_value={})
    
    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await auto_create_agent_handler(mock_req, "test_user_id")
    
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "URL is required"

@pytest.mark.asyncio
async def test_check_agent_status():
    # Arrange
    mock_req = Mock()
    expected_response = {
        "status": "completed",
        "agent_url": "https://flowon.ai/iframe?agentId=AGENT_ID"
    }
    
    # Act
    result = await check_agent_status(mock_req, "test_user_id")
    
    # Assert
    assert result == expected_response 