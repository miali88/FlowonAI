import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import status, HTTPException
from app.main import app

@pytest.fixture(autouse=True)
def override_get_current_user():
    from app.api.routes import knowledge_base
    async def mock_user():
        return "mock_user_id"

    app.dependency_overrides[knowledge_base.get_current_user] = mock_user
    yield
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_scrape_for_setup_success():
    request_data = {
        "website_url": "https://test.com"
    }

    mock_result = {
        "message": "Website scraping started in background",
        "data": {
            "job_id": "test_job_id",
            "status": "started"
        }
    }

    with patch("app.api.routes.knowledge_base.knowledge_base.scrape_for_setup", new_callable=AsyncMock) as mock_scrape:
        mock_scrape.return_value = mock_result["data"]
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post("/api/v1/knowledge_base/scrape_for_setup", json=request_data)

        assert response.status_code == status.HTTP_200_OK
        assert response.json() == mock_result

@pytest.mark.asyncio
async def test_scrape_for_setup_invalid_url():
    request_data = {
        "website_url": "invalid-url"
    }

    with patch("app.api.routes.knowledge_base.knowledge_base.scrape_for_setup", new_callable=AsyncMock) as mock_scrape:
        mock_scrape.side_effect = HTTPException(status_code=400, detail="Invalid URL format")
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post("/api/v1/knowledge_base/scrape_for_setup", json=request_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid URL format" in response.json()["detail"]

@pytest.mark.asyncio
async def test_scrape_for_setup_server_error():
    request_data = {
        "website_url": "https://test.com"
    }

    with patch("app.api.routes.knowledge_base.knowledge_base.scrape_for_setup", new_callable=AsyncMock) as mock_scrape:
        mock_scrape.side_effect = Exception("Internal server error")
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post("/api/v1/knowledge_base/scrape_for_setup", json=request_data)

        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "Error scraping website" in response.json()["detail"] 