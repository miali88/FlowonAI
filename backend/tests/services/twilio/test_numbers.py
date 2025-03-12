import pytest
import unittest.mock as mock
from fastapi import HTTPException
import datetime

# Import the function to test
from app.services.twilio.numbers import provision_user_phone_number, check_user_has_number, store_phone_number

class TestProvisionUserPhoneNumber:
    """Test suite for provision_user_phone_number function"""
    
    @pytest.fixture
    def mock_supabase(self):
        """Mock the supabase client and responses"""
        with mock.patch('app.services.twilio.numbers.get_supabase') as mock_get_supabase:
            mock_client = mock.MagicMock()
            mock_get_supabase.return_value = mock_client
            
            # Setup mock table methods for chaining
            mock_table = mock.MagicMock()
            mock_client.table.return_value = mock_table
            mock_select = mock.MagicMock()
            mock_table.select.return_value = mock_select
            mock_eq = mock.MagicMock()
            mock_select.eq.return_value = mock_eq
            mock_execute = mock.MagicMock()
            mock_eq.execute.return_value = mock_execute
            mock_update = mock.MagicMock()
            mock_table.update.return_value = mock_update
            mock_update_eq = mock.MagicMock()
            mock_update.eq.return_value = mock_update_eq
            mock_update_execute = mock.MagicMock()
            mock_update_eq.execute.return_value = mock_update_execute
            mock_insert = mock.MagicMock()
            mock_table.insert.return_value = mock_insert
            mock_insert_execute = mock.MagicMock()
            mock_insert.execute.return_value = mock_insert_execute
            
            yield mock_client
    
    @pytest.fixture
    def mock_check_user_has_number(self):
        """Mock the check_user_has_number function"""
        with mock.patch('app.services.twilio.numbers.check_user_has_number') as mock_check:
            yield mock_check
    
    @pytest.fixture
    def mock_get_available_numbers(self):
        """Mock the get_available_numbers function"""
        with mock.patch('app.services.twilio.numbers.get_available_numbers') as mock_get:
            yield mock_get
    
    @pytest.fixture
    def mock_purchase_number(self):
        """Mock the purchase_number function"""
        with mock.patch('app.services.twilio.numbers.purchase_number') as mock_purchase:
            yield mock_purchase
    
    @pytest.fixture
    def mock_store_phone_number(self):
        """Mock the store_phone_number function"""
        with mock.patch('app.services.twilio.numbers.store_phone_number') as mock_store:
            yield mock_store
    
    @pytest.fixture
    def mock_number_purchased(self):
        """Mock the LiveKit number_purchased function"""
        with mock.patch('app.services.twilio.numbers.number_purchased') as mock_number_purchased:
            yield mock_number_purchased
    
    @pytest.mark.asyncio
    async def test_user_already_has_number(self, mock_check_user_has_number, mock_supabase):
        """Test when user already has a phone number"""
        # Setup
        test_user_id = "test-user-123"
        existing_number = "+15551234567"
        mock_check_user_has_number.return_value = (True, existing_number)
        
        # Execute
        result = await provision_user_phone_number(
            country_code="US",
            number_type="local",
            area_code=None,
            user_id=test_user_id
        )
        
        # Assert
        mock_check_user_has_number.assert_called_once_with(test_user_id)
        assert result["success"] is True
        assert result["number"] == existing_number
        assert result["already_exists"] is True
        assert result["message"] == "User already has a phone number assigned"
    
    @pytest.mark.asyncio
    async def test_no_available_numbers(
        self, 
        mock_check_user_has_number, 
        mock_get_available_numbers
    ):
        """Test when no available numbers are found"""
        # Setup
        test_user_id = "test-user-123"
        mock_check_user_has_number.return_value = (False, None)
        mock_get_available_numbers.return_value = {}  # No available numbers
        
        # Execute and assert
        with pytest.raises(HTTPException) as excinfo:
            await provision_user_phone_number(
                country_code="US",
                number_type="local",
                area_code=None,
                user_id=test_user_id
            )
        
        assert excinfo.value.status_code == 404
        assert "No available local numbers found" in str(excinfo.value.detail)
    
    @pytest.mark.asyncio
    async def test_successful_number_provisioning(
        self,
        mock_check_user_has_number,
        mock_get_available_numbers,
        mock_purchase_number,
        mock_store_phone_number,
        mock_number_purchased,
        mock_supabase
    ):
        """Test successful phone number provisioning flow"""
        # Setup
        test_user_id = "test-user-123"
        test_number = "+15551234567"
        test_number_sid = "PN123456789"
        test_account_sid = "AC123456789"
        
        mock_check_user_has_number.return_value = (False, None)
        mock_get_available_numbers.return_value = {
            "local": {
                "numbers": [test_number],
                "monthly_cost": 1.0
            }
        }
        
        # Mock user is on trial
        mock_execute = mock.MagicMock()
        mock_execute.data = [{"is_trial": True}]
        mock_supabase.table().select().eq().execute.return_value = mock_execute
        
        # Mock purchase result
        mock_purchase_number.return_value = {
            "number_sid": test_number_sid,
            "account_sid": test_account_sid
        }
        
        # Mock storage result
        mock_store_phone_number.return_value = {
            "success": True,
            "phone_number": test_number,
            "number_sid": test_number_sid,
            "is_trial_number": True
        }
        
        # Execute
        result = await provision_user_phone_number(
            country_code="US",
            number_type="local",
            area_code=None,
            user_id=test_user_id
        )
        
        # Assert
        mock_check_user_has_number.assert_called_once_with(test_user_id)
        mock_get_available_numbers.assert_called_once_with("US")
        mock_purchase_number.assert_called_once_with(phone_number=test_number)
        mock_store_phone_number.assert_called_once_with(
            phone_number=test_number,
            user_id=test_user_id,
            number_sid=test_number_sid,
            account_sid=test_account_sid,
            is_trial=True
        )
        mock_number_purchased.assert_called_once_with(test_number)
        
        assert result["success"] is True
        assert result["number"] == test_number
        assert result["number_sid"] == test_number_sid
        assert result["already_exists"] is False
        assert result["monthly_cost"] == 1.0
    
    @pytest.mark.asyncio
    async def test_livekit_registration_failure(
        self,
        mock_check_user_has_number,
        mock_get_available_numbers,
        mock_purchase_number,
        mock_store_phone_number,
        mock_number_purchased,
        mock_supabase
    ):
        """Test that the flow continues even if LiveKit registration fails"""
        # Setup
        test_user_id = "test-user-123"
        test_number = "+15551234567"
        test_number_sid = "PN123456789"
        test_account_sid = "AC123456789"
        
        mock_check_user_has_number.return_value = (False, None)
        mock_get_available_numbers.return_value = {
            "local": {
                "numbers": [test_number],
                "monthly_cost": 1.0
            }
        }
        
        # Mock user trial status
        mock_execute = mock.MagicMock()
        mock_execute.data = [{"is_trial": False}]
        mock_supabase.table().select().eq().execute.return_value = mock_execute
        
        # Mock purchase result
        mock_purchase_number.return_value = {
            "number_sid": test_number_sid,
            "account_sid": test_account_sid
        }
        
        # Mock storage result
        mock_store_phone_number.return_value = {
            "success": True,
            "phone_number": test_number,
            "number_sid": test_number_sid,
            "is_trial_number": False
        }
        
        # Mock LiveKit failure
        mock_number_purchased.side_effect = Exception("LiveKit connection error")
        
        # Execute
        result = await provision_user_phone_number(
            country_code="US",
            number_type="local",
            area_code=None,
            user_id=test_user_id
        )
        
        # Assert main process completed successfully despite LiveKit error
        assert result["success"] is True
        assert result["number"] == test_number
        assert result["already_exists"] is False 