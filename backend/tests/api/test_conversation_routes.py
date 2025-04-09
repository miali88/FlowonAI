import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import status
from app.main import app


@pytest.fixture(autouse=True)
def override_get_current_user():
    from app.api.routes import conversation
    async def mock_user():
        return "mock_user_id"

    app.dependency_overrides[conversation.get_current_user] = mock_user
    yield
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_conversation_history_success():
    mock_data = [{"id": "1", "transcript": "Sample", "user_id": "mock_user_id"}]
    mock_response = MagicMock()
    mock_response.data = mock_data

    # mock the table methods
    mock_table = MagicMock()
    mock_table.select.return_value = mock_table
    mock_table.eq.return_value = mock_table
    mock_table.execute = AsyncMock(return_value=mock_response)

    mock_client = MagicMock()
    mock_client.table.return_value = mock_table

    with patch("app.api.routes.conversation.get_supabase", new_callable=AsyncMock) as mock_get_supabase:
        mock_get_supabase.return_value = mock_client

        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get("/api/v1/conversation/history")

        assert response.status_code == status.HTTP_200_OK
        assert response.json() == mock_data


@pytest.mark.asyncio
async def test_delete_conversation_history_success():
    mock_response = MagicMock()
    mock_response.data = {}

    mock_table = MagicMock()
    mock_table.delete.return_value = mock_table
    mock_table.eq.return_value = mock_table
    mock_table.execute = AsyncMock(return_value=mock_response)

    mock_client = MagicMock()
    mock_client.table.return_value = mock_table

    with patch("app.api.routes.conversation.get_supabase", new_callable=AsyncMock) as mock_get_supabase:
        mock_get_supabase.return_value = mock_client

        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.delete("/api/v1/conversation/123")

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["status"] == "success"


@pytest.mark.asyncio
async def test_store_history_success():
    webhook_data = {
        "agent_id": "agent_1",
        "job_id": "job_1",
        "transcript": "Transcript example",
        "participant_identity": "test_user",
        "room_name": "room_1",
        "prospect_status": "lead",
        "call_duration": "2 min",
        "call_type": "inbound"
    }

    mock_response = MagicMock()
    mock_response.data = {}

    mock_table = MagicMock()
    mock_table.insert.return_value = mock_table
    mock_table.execute = AsyncMock(return_value=mock_response)

    mock_client = MagicMock()
    mock_client.table.return_value = mock_table

    with patch("app.api.routes.conversation.get_agent_metadata", return_value={"userId": "mock_user_id"}), \
         patch("app.api.routes.conversation.get_supabase", new_callable=AsyncMock) as mock_get_supabase, \
         patch("app.api.routes.conversation.transcript_summary", new_callable=AsyncMock) as mock_summary:

        mock_get_supabase.return_value = mock_client
        mock_summary.return_value = None

        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post("/api/v1/conversation/store_history", json=webhook_data)

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["status"] == "success"
        mock_summary.assert_called_once_with(webhook_data["transcript"], webhook_data["job_id"])
