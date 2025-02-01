import pytest
from fastapi import HTTPException, Request
from unittest.mock import Mock, patch, AsyncMock
import json
from datetime import datetime
import stripe
from svix.webhooks import WebhookVerificationError

from app.api.routes.clerk import handle_clerk_event, post_user

@pytest.mark.asyncio
async def test_handle_clerk_event_success():
    # Arrange
    mock_req = Mock()
    mock_req.body = AsyncMock(return_value=json.dumps({
        "type": "user.created",
        "data": {
            "id": "test_user_id",
            "email_addresses": [
                {"id": "email_1", "email_address": "test@example.com"}
            ],
            "primary_email_address_id": "email_1",
            "first_name": "Test",
            "last_name": "User",
            "created_at": 1234567890000,
            "updated_at": 1234567890000,
            "last_sign_in_at": 1234567890000
        }
    }).encode())

    mock_headers = {
        "svix-id": "test_id",
        "svix-timestamp": "test_timestamp",
        "svix-signature": "test_signature"
    }

    # Use a proper base64 encoded webhook secret
    mock_secret = "whsec_/w7JVXqYqUxXEWxvagxtHoE+jHUxl73G8azglHtx/AU="

    # Act
    with patch('app.api.routes.clerk.Webhook.verify') as mock_verify, \
         patch('app.api.routes.clerk.post_user') as mock_post_user, \
         patch('os.getenv', return_value=mock_secret):
        
        # Mock the verify method to return the event data
        mock_verify.return_value = {
            "type": "user.created",
            "data": json.loads(mock_req.body.return_value.decode())["data"]
        }
        
        response = await handle_clerk_event(
            mock_req,
            svix_id=mock_headers["svix-id"],
            svix_timestamp=mock_headers["svix-timestamp"],
            svix_signature=mock_headers["svix-signature"]
        )

    # Assert
    assert response == {"status": "success"}
    mock_post_user.assert_called_once()

@pytest.mark.asyncio
async def test_handle_clerk_event_missing_secret():
    # Arrange
    mock_req = Mock()
    # Make sure to mock the body method as an AsyncMock
    mock_req.body = AsyncMock(return_value=json.dumps({
        "type": "user.created",
        "data": {}
    }).encode())
    
    # Act & Assert
    with patch('os.getenv', return_value=None):
        with pytest.raises(HTTPException) as exc_info:
            await handle_clerk_event(mock_req, "test_id", "test_timestamp", "test_signature")
    
    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "CLERK_SIGNING_SECRET not set"

@pytest.mark.asyncio
async def test_handle_clerk_event_invalid_signature():
    # Arrange
    mock_req = Mock()
    mock_req.body = AsyncMock(return_value=json.dumps({
        "type": "user.created",
        "data": {}
    }).encode())
    
    # Use a proper base64 encoded webhook secret
    mock_secret = "whsec_/w7JVXqYqUxXEWxvagxtHoE+jHUxl73G8azglHtx/AU="
    
    # Act & Assert
    with patch('os.getenv', return_value=mock_secret), \
         patch('app.api.routes.clerk.Webhook.verify', side_effect=WebhookVerificationError):
        with pytest.raises(HTTPException) as exc_info:
            await handle_clerk_event(mock_req, "test_id", "test_timestamp", "test_signature")
    
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Invalid webhook signature"

@pytest.mark.asyncio
async def test_post_user_success():
    # Arrange
    test_payload = {
        "data": {
            "id": "test_user_id",
            "email_addresses": [
                {"id": "email_1", "email_address": "test@example.com"}
            ],
            "primary_email_address_id": "email_1",
            "first_name": "Test",
            "last_name": "User",
            "created_at": 1234567890000,
            "updated_at": 1234567890000,
            "last_sign_in_at": 1234567890000
        }
    }

    mock_stripe_customer = Mock()
    mock_stripe_customer.id = "stripe_customer_id"

    # Act
    with patch('stripe.Customer.create', return_value=mock_stripe_customer), \
         patch('app.api.routes.clerk.supabase_client') as mock_supabase:
        
        mock_supabase.return_value.table.return_value.insert.return_value.execute.return_value = (
            {"data": "success"}, 1
        )
        
        result = await post_user(test_payload)

    # Assert
    assert result == {"data": "success"}

@pytest.mark.asyncio
async def test_post_user_stripe_error():
    # Arrange
    test_payload = {
        "data": {
            "id": "test_user_id",
            "email_addresses": [
                {"id": "email_1", "email_address": "test@example.com"}
            ],
            "primary_email_address_id": "email_1",
        }
    }

    # Act & Assert
    with patch('stripe.Customer.create', side_effect=stripe.error.StripeError("Stripe error")):
        with pytest.raises(HTTPException) as exc_info:
            await post_user(test_payload)
    
    assert exc_info.value.status_code == 500
    assert "Failed to create Stripe customer" in exc_info.value.detail

@pytest.mark.asyncio
async def test_post_user_database_error():
    # Arrange
    test_payload = {
        "data": {
            "id": "test_user_id",
            "email_addresses": [
                {"id": "email_1", "email_address": "test@example.com"}
            ],
            "primary_email_address_id": "email_1",
        }
    }

    mock_stripe_customer = Mock()
    mock_stripe_customer.id = "stripe_customer_id"

    # Act & Assert
    with patch('stripe.Customer.create', return_value=mock_stripe_customer), \
         patch('app.api.routes.clerk.supabase_client') as mock_supabase:
        
        mock_supabase.return_value.table.return_value.insert.return_value.execute.side_effect = Exception("Database error")
        
        with pytest.raises(HTTPException) as exc_info:
            await post_user(test_payload)
    
    assert exc_info.value.status_code == 500
    assert "Failed to create user" in exc_info.value.detail
