import pytest
from unittest.mock import patch, MagicMock
import logging
import os

from app.services.email_service import send_user_signup_notification

# Sample user data that mimics Clerk webhook payload
sample_user_data = {
    "id": "user_test_123456",
    "first_name": "John",
    "last_name": "Doe",
    "email_addresses": [
        {"email_address": "john.doe@example.com", "id": "email_123"}
    ],
    "created_at": 1625097600000  # Example timestamp
}

@pytest.mark.asyncio
@patch('app.services.email_service.send_notification_email')
async def test_send_user_signup_notification_success(mock_send_email):
    # Configure the mock to return True (success)
    mock_send_email.return_value = True
    
    # Call the function with sample data
    result = await send_user_signup_notification(sample_user_data)
    
    # Verify the result is True
    assert result is True
    
    # Verify send_notification_email was called with correct parameters
    mock_send_email.assert_called_once()
    
    # Check the subject contains the user's name
    call_args = mock_send_email.call_args[0]
    assert "John Doe" in call_args[0]  # Subject
    
    # Check the body contains all required information
    body = call_args[1]  # Body
    assert "user_test_123456" in body  # User ID
    assert "John Doe" in body  # Full name
    assert "john.doe@example.com" in body  # Email

@pytest.mark.asyncio
@patch('app.services.email_service.send_notification_email')
async def test_send_user_signup_notification_missing_data(mock_send_email):
    # Configure the mock to return True
    mock_send_email.return_value = True
    
    # Create user data with missing fields
    incomplete_user_data = {
        "id": "user_test_incomplete"
        # Missing name and email
    }
    
    # Call the function with incomplete data
    result = await send_user_signup_notification(incomplete_user_data)
    
    # Verify the result is still True (function should handle missing data)
    assert result is True
    
    # Verify send_notification_email was called
    mock_send_email.assert_called_once()
    
    # Check that default values were used
    call_args = mock_send_email.call_args[0]
    assert "Unknown User" in call_args[0]  # Subject should use default name
    assert "No email provided" in call_args[1]  # Body should mention missing email

@pytest.mark.asyncio
@patch('app.services.email_service.send_notification_email')
async def test_send_user_signup_notification_error(mock_send_email):
    # Configure the mock to raise an exception
    mock_send_email.side_effect = Exception("Test error")
    
    # Call the function
    result = await send_user_signup_notification(sample_user_data)
    
    # Verify the result is False (error occurred)
    assert result is False
    
    # Verify send_notification_email was called
    mock_send_email.assert_called_once() 

# This test will actually send an email - only run manually when needed
#@pytest.mark.skip(reason="Sends actual emails, run manually")
@pytest.mark.asyncio
async def test_real_email_delivery():
    # Sample user data
    test_user = {
        "id": "user_test_123456",
        "first_name": "Test",
        "last_name": "User",
        "email_addresses": [
            {"email_address": "gabrielhsantosmoura@gmail.com", "id": "email_123"}
        ],
        "created_at": 1625097600000
    }
    
    # This will actually send an email
    result = await send_user_signup_notification(test_user)
    
    assert result is True
    print("Check your inbox at gabrielhsantosmoura@gmail.com for the test email") 