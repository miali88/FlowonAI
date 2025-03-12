import pytest
from unittest.mock import patch, MagicMock
import json

from fastapi.testclient import TestClient
from app.main import app  # Adjust import based on your app structure

client = TestClient(app)

# Sample webhook payload
sample_webhook_payload = {
    "type": "user.created",
    "data": {
        "id": "user_test_123456",
        "first_name": "John",
        "last_name": "Doe",
        "email_addresses": [
            {
                "id": "email_123",
                "email_address": "john.doe@example.com"
            }
        ],
        "primary_email_address_id": "email_123",
        "created_at": 1625097600000
    }
}

@pytest.mark.asyncio
@patch('app.api.routes.clerk.Webhook')
@patch('app.api.routes.clerk.post_user')
@patch('app.api.routes.clerk.send_notification_email')
async def test_clerk_webhook_user_created(mock_send_email, mock_post_user, mock_webhook):
    # Configure mocks
    mock_webhook_instance = MagicMock()
    mock_webhook.return_value = mock_webhook_instance
    mock_webhook_instance.verify.return_value = sample_webhook_payload
    
    mock_post_user.return_value = {"status": "success"}
    mock_send_email.return_value = True
    
    # Make the request
    response = client.post(
        "/api/v1/clerk",
        json=sample_webhook_payload,
        headers={
            "svix-id": "test-id",
            "svix-timestamp": "2023-01-01T00:00:00Z",
            "svix-signature": "test-signature"
        }
    )
    
    # Verify response
    assert response.status_code == 200
    assert response.json() == {"status": "success"}
    
    # Verify post_user was called
    mock_post_user.assert_called_once_with(sample_webhook_payload)
    
    # Verify send_notification_email was called
    mock_send_email.assert_called_once()
    
    # Check email subject and content
    call_args = mock_send_email.call_args[0]
    assert "John Doe" in call_args[0]  # Subject
    assert "john.doe@example.com" in call_args[1]  # Body

@pytest.mark.asyncio
@patch('app.api.routes.clerk.Webhook')
@patch('app.api.routes.clerk.post_user')
@patch('app.api.routes.clerk.send_notification_email')
async def test_clerk_webhook_test_event(mock_send_email, mock_post_user, mock_webhook):
    # Create a test webhook payload
    test_payload = {
        "type": "user.created",
        "data": {
            "id": "user_test_123456",
            "webhook_test": True
        }
    }
    
    # Configure mocks
    mock_webhook_instance = MagicMock()
    mock_webhook.return_value = mock_webhook_instance
    mock_webhook_instance.verify.return_value = test_payload
    
    # Make the request
    response = client.post(
        "/api/v1/clerk",
        json=test_payload,
        headers={
            "svix-id": "test-id",
            "svix-timestamp": "2023-01-01T00:00:00Z",
            "svix-signature": "test-signature"
        }
    )
    
    # Verify response
    assert response.status_code == 200
    assert response.json() == {"status": "success", "is_test": True}
    
    # Verify post_user was not called
    mock_post_user.assert_not_called()
    
    # Verify send_notification_email was not called
    mock_send_email.assert_not_called()

@pytest.mark.asyncio
@patch('app.api.routes.clerk.Webhook')
@patch('app.api.routes.clerk.post_user')
@patch('app.api.routes.clerk.send_notification_email')
async def test_clerk_webhook_email_failure(mock_send_email, mock_post_user, mock_webhook):
    # Configure mocks
    mock_webhook_instance = MagicMock()
    mock_webhook.return_value = mock_webhook_instance
    mock_webhook_instance.verify.return_value = sample_webhook_payload
    
    mock_post_user.return_value = {"status": "success"}
    mock_send_email.return_value = False  # Email sending fails
    
    # Make the request
    response = client.post(
        "/api/v1/clerk",
        json=sample_webhook_payload,
        headers={
            "svix-id": "test-id",
            "svix-timestamp": "2023-01-01T00:00:00Z",
            "svix-signature": "test-signature"
        }
    )
    
    # Verify response is still successful (email failure shouldn't fail the request)
    assert response.status_code == 200
    assert response.json() == {"status": "success"} 