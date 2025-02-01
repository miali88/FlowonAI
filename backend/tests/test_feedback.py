import pytest
from fastapi import HTTPException
from unittest.mock import Mock, patch, AsyncMock
from app.api.routes.feedback import handle_response_feedback, ResponseFeedback

@pytest.mark.asyncio
async def test_handle_response_feedback_success():
    # Arrange
    feedback = ResponseFeedback(
        thumbs_up=True,
        room_id="test_room_id"
    )
    
    # Act
    result = await handle_response_feedback("test_response_id", feedback)
    
    # Assert
    assert result.status_code == 200
    assert result.body.decode() == '{"status":"success","message":"Feedback recorded successfully"}'

@pytest.mark.asyncio
async def test_handle_response_feedback_error():
    # Arrange
    feedback = ResponseFeedback(
        thumbs_up=False,
        room_id="test_room_id"
    )
    
    # Act & Assert
    with patch('logging.Logger.info', side_effect=Exception("Test error")):
        with pytest.raises(HTTPException) as exc_info:
            await handle_response_feedback("test_response_id", feedback)
        
        assert exc_info.value.status_code == 500
        assert exc_info.value.detail == "Internal server error: Test error"

@pytest.mark.asyncio
async def test_handle_response_feedback_validates_input():
    # Arrange
    invalid_data = {
        "thumbs_up": "not_a_boolean",  # Invalid type
        "room_id": "test_room_id"
    }
    
    # Act & Assert
    with pytest.raises(Exception):  # Pydantic will raise a validation error
        ResponseFeedback(**invalid_data) 