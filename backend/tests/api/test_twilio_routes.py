import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
import unittest.mock as mock
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.api.routes.twilio import router
from app.core.auth import get_current_user

# Create test app with router
app = FastAPI()
app.include_router(router, prefix="/twilio")

# Mock the auth dependency
async def mock_current_user():
    return "test-user-123"

app.dependency_overrides[get_current_user] = mock_current_user

client = TestClient(app)

class TestTwilioRoutes:
    """Test suite for Twilio API routes"""
    
    @pytest.fixture
    def mock_provision_user_phone_number(self):
        """Mock the provision_user_phone_number function"""
        with mock.patch('app.api.routes.twilio.provision_user_phone_number') as mock_provision:
            yield mock_provision
    
    def test_purchase_phone_number_success(self, mock_provision_user_phone_number):
        """Test successful phone number purchase"""
        # Setup
        mock_provision_user_phone_number.return_value = {
            "success": True,
            "number": "+15551234567",
            "number_sid": "PN123456789",
            "number_type": "local",
            "country_code": "US",
            "already_exists": False
        }
        
        # Execute
        response = client.post(
            "/twilio/purchase_phone_number?country_code=US&number_type=local"
        )
        
        # Assert
        assert response.status_code == 200
        result = response.json()
        assert result["success"] is True
        assert result["number"] == "+15551234567"
        
        # Verify mock was called with correct parameters
        mock_provision_user_phone_number.assert_called_once_with(
            country_code="US",
            number_type="local",
            area_code=None,
            user_id="test-user-123"
        )
    
    def test_purchase_phone_number_with_area_code(self, mock_provision_user_phone_number):
        """Test phone number purchase with area code"""
        # Setup
        mock_provision_user_phone_number.return_value = {
            "success": True,
            "number": "+15551234567",
            "number_sid": "PN123456789",
            "number_type": "local",
            "country_code": "US",
            "already_exists": False
        }
        
        # Execute
        response = client.post(
            "/twilio/purchase_phone_number?country_code=US&number_type=local&area_code=555"
        )
        
        # Assert
        assert response.status_code == 200
        
        # Verify mock was called with correct parameters including area code
        mock_provision_user_phone_number.assert_called_once_with(
            country_code="US",
            number_type="local",
            area_code="555",
            user_id="test-user-123"
        )
    
    def test_purchase_phone_number_http_exception(self, mock_provision_user_phone_number):
        """Test handling of HTTPException from provision_user_phone_number"""
        # Setup - simulate an HTTPException from the service
        from fastapi import HTTPException
        mock_provision_user_phone_number.side_effect = HTTPException(
            status_code=404, 
            detail="No available local numbers found for country code US"
        )
        
        # Execute
        response = client.post(
            "/twilio/purchase_phone_number?country_code=US&number_type=local"
        )
        
        # Assert
        assert response.status_code == 404
        result = response.json()
        assert "No available local numbers found" in result["detail"]
    
    def test_purchase_phone_number_generic_exception(self, mock_provision_user_phone_number):
        """Test handling of generic exceptions from provision_user_phone_number"""
        # Setup - simulate a generic exception
        mock_provision_user_phone_number.side_effect = Exception("Twilio API error")
        
        # Execute
        response = client.post(
            "/twilio/purchase_phone_number?country_code=US&number_type=local"
        )
        
        # Assert
        assert response.status_code == 500
        result = response.json()
        assert "Error provisioning phone number" in result["detail"] 