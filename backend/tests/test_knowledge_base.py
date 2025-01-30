import pytest
from fastapi import HTTPException
from unittest.mock import Mock, patch, AsyncMock
from fastapi.responses import JSONResponse

# Import the router and functions
from app.api.routes.knowledge_base import (
    upload_file_handler,
    get_items_handler,
    create_item_handler,
    delete_item_handler,
    get_items_headers_handler,
    scrape_url_handler,
    crawl_url_handler,
    calculate_tokens_handler
)

@pytest.mark.asyncio
async def test_upload_file_handler():
    # Arrange
    mock_background_tasks = Mock()
    mock_file = Mock()
    mock_file.filename = "test.txt"
    
    mock_processed_content = ("Test content", "txt")
    mock_new_item = Mock(data=[{
        "id": 1,
        "title": "test.txt",
        "content": "Test content",
        "user_id": "test_user_id"
    }])
    
    # Create mock for supabase chain
    mock_supabase = Mock()
    mock_table = Mock()
    mock_insert = Mock()
    mock_execute = Mock(return_value=mock_new_item)
    
    mock_supabase.table.return_value = mock_table
    mock_table.insert.return_value = mock_insert
    mock_insert.execute.return_value = mock_execute
    
    # Act
    with patch('services.knowledge_base.file_processing.process_file', AsyncMock(return_value=mock_processed_content)), \
         patch('services.db.supabase_services.supabase_client', return_value=mock_supabase):
        result = await upload_file_handler(
            mock_background_tasks,
            mock_file,
            "Bearer test_token",
            "test_user_id"
        )
    
    # Assert
    assert isinstance(result, JSONResponse)
    assert result.status_code == 200
    assert "message" in result.body.decode()

@pytest.mark.asyncio
async def test_get_items_handler():
    # Arrange
    mock_items = [{"id": 1, "title": "Test Item"}]
    mock_total_tokens = 100
    
    # Act
    with patch('app.api.routes.knowledge_base.get_kb_items', AsyncMock(return_value=(mock_items, mock_total_tokens))):
        result = await get_items_handler("test_user_id")
    
    # Assert
    assert isinstance(result, JSONResponse)
    content = result.body.decode()
    assert "items" in content
    assert "total_tokens" in content

@pytest.mark.asyncio
async def test_create_item_handler():
    # Arrange
    mock_req = Mock()
    mock_req.body = AsyncMock(return_value=b'{"title": "Test", "content": "Test content", "user_id": "test_user_id"}')
    mock_req.headers = {}  # Add mock headers
    mock_req.json = AsyncMock(return_value={
        "title": "Test",
        "content": "Test content",
        "user_id": "test_user_id",
        "data_type": "text"  # Add data_type
    })
    mock_background_tasks = Mock()
    
    mock_new_item = Mock()
    mock_new_item.data = [{
        "id": 1,
        "title": "Test",
        "content": "Test content",
        "user_id": "test_user_id"
    }]
    
    # Create mock for supabase chain
    mock_supabase = Mock()
    mock_table = Mock()
    mock_insert = Mock()
    
    mock_supabase.table.return_value = mock_table
    mock_table.insert.return_value = mock_insert
    mock_insert.execute.return_value = mock_new_item
    
    # Act
    with patch('services.db.supabase_services.supabase_client', return_value=mock_supabase):
        result = await create_item_handler(mock_req, mock_background_tasks)
    
    # Assert
    assert isinstance(result, JSONResponse)
    assert result.status_code == 200

@pytest.mark.asyncio
async def test_delete_item_handler():
    # Arrange
    mock_req = Mock()
    mock_req.json = AsyncMock(return_value={"data_type": "text"})
    
    mock_result = Mock()
    mock_result.data = [{
        "id": 1,
        "user_id": "test_user_id",
        "deleted_at": "2024-01-01T00:00:00"
    }]
    
    # Create mock for supabase
    mock_supabase = Mock()
    mock_table = Mock()
    mock_delete = Mock()
    mock_eq1 = Mock()
    mock_eq2 = Mock()
    mock_execute = Mock(return_value=mock_result)
    
    # Set up the mock chain
    mock_supabase.table.return_value = mock_table
    mock_table.delete.return_value = mock_delete
    mock_delete.eq.return_value = mock_eq1
    mock_eq1.eq.return_value = mock_eq2
    mock_eq2.execute = mock_execute
    
    # Act
    with patch('services.db.supabase_services.supabase_client', return_value=mock_supabase):
        result = await delete_item_handler(1, mock_req, "test_user_id")
    
    # Assert
    assert result == {"message": "Item deleted successfully"}
    mock_supabase.table.assert_called_once_with('user_text_files')
    mock_table.delete.assert_called_once()
    mock_delete.eq.assert_called_once_with('id', 1)
    mock_eq1.eq.assert_called_once_with('user_id', 'test_user_id')
    mock_execute.assert_called_once()

