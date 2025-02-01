import pytest
from unittest.mock import Mock, AsyncMock

@pytest.fixture
def mock_request():
    request = Mock()
    request.json = AsyncMock()
    return request

@pytest.fixture
def mock_current_user():
    return "test_user_id" 