import pytest
from unittest.mock import patch, MagicMock

from app.api.routes.nylas_service import send_notification_email, get_active_grant_id

@pytest.mark.asyncio
@patch('app.api.routes.nylas_service.get_active_grant_id')
@patch('app.api.routes.nylas_service.nylas')
async def test_send_notification_email_success(mock_nylas, mock_get_grant_id):
    # Configure the mocks
    mock_get_grant_id.return_value = "test_grant_id"
    mock_message = MagicMock()
    mock_message.id = "msg_123456"
    mock_nylas.messages.send.return_value = mock_message
    
    # Call the function
    result = await send_notification_email(
        subject="Test Subject",
        body="Test Body",
        recipient_email="test@example.com"
    )
    
    # Verify the result is True
    assert result is True
    
    # Verify nylas.messages.send was called with correct parameters
    mock_nylas.messages.send.assert_called_once()
    
    # Check the draft contains correct information
    call_args = mock_nylas.messages.send.call_args[0][0]
    assert call_args["subject"] == "Test Subject"
    assert call_args["body"] == "Test Body"
    assert call_args["to"][0]["email"] == "test@example.com"
    
    # Verify grant_id was used
    assert mock_nylas.messages.send.call_args[1]["grant_id"] == "test_grant_id"

@pytest.mark.asyncio
@patch('app.api.routes.nylas_service.get_active_grant_id')
@patch('app.api.routes.nylas_service.nylas')
async def test_send_notification_email_default_recipient(mock_nylas, mock_get_grant_id):
    # Configure the mocks
    mock_get_grant_id.return_value = "test_grant_id"
    mock_message = MagicMock()
    mock_message.id = "msg_123456"
    mock_nylas.messages.send.return_value = mock_message
    
    # Call the function without specifying recipient
    result = await send_notification_email(
        subject="Test Subject",
        body="Test Body"
    )
    
    # Verify the result is True
    assert result is True
    
    # Check the default recipient was used
    call_args = mock_nylas.messages.send.call_args[0][0]
    assert call_args["to"][0]["email"] == "gabrielhsantosmoura@gmail.com"

@pytest.mark.asyncio
@patch('app.api.routes.nylas_service.get_active_grant_id')
@patch('app.api.routes.nylas_service.nylas')
@patch('app.api.routes.nylas_service.logging')
async def test_send_notification_email_error(mock_logging, mock_nylas, mock_get_grant_id):
    # Configure the mocks
    mock_get_grant_id.return_value = "test_grant_id"
    mock_nylas.messages.send.side_effect = Exception("Test error")
    
    # Call the function
    result = await send_notification_email(
        subject="Test Subject",
        body="Test Body"
    )
    
    # Verify the result is False
    assert result is False
    
    # Verify the error was logged
    mock_logging.error.assert_called_once()
    assert "Failed to send notification email" in mock_logging.error.call_args[0][0]

@pytest.mark.asyncio
@patch('app.api.routes.nylas_service.get_active_grant_id')
@patch('app.api.routes.nylas_service.logging')
async def test_send_notification_email_no_grant_id(mock_logging, mock_get_grant_id):
    # Configure the mock to return None (no grant_id available)
    mock_get_grant_id.return_value = None
    
    # Call the function
    result = await send_notification_email(
        subject="Test Subject",
        body="Test Body"
    )
    
    # Verify the result is False
    assert result is False
    
    # Verify the error was logged
    mock_logging.error.assert_called_once()
    assert "No Nylas grant_id available" in mock_logging.error.call_args[0][0] 