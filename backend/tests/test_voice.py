import pytest
from fastapi import Request
from unittest.mock import Mock, AsyncMock, patch, mock_open
import json

from app.api.routes.voice import (
    livekit_room_webhook,
    sip_call_extract,
)

@pytest.mark.asyncio
async def test_livekit_room_webhook():
    # Arrange
    mock_req = Mock()
    mock_webhook_data = {
        "participant": {
            "kind": "SIP",
            "sid": "test_sid",
            "name": "test_name",
            "attributes": {
                "sip.trunkPhoneNumber": "+1234567890",
                "sip.twilio.accountSid": "test_account_sid",
                "sip.twilio.callSid": "test_call_sid"
            }
        },
        "room": {
            "name": "test_room",
            "creationTime": "2024-01-01T00:00:00Z"
        }
    }
    mock_req.json = AsyncMock(return_value=mock_webhook_data)
    
    # Act
    with patch("builtins.open", mock_open()) as mock_file:
        result = await livekit_room_webhook(mock_req)
    
    # Assert
    assert result == {"message": "Webhook received successfully"}
    mock_file.assert_called_once_with('call_data.json', 'w')

@pytest.mark.asyncio
async def test_livekit_room_webhook_non_sip():
    # Arrange
    mock_req = Mock()
    mock_webhook_data = {
        "participant": {
            "kind": "WEBRTC",  # Non-SIP participant
            "sid": "test_sid",
            "name": "test_name"
        },
        "room": {
            "name": "test_room"
        }
    }
    mock_req.json = AsyncMock(return_value=mock_webhook_data)
    
    # Act
    result = await livekit_room_webhook(mock_req)
    
    # Assert
    assert result == {"message": "Webhook received successfully"}

def test_sip_call_extract_valid():
    # Arrange
    test_data = {
        "participant": {
            "kind": "SIP",
            "sid": "test_sid",
            "name": "test_name",
            "state": "active",
            "attributes": {
                "sip.trunkPhoneNumber": "+1234567890",
                "sip.twilio.accountSid": "test_account_sid",
                "sip.twilio.callSid": "test_call_sid"
            }
        },
        "room": {
            "name": "test_room",
            "creationTime": "2024-01-01T00:00:00Z"
        },
        "id": "test_event_id"
    }
    
    # Act
    result = sip_call_extract(test_data)
    
    # Assert
    assert result is not None
    assert result["kind"] == "SIP"
    assert result["sid"] == "test_sid"
    assert result["name"] == "test_name"
    assert result["room_name"] == "test_room"
    assert result["creation_time"] == "2024-01-01T00:00:00Z"
    assert result["state"] == "active"
    assert result["event_id"] == "test_event_id"
    assert result["twilio_phone_number"] == "+1234567890"
    assert result["twilio_account_sid"] == "test_account_sid"
    assert result["twilio_call_sid"] == "test_call_sid"

def test_sip_call_extract_non_sip():
    # Arrange
    test_data = {
        "participant": {
            "kind": "WEBRTC",
            "sid": "test_sid",
            "name": "test_name"
        },
        "room": {
            "name": "test_room"
        }
    }
    
    # Act
    result = sip_call_extract(test_data)
    
    # Assert
    assert result is None

def test_sip_call_extract_missing_data():
    # Arrange
    test_data = {
        "participant": {
            "kind": "SIP"
            # Missing other fields
        }
    }
    
    # Act
    result = sip_call_extract(test_data)
    
    # Assert
    assert result is not None
    assert result["kind"] == "SIP"
    assert result["sid"] is None
    assert result["name"] is None
    assert result["room_name"] is None
    assert result["twilio_phone_number"] is None
    assert result["twilio_account_sid"] is None
    assert result["twilio_call_sid"] is None 