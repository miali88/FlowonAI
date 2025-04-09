import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch
from fastapi import status
from app.main import app

from app.api.schemas.guided_setup import (
    OnboardingPreviewRequest,
    TrialPlanRequest,
    UpdateTrainingStatusRequest,
    RetrainAgentRequest
)

from backend.app.models.guided_setup import (
    QuickSetupData, TrainingSource, BusinessInformation, BusinessHours,
    MessageTaking, CallNotifications, CallerName, CallerPhoneNumber,
    SpecificQuestion, EmailNotifications, SmsNotifications
)

@pytest.fixture(autouse=True)
def override_user():
    from app.api.routes import guided_setup
    async def mock_user():
        return "mock_user_id"
    app.dependency_overrides[guided_setup.get_current_user] = mock_user
    yield
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_quick_setup_success():
    data = QuickSetupData(
        business_name="Test Business",
        business_description="Test Description",
        business_website="https://test.com",
        agent_language="en",
        trainingSources=TrainingSource(sourceType="url", value="https://test.com"),
        businessInformation=BusinessInformation(
            businessName="Test Business",
            businessOverview="Overview",
            primaryBusinessAddress="123 Main St",
            primaryBusinessPhone="+1234567890",
            coreServices=["Consulting", "Support"],
            businessHours={
                "mon": BusinessHours(open="09:00", close="17:00")
            }
        ),
        messageTaking=MessageTaking(
            callerName=CallerName(required=True, alwaysRequested=True),
            callerPhoneNumber=CallerPhoneNumber(required=True, alwaysRequested=True, automaticallyCaptured=False),
            specificQuestions=[SpecificQuestion(question="What do you need?", required=True)]
        ),
        callNotifications=CallNotifications(
            emailNotifications=EmailNotifications(enabled=True),
            smsNotifications=SmsNotifications(enabled=False)
        )
    )

    mock_result = {"success": True, "phone_number": "+1234567890"}

    with patch("app.api.routes.guided_setup.submit_quick_setup_service", new_callable=AsyncMock) as mock_service:
        mock_service.return_value = mock_result
        async with AsyncClient(app=app, base_url="http://test") as ac:
            res = await ac.post("/api/v1/guided_setup/quick_setup", json=data.model_dump())

        assert res.status_code == status.HTTP_200_OK
        assert res.json() == mock_result


@pytest.mark.asyncio
async def test_retrain_agent_success():
    request = RetrainAgentRequest(
        url="https://example.com",
        setup_data=None
    )

    mock_response = {
        "success": True,
        "business_overview": "Overview",
        "setup_data": None,
        "error": None
    }

    with patch("app.api.routes.guided_setup.retrain_agent_service", new_callable=AsyncMock) as mock_service:
        mock_service.return_value = mock_response
        async with AsyncClient(app=app, base_url="http://test") as ac:
            res = await ac.post("/api/v1/guided_setup/retrain_agent", json=request.model_dump())

        assert res.status_code == status.HTTP_200_OK
        assert res.json() == mock_response


@pytest.mark.asyncio
async def test_get_phone_number_success():
    mock_response = {"success": True, "phone_number": "+1234567890"}

    with patch("app.api.routes.guided_setup.get_phone_number_handler", new_callable=AsyncMock) as mock_handler:
        mock_handler.return_value = mock_response
        async with AsyncClient(app=app, base_url="http://test") as ac:
            res = await ac.get("/api/v1/guided_setup/phone_number")

        assert res.status_code == status.HTTP_200_OK
        assert res.json() == mock_response


@pytest.mark.asyncio
async def test_get_setup_status_success():
    mock_response = {"success": True, "is_completed": False, "current_step": "phone_number"}

    with patch("app.api.routes.guided_setup.check_setup_status", new_callable=AsyncMock) as mock_status:
        mock_status.return_value = mock_response
        async with AsyncClient(app=app, base_url="http://test") as ac:
            res = await ac.get("/api/v1/guided_setup/setup_status")

        assert res.status_code == status.HTTP_200_OK
        assert res.json() == mock_response


@pytest.mark.asyncio
async def test_mark_setup_complete_success():
    mock_response = {"success": True, "message": "Setup marked as complete"}

    with patch("app.api.routes.guided_setup.mark_setup_complete", new_callable=AsyncMock) as mock_complete:
        mock_complete.return_value = mock_response
        async with AsyncClient(app=app, base_url="http://test") as ac:
            res = await ac.post("/api/v1/guided_setup/mark_complete")

        assert res.status_code == status.HTTP_200_OK
        assert res.json() == mock_response


@pytest.mark.asyncio
async def test_get_setup_data_success():
    mock_response = {
        "success": True,
        "data": {
            "business_name": "Test Business",
            "business_description": "Test Description",
            "business_website": "https://test.com",
            "agent_language": "en"
        }
    }

    with patch("app.api.routes.guided_setup.get_formatted_setup_data", new_callable=AsyncMock) as mock_get_data:
        mock_get_data.return_value = mock_response
        async with AsyncClient(app=app, base_url="http://test") as ac:
            res = await ac.get("/api/v1/guided_setup/setup_data")

        assert res.status_code == status.HTTP_200_OK
        assert res.json() == mock_response


@pytest.mark.asyncio
async def test_generate_onboarding_preview_success():
    request = OnboardingPreviewRequest(
        businessName="Test Co",
        businessDescription="Desc",
        businessWebsite="https://test.com",
        agentLanguage="en"
    )

    mock_response = {
        "success": True,
        "greeting_audio_data_base64": "abc123",
        "message_audio_data_base64": "xyz456",
        "greeting_text": "Welcome",
        "message_text": "Leave a message",
    }

    with patch("app.api.routes.guided_setup.generate_onboarding_preview_service", new_callable=AsyncMock) as mock_service:
        mock_service.return_value = mock_response
        async with AsyncClient(app=app, base_url="http://test") as ac:
            res = await ac.post("/api/v1/guided_setup/onboarding_preview", json=request.model_dump())

        assert res.status_code == status.HTTP_200_OK
        assert res.json()["success"] is True


@pytest.mark.asyncio
async def test_set_trial_plan_success():
    request = TrialPlanRequest(trial_plan_type="basic")
    mock_response = {"success": True, "message": "Trial set"}

    with patch("app.api.routes.guided_setup.set_trial_plan_service", new_callable=AsyncMock) as mock_service:
        mock_service.return_value = mock_response
        async with AsyncClient(app=app, base_url="http://test") as ac:
            res = await ac.post("/api/v1/guided_setup/set_trial_plan", json=request.model_dump())

        assert res.status_code == status.HTTP_200_OK
        assert res.json() == mock_response


@pytest.mark.asyncio
async def test_update_training_status_success():
    request = UpdateTrainingStatusRequest(trained_on_website=True)
    mock_response = {"success": True, "message": "Updated"}

    with patch("app.api.routes.guided_setup.update_training_status_service", new_callable=AsyncMock) as mock_service:
        mock_service.return_value = mock_response
        async with AsyncClient(app=app, base_url="http://test") as ac:
            res = await ac.post("/api/v1/guided_setup/update_training_status", json=request.model_dump())

        assert res.status_code == status.HTTP_200_OK
        assert res.json() == mock_response
