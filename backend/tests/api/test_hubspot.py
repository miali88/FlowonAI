import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

import pytest
from httpx import AsyncClient
from fastapi import status
from app.main import app

@pytest.mark.asyncio
async def test_hubspot_webhook_receives_payload():
    sample_payload = {
        "eventId": "123456",
        "eventType": "contact.creation",
        "data": {
            "contactId": "001",
            "email": "test@example.com"
        }
    }

    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/v1/hubspot/hubspot/webhook", json=sample_payload)

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"message": "Hubspot webhook received"}
