import pytest
from unittest.mock import Mock, AsyncMock, patch
from fastapi import HTTPException
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.api.routes.vapi import router, VapiWebhookEvent, MessageResponse
from app.services.vapi.api_handlers import VapiService

@pytest.fixture
def mock_vapi_service():
    return Mock(spec=VapiService)

@pytest.fixture
def mock_request():
    request = Mock()
    request.json = AsyncMock()
    return request

@pytest.fixture
def sample_webhook_event():
    return {
        "message": {
            "type": "end-of-call-report",
            "call": {
                "id": "test-call-id"
            },
            "assistant": {
                "id": "test-assistant-id"
            },
            "durationSeconds": 120,
            "customer": {
                "number": "+1234567890"
            },
            "endedAt": "2024-04-06T12:00:00Z",
            "summary": "Test call summary"
        }
    }

@pytest.mark.asyncio
async def test_vapi_webhook_success(mock_request, mock_vapi_service, sample_webhook_event):
    mock_request.json.return_value = sample_webhook_event
    mock_vapi_service.process_webhook_event.return_value = {"status": "success"}

    with patch('app.api.routes.vapi.vapi_service', mock_vapi_service):
        response = await router.routes[0].endpoint(mock_request)

    assert response == {"status": "success"}
    mock_vapi_service.process_webhook_event.assert_called_once_with(sample_webhook_event)

@pytest.mark.asyncio
async def test_vapi_webhook_invalid_json(mock_request):
    mock_request.json.side_effect = ValueError("Invalid JSON")

    with pytest.raises(HTTPException) as exc_info:
        await router.routes[0].endpoint(mock_request)

    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "Error processing webhook: Invalid JSON"

@pytest.mark.asyncio
async def test_vapi_webhook_raw_success(mock_request, mock_vapi_service, sample_webhook_event):
    mock_request.json.return_value = sample_webhook_event
    mock_vapi_service.process_webhook_event.return_value = {"status": "success"}

    with patch('app.api.routes.vapi.vapi_service', mock_vapi_service):
        response = await router.routes[1].endpoint(mock_request)

    assert response == {"status": "success"}
    mock_vapi_service.process_webhook_event.assert_called_once_with(sample_webhook_event)

@pytest.mark.asyncio
async def test_vapi_webhook_raw_invalid_json(mock_request):
    mock_request.json.side_effect = ValueError("Invalid JSON")

    with pytest.raises(HTTPException) as exc_info:
        await router.routes[1].endpoint(mock_request)

    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "Error processing webhook: Invalid JSON"

@pytest.mark.asyncio
async def test_vapi_service_process_webhook_event():
    service = VapiService()
    event_data = {
        "message": {
            "type": "end-of-call-report",
            "call": {
                "id": "test-call-id"
            },
            "durationSeconds": 120
        }
    }

    with patch('app.services.vapi.api_handlers.store_call_data') as mock_store_call_data, \
     patch('app.services.vapi.api_handlers.update_call_duration', new_callable=AsyncMock) as mock_update_usage, \
     patch('app.services.vapi.api_handlers.get_user_notification_settings', new_callable=AsyncMock) as mock_get_settings, \
     patch('app.services.vapi.api_handlers.send_notification_email') as mock_send_email:

        mock_store_call_data.return_value = {"user_id": "test-user-id"}
        mock_get_settings.return_value = {
            "emailNotifications": {
                "enabled": True,
                "email": "test@example.com"
            }
        }
        mock_send_email.return_value = True

        response = await service.process_webhook_event(event_data)

    assert response["status"] == "success"
    mock_store_call_data.assert_called_once()
    mock_update_usage.assert_called_once_with(
        {"user_id": "test-user-id", "duration_seconds": 120},
        source="vapi"
    )
    mock_get_settings.assert_called_once_with("test-user-id")
    mock_send_email.assert_called_once()

@pytest.mark.asyncio
async def test_vapi_service_handle_unknown_event():
    service = VapiService()
    event_data = {
        "message": {
            "type": "unknown-event-type"
        }
    }

    response = await service.handle_unknown_event(event_data)

    assert response["status"] == "error"
    assert "Unknown event type" in response["message"]

@pytest.mark.asyncio
async def test_vapi_service_handle_function_call():
    service = VapiService()
    function_call_data = {
        "name": "unknown_function",
        "arguments": {}
    }

    response = await service.handle_function_call(function_call_data)

    assert response["status"] == "error"
    assert response["result"]["error"] == "Unknown function: unknown_function"

@pytest.mark.asyncio
async def test_vapi_service_handle_tool_calls():
    service = VapiService()
    tool_calls_data = {
        "tools": [
            {"name": "test_tool_1"},
            {"name": "test_tool_2"}
        ]
    }

    response = await service.handle_tool_calls(tool_calls_data)

    assert response["status"] == "success"
    assert len(response["results"]) == 2
    assert all(result["status"] == "success" for result in response["results"])

@pytest.mark.asyncio
async def test_vapi_service_handle_transfer_request():
    service = VapiService()
    event_data = {
        "callId": "test-call-id"
    }

    response = await service.handle_transfer_request(event_data)

    assert response["status"] == "success"
    assert "destination" in response
    assert response["destination"]["type"] == "number"
    assert response["destination"]["number"] == "+1234567890"
