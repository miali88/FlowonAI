import pytest
from fastapi import HTTPException
from unittest.mock import Mock, patch, AsyncMock

# Import the router functions
from app.api.routes.settings import update_settings, get_settings

@pytest.mark.asyncio
async def test_update_settings_notifications():
    # Arrange
    mock_req = Mock()
    mock_req.json = AsyncMock(return_value={
        "userId": "test_user_id",
        "notifications": {"email_alerts": True}
    })
    
    mock_response = Mock()
    mock_response.data = [{"id": "test_user_id"}]
    
    # Act
    with patch('app.api.routes.settings.supabase') as mock_supabase:
        mock_supabase.table().update().eq().execute.return_value = mock_response
        result = await update_settings(mock_req)
    
    # Assert
    assert result == {"message": "Settings updated successfully"}

@pytest.mark.asyncio
async def test_update_settings_account():
    # Arrange
    mock_req = Mock()
    mock_req.json = AsyncMock(return_value={
        "userId": "test_user_id",
        "account": {"theme": "dark"}
    })
    
    mock_response = Mock()
    mock_response.data = [{"id": "test_user_id"}]
    
    # Act
    with patch('app.api.routes.settings.supabase') as mock_supabase:
        mock_supabase.table().update().eq().execute.return_value = mock_response
        result = await update_settings(mock_req)
    
    # Assert
    assert result == {"message": "Settings updated successfully"}

@pytest.mark.asyncio
async def test_update_settings_no_valid_settings():
    # Arrange
    mock_req = Mock()
    mock_req.json = AsyncMock(return_value={
        "userId": "test_user_id"
    })
    
    # Act & Assert
    with patch('app.api.routes.settings.supabase'):
        with pytest.raises(HTTPException) as exc_info:
            await update_settings(mock_req)
    
        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "No valid settings provided"

@pytest.mark.asyncio
async def test_update_settings_user_not_found():
    # Arrange
    mock_req = Mock()
    mock_req.json = AsyncMock(return_value={
        "userId": "test_user_id",
        "notifications": {"email_alerts": True}
    })
    
    mock_response = Mock()
    mock_response.data = []
    
    # Act & Assert
    with patch('app.api.routes.settings.supabase') as mock_supabase:
        mock_supabase.table().update().eq().execute.return_value = mock_response
        with pytest.raises(HTTPException) as exc_info:
            await update_settings(mock_req)
    
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "User not found"

@pytest.mark.asyncio
async def test_get_settings_success():
    # Arrange
    mock_req = Mock()
    mock_req.query_params = {"userId": "test_user_id"}
    
    mock_response = Mock()
    mock_response.data = [{
        "notification_settings": {"email_alerts": True},
        "account_settings": {"theme": "dark"},
        "user_plan": "premium"
    }]
    
    expected_result = {
        "settings": {
            "notification_settings": {"email_alerts": True},
            "account_settings": {"theme": "dark"},
            "user_plan": "premium"
        }
    }
    
    # Act
    with patch('app.api.routes.settings.supabase') as mock_supabase:
        mock_supabase.table().select().eq().execute.return_value = mock_response
        result = await get_settings(mock_req)
    
    # Assert
    assert result == expected_result

@pytest.mark.asyncio
async def test_get_settings_user_not_found():
    # Arrange
    mock_req = Mock()
    mock_req.query_params = {"userId": "test_user_id"}
    
    mock_response = Mock()
    mock_response.data = []
    
    # Act & Assert
    with patch('app.api.routes.settings.supabase') as mock_supabase:
        mock_supabase.table().select().eq().execute.return_value = mock_response
        with pytest.raises(HTTPException) as exc_info:
            await get_settings(mock_req)
    
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "User not found" 