@pytest.mark.asyncio
async def test_get_items_headers_handler():
    # Arrange
    mock_headers = [{"id": 1, "title": "Test Header"}]
    mock_total_tokens = 50
    
    # Act
    with patch('app.api.routes.knowledge_base.get_kb_headers', AsyncMock(return_value=(mock_headers, mock_total_tokens))):
        result = await get_items_headers_handler("test_user_id")
    
    # Assert
    assert isinstance(result, JSONResponse)
    content = result.body.decode()
    assert "items" in content
    assert "total_tokens" in content

@pytest.mark.asyncio
async def test_scrape_url_handler():
    # Arrange
    mock_req = Mock()
    mock_req.json = AsyncMock(return_value={"urls": ["https://test.com"]})
    mock_background_tasks = Mock()
    
    # Act
    result = await scrape_url_handler(mock_req, mock_background_tasks, "test_user_id")
    
    # Assert
    assert result == {"message": "Scraping started in background", "urls": 1}

@pytest.mark.asyncio
async def test_crawl_url_handler():
    # Arrange
    mock_request = Mock()
    mock_request.url = "https://test.com"
    mock_urls = ["https://test.com/page1", "https://test.com/page2"]
    
    # Act
    with patch('app.api.routes.knowledge_base.map_url', AsyncMock(return_value=mock_urls)):
        result = await crawl_url_handler(mock_request, "test_user_id")
    
    # Assert
    assert result == mock_urls

@pytest.mark.asyncio
async def test_calculate_tokens_handler():
    # Arrange
    mock_req = Mock()
    mock_req.json = AsyncMock(return_value={"content": "Test content"})
    
    # Act
    with patch('app.api.routes.knowledge_base.num_tokens_from_string', return_value=2):
        result = await calculate_tokens_handler(mock_req, "test_user_id")
    
    # Assert
    assert result == {"token_count": 2}

@pytest.mark.asyncio
async def test_delete_item_handler_not_found():
    # Arrange
    mock_req = Mock()
    mock_req.json = AsyncMock(return_value={"data_type": "text"})
    
    mock_result = Mock()
    mock_result.data = []  # Empty list for not found case
    
    # Create mock for supabase
    mock_supabase = Mock()
    mock_table = Mock()
    mock_delete = Mock()
    mock_eq1 = Mock()
    mock_eq2 = Mock()
    mock_execute = Mock(return_value=mock_result)
    
    # Set up the mock chain
    mock_supabase.table.return_value = mock_table
    mock_table.delete.return_value = mock_delete
    mock_delete.eq.return_value = mock_eq1
    mock_eq1.eq.return_value = mock_eq2
    mock_eq2.execute = mock_execute
    
    # Act & Assert
    with patch('services.db.supabase_services.supabase_client', return_value=mock_supabase):
        with pytest.raises(HTTPException) as exc_info:
            await delete_item_handler(1, mock_req, "test_user_id")
    
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Item not found or not authorized to delete"
    mock_supabase.table.assert_called_once_with('user_text_files')
    mock_table.delete.assert_called_once()
    mock_delete.eq.assert_called_once_with('id', 1)
    mock_eq1.eq.assert_called_once_with('user_id', 'test_user_id')
    mock_execute.assert_called_once()

@pytest.mark.asyncio
async def test_delete_item_handler_invalid_request():
    # Arrange
    mock_req = Mock()
    mock_req.json = AsyncMock(side_effect=Exception("Invalid JSON"))
    
    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await delete_item_handler(1, mock_req, "test_user_id")
    
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Error parsing delete request" 