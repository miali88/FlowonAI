import pytest
from fastapi import HTTPException
from unittest.mock import Mock, patch, AsyncMock
from fastapi.responses import RedirectResponse, HTMLResponse, JSONResponse

from app.api.routes.nylas_service import webhook, nylas_auth, oauth_exchange

@pytest.mark.asyncio
async def test_webhook():
    # Arrange
    mock_request = Mock()
    
    # Act
    response = await webhook(mock_request)
    
    # Assert
    assert isinstance(response, JSONResponse)
    assert response.status_code == 200
    assert response.body == b'{"message":"Hello, World!"}'

@pytest.mark.asyncio
async def test_nylas_auth():
    # Arrange
    expected_auth_url = "https://api.nylas.com/oauth/authorize"
    
    # Create a mock Nylas client with the auth.url_for_oauth2 method
    mock_auth = Mock()
    mock_auth.url_for_oauth2 = Mock(return_value=expected_auth_url)
    mock_nylas = Mock()
    mock_nylas.auth = mock_auth
    
    mock_config = {
        "client_id": "test_client_id",
        "callback_uri": "http://test.callback"
    }
    
    # Act
    with patch('app.api.routes.nylas_service.nylas', mock_nylas), \
         patch('app.api.routes.nylas_service.nylas_config', mock_config):
        response = await nylas_auth()
    
    # Assert
    assert isinstance(response, RedirectResponse)
    assert response.status_code == 307
    mock_auth.url_for_oauth2.assert_called_once_with({
        "client_id": mock_config["client_id"],
        "redirect_uri": mock_config["callback_uri"]
    })

@pytest.mark.asyncio
async def test_oauth_exchange_success():
    # Arrange
    mock_exchange = Mock()
    mock_exchange.grant_id = "test_grant_id"
    
    # Create a mock Nylas client with the auth.exchange_code_for_token method
    mock_auth = Mock()
    mock_auth.exchange_code_for_token = Mock(return_value=mock_exchange)
    mock_nylas = Mock()
    mock_nylas.auth = mock_auth
    
    mock_config = {
        "client_id": "test_client_id",
        "callback_uri": "http://test.callback"
    }
    
    # Act
    with patch('app.api.routes.nylas_service.nylas', mock_nylas), \
         patch('app.api.routes.nylas_service.nylas_config', mock_config):
        response = await oauth_exchange("test_code")
    
    # Assert
    assert isinstance(response, HTMLResponse)
    assert response.status_code == 200
    assert "Your account has successfully been linked" in response.body.decode()
    mock_auth.exchange_code_for_token.assert_called_once_with({
        "redirect_uri": mock_config["callback_uri"],
        "code": "test_code",
        "client_id": mock_config["client_id"]
    })

@pytest.mark.asyncio
async def test_oauth_exchange_no_code():
    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await oauth_exchange("")
    
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "No authorization code returned from Nylas"

@pytest.mark.asyncio
async def test_oauth_exchange_failure():
    # Arrange
    mock_exchange = Mock(side_effect=Exception("Exchange failed"))
    
    # Act & Assert
    with patch('app.api.routes.nylas_service.nylas.auth.exchange_code_for_token', mock_exchange):
        with pytest.raises(HTTPException) as exc_info:
            await oauth_exchange("test_code")
    
    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "Failed to exchange authorization code for token" 