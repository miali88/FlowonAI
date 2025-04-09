import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch
from fastapi import status
from app.main import app
from app.core.auth import get_current_user

# Define the mock version of get_current_user
async def mock_get_current_user():
    return "mock_user_id"

@pytest.fixture(autouse=True)
def override_auth_dependency():
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_check_trial_status_success():
    mock_response = {
        "is_trial": True,
        "trial_minutes_used": 5,
        "trial_minutes_total": 25,
        "is_trial_expired": False,
    }

    with patch("app.api.routes.user.check_user_trial_status", new_callable=AsyncMock) as mock_check_status:
        mock_check_status.return_value = mock_response

        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get(
                "/api/v1/user/check_trial_status",
                headers={"Authorization": "Bearer mock_token"}
            )

        assert response.status_code == status.HTTP_200_OK
        assert response.json() == mock_response
        mock_check_status.assert_called_once_with(user_id="mock_user_id", current_user="mock_user_id")

@pytest.mark.asyncio
async def test_check_trial_status_internal_error():
    with patch("app.api.routes.user.check_user_trial_status", new_callable=AsyncMock) as mock_check_status:
        mock_check_status.side_effect = Exception("Something went wrong")

        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get(
                "/api/v1/user/check_trial_status",
                headers={"Authorization": "Bearer mock_token"}
            )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Error checking trial status" in response.json()["detail"]
