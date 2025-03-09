from typing import List, Dict, Any

def format_transcript_messages(messages: List[Any]) -> List[Dict]:
    """
    Format chat messages into a standardized transcript format.
    
    Args:
        messages: List of ChatMessage objects containing role, content, and optional name
        
    Returns:
        List of dictionaries with formatted messages following conversation_history schema
    """
    formatted_transcript = []
    
    for msg in messages:
        message_dict = {}
        
        # Convert the role-based format to match conversation_history format
        if msg.role == "assistant":
            message_dict["assistant_message"] = msg.content
        elif msg.role == "user":
            message_dict["user_message"] = msg.content
        elif msg.role == "function":  # Handle function/tool messages
            message_dict["tool"] = {
                "name": msg.name if hasattr(msg, 'name') else None,
                "content": msg.content
            }
        
        if message_dict:  # Only append if we have content
            formatted_transcript.append(message_dict)
            
    return formatted_transcript
