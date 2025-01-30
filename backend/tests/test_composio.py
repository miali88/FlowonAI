import pytest
import json
from fastapi import HTTPException
from unittest.mock import Mock, patch, AsyncMock
from urllib.parse import urlparse, parse_qs

# Import the router and functions
from app.api.routes.composio import (
    connection_handler,
    new_connection_handler
)

@pytest.mark.asyncio
async def test_connection_handler():
    # Arrange
    user_id = "test_user_id"
    mock_connections = [
        Mock(appName="app1"),
        Mock(appName="app2")
    ]
    mock_entity = Mock()
    mock_entity.get_connections.return_value = mock_connections
    
    # Act
    with patch('app.api.routes.composio.composio_client.get_entity', return_value=mock_entity):
        result = await connection_handler(user_id)
    
    # Assert
    assert result.status_code == 200
    assert result.body.decode() == '{"connections":["app1","app2"]}'

@pytest.mark.asyncio
async def test_new_connection_handler():
    # Arrange
    user_id = "test_user_id"
    app_name = "test_app"
    
    mock_request = Mock()
    mock_request.redirectUrl = "https://example.com?client_id=test_client_id"
    mock_request.connectedAccountId = "test_connected_account_id"
    
    mock_entity = Mock()
    mock_entity.initiate_connection.return_value = mock_request
    
    mock_toolset = Mock()
    mock_toolset.get_entity.return_value = mock_entity
    
    # Act
    with patch('app.api.routes.composio.ComposioToolSet', return_value=mock_toolset):
        result = await new_connection_handler(user_id, app_name)
    
    # Assert
    assert result.status_code == 200
    expected_content = {
        "client_id": "test_client_id",
        "connected_account_id": "test_connected_account_id",
        "redirectUrl": "https://example.com?client_id=test_client_id"
    }
    assert json.loads(result.body.decode()) == expected_content

@pytest.mark.asyncio
async def test_new_connection_handler_no_client_id():
    # Arrange
    user_id = "test_user_id"
    app_name = "test_app"
    
    mock_request = Mock()
    mock_request.redirectUrl = "https://example.com"  # URL without client_id
    mock_request.connectedAccountId = "test_connected_account_id"
    
    mock_entity = Mock()
    mock_entity.initiate_connection.return_value = mock_request
    
    mock_toolset = Mock()
    mock_toolset.get_entity.return_value = mock_entity
    
    # Act
    with patch('app.api.routes.composio.ComposioToolSet', return_value=mock_toolset):
        result = await new_connection_handler(user_id, app_name)
    
    # Assert
    assert result.status_code == 200
    expected_content = {
        "client_id": None,
        "connected_account_id": "test_connected_account_id",
        "redirectUrl": "https://example.com"
    }
    assert json.loads(result.body.decode()) == expected_content
