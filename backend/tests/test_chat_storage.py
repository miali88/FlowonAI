import asyncio
import sys
import os
import pytest
from datetime import datetime

# Add the parent directory to Python path to import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.redis_service import RedisChatStorage
from services.chat.lk_chat import ChatHistory, ChatMessage, ResponseMetadata

@pytest.mark.asyncio  # Mark the test as an async test
async def test_chat_storage():
    # Test parameters
    agent_id = "test_agent"
    room_name = "test_room"
    
    print("\n=== Starting Redis Chat Storage Test ===\n")

    # 1. Create a test chat history
    print("1. Creating test chat history...")
    chat_history = ChatHistory()
    chat_history.messages = [
        ChatMessage(role="system", content="You are a helpful assistant"),
        ChatMessage(role="user", content="Hello!"),
        ChatMessage(role="assistant", content="Hi! How can I help you today?")
    ]
    
    # Add some test metadata
    response_id = "test_response_123"
    chat_history.response_metadata[response_id] = ResponseMetadata(
        response_id=response_id,
        rag_results=[{"source_url": "https://test.com/doc1"}]
    )

    try:
        # 2. Save to Redis
        print("2. Saving chat history to Redis...")
        await RedisChatStorage.save_chat(agent_id, room_name, chat_history.__dict__())  # Note the () here
        print("✓ Chat history saved successfully")

        # 3. Retrieve from Redis
        print("\n3. Retrieving chat history from Redis...")
        retrieved_data = await RedisChatStorage.get_chat(agent_id, room_name)
        assert retrieved_data is not None, "Failed to retrieve chat history"
        assert len(retrieved_data.get('messages', [])) == 3, "Incorrect number of messages"
        assert retrieved_data.get('response_metadata') is not None, "Missing response metadata"

        print("✓ Chat history retrieved successfully")
        print("\nRetrieved data:")
        print(f"- Number of messages: {len(retrieved_data.get('messages', []))}")
        print(f"- Response metadata exists: {bool(retrieved_data.get('response_metadata'))}")
        
        # 4. Delete from Redis
        print("\n4. Deleting chat history from Redis...")
        await RedisChatStorage.delete_chat(agent_id, room_name)
        
        # Verify deletion
        deleted_data = await RedisChatStorage.get_chat(agent_id, room_name)
        assert deleted_data is None, "Chat history not properly deleted
        print("✓ Chat history deleted successfully")

    except Exception as e:
        pytest.fail(f"Test failed with error: {str(e)}")

    print("\n=== Test Complete ===")

# This is no longer needed as pytest will handle the test execution
# if __name__ == "__main__":
#     asyncio.run(test_chat_storage()) 