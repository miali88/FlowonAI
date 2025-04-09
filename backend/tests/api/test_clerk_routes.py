import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))


import pytest
import json
import stripe
from unittest.mock import AsyncMock, Mock, patch
from fastapi import HTTPException
from svix.webhooks import WebhookVerificationError
from app.api.routes.clerk import handle_clerk_event, get_user_metadata
from app.models.users import UserMetadataResponse


@pytest.fixture
def clerk_event_payload():
    return {
        "type": "user.created",
        "data": {
            "id": "user_test_id",
            "email_addresses": [{"id": "email_1", "email_address": "test@example.com"}],
            "primary_email_address_id": "email_1",
            "first_name": "Test",
            "last_name": "User",
            "created_at": 1234567890000,
            "updated_at": 1234567890000,
            "last_sign_in_at": 1234567890000
        }
    }


@pytest.mark.asyncio
async def test_handle_clerk_event_success(clerk_event_payload):
    mock_req = Mock()
    mock_req.body = AsyncMock(return_value=json.dumps(clerk_event_payload).encode())

    headers = {
        "svix-id": "test_id",
        "svix-timestamp": "test_timestamp",
        "svix-signature": "test_signature"
    }

    secret = "d2hzZWNfdGVzdF9zZWNyZXQ="

    with patch("app.api.routes.clerk.Webhook.verify") as mock_verify, \
         patch("app.api.routes.clerk.post_user", new_callable=AsyncMock), \
         patch("os.getenv", return_value=secret):

        mock_verify.return_value = clerk_event_payload

        result = await handle_clerk_event(
            mock_req,
            svix_id=headers["svix-id"],
            svix_timestamp=headers["svix-timestamp"],
            svix_signature=headers["svix-signature"]
        )

    assert result == {"status": "success"}


@pytest.mark.asyncio
async def test_handle_clerk_event_invalid_signature(clerk_event_payload):
    mock_req = Mock()
    mock_req.body = AsyncMock(return_value=json.dumps(clerk_event_payload).encode())

    with patch("os.getenv", return_value="d2hzZWNfdGVzdF9zZWNyZXQ="), \
         patch("app.api.routes.clerk.Webhook.verify", side_effect=WebhookVerificationError):
        with pytest.raises(HTTPException) as exc_info:
            await handle_clerk_event(
                mock_req,
                svix_id="id",
                svix_timestamp="timestamp",
                svix_signature="signature"
            )

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Invalid webhook signature"


@pytest.mark.asyncio
async def test_handle_clerk_event_missing_secret(clerk_event_payload):
    mock_req = Mock()
    mock_req.body = AsyncMock(return_value=json.dumps(clerk_event_payload).encode())

    with patch("os.getenv", return_value=None):
        with pytest.raises(HTTPException) as exc_info:
            await handle_clerk_event(
                mock_req,
                svix_id="id",
                svix_timestamp="timestamp",
                svix_signature="signature"
            )

    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "CLERK_SIGNING_SECRET not set"


@pytest.mark.asyncio
async def test_get_user_metadata_success():
    mock_user_id = "user_test_id"
    mock_metadata = {"stripe_customer_id": "cus_test_123"}

    with patch("app.api.routes.clerk.get_clerk_private_metadata", return_value=mock_metadata):
        result = await get_user_metadata(current_user=mock_user_id)

    assert isinstance(result, UserMetadataResponse)
    assert result.customer_id == "cus_test_123"
