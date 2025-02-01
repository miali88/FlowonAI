import pytest
from fastapi import HTTPException
from unittest.mock import Mock, patch, AsyncMock
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

from app.api.routes.twilio import (
    get_country_codes_handler,
    get_available_numbers_handler,
    get_user_numbers_handler,
    twilio_status_update,
    add_to_conference_route,
    initiate_call
)

pytestmark = pytest.mark.asyncio

@pytest.mark.asyncio
async def test_get_country_codes_handler():
    # Arrange
    mock_countries = {"US": "United States", "BR": "Brazil"}
    
    # Act
    with patch('services.twilio.helper.get_country_codes', return_value=mock_countries):
        response = await get_country_codes_handler()
    
    # Assert
    assert response.body.decode() == '{"countries":{"US":"United States","BR":"Brazil"}}'

@pytest.mark.asyncio
async def test_get_available_numbers_handler():
    # Arrange
    country_code = "US"
    mock_numbers = {
        "local": {
            "monthly_cost": 1.0,
            "numbers": ["+1234567890"]
        }
    }
    
    # Act
    with patch('services.twilio.helper.get_available_numbers', return_value=mock_numbers):
        response = await get_available_numbers_handler(country_code)
    
    # Assert
    assert response == {"numbers": mock_numbers}

@pytest.mark.asyncio
async def test_get_user_numbers_handler():
    # Arrange
    mock_user = "test_user_id"
    mock_numbers = ["+1234567890"]
    
    # Act
    with patch('services.twilio.helper.fetch_twilio_numbers', return_value=mock_numbers):
        response = await get_user_numbers_handler(current_user=mock_user)
    
    # Assert
    assert response.body.decode() == '{"numbers":["+1234567890"]}'

"""
@pytest.mark.asyncio
async def test_initiate_call():
    # Arrange
    to_number = "+1234567890"
    from_number = "+0987654321"
    mock_call = Mock(sid="CA123456789")
    
    # Act
    with patch('services.twilio.call_handle.create_outbound_call', return_value=mock_call):
        response = await initiate_call(to_number=to_number, from_number=from_number)
    
    # Assert
    assert response.body.decode() == '{"message":"Call initiated","call_sid":"CA123456789"}'
"""

@pytest.mark.asyncio
async def test_twilio_status_update():
    # Arrange
    mock_request = Mock()
    mock_request.method = "POST"
    mock_request.form = AsyncMock(return_value={"CallStatus": "completed"})
    
    # Act
    response = await twilio_status_update(mock_request)
    
    # Assert
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_add_to_conference_route():
    # Arrange
    mock_request = Mock()
    mock_response = Mock(status_code=200)
    
    # Act
    with patch('services.twilio.call_handle.add_to_conference', return_value=mock_response):
        response = await add_to_conference_route(mock_request)
    
    # Assert
    assert response.status_code == 200 