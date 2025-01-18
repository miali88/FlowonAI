from services.cache import get_all_agents
import os
import logging
from typing import Optional, Any, List, Dict

logger = logging.getLogger(__name__)

"""
DETECT CALL TYPE (INBOUND, OUTBOUND, WEB), EXTRACT AGENT ID, AND CREATE VOICE ASSISTANT
"""


async def get_agent_id_from_call_data(room_name: str) -> Optional[str]:
    import json
    agents = await get_all_agents()

    print("Current working directory:", os.getcwd())

    def get_agent_id_by_phone(data: List[Dict[str, Any]], phone_number: str) -> Optional[str]:
        for agent in data:
            if agent.get('assigned_telephone') == phone_number:
                agent_id = agent.get('id')
                return str(agent_id) if agent_id is not None else None
        return None

    try:
        with open('backend/call_data.json', 'r') as f:
            call_data_from_file = json.load(f)
        call_metadata = call_data_from_file.get(room_name, {})
        twilio_number = call_metadata.get('twilio_phone_number')
    except FileNotFoundError:
        print("call_data.json not found")
        twilio_number = None
    except json.JSONDecodeError:
        print("Error decoding call_data.json")
        twilio_number = None
    except Exception as e:
        print(f"Error reading call_data.json: {str(e)}")
        twilio_number = None

    print(f"\nroom_name: {room_name}")
    print(f"twilio_number from file: {twilio_number}")
    agent_id = get_agent_id_by_phone(agents, twilio_number)
    print(f"agent_id: {agent_id}")
    return agent_id


async def detect_call_type_and_get_agent_id(room_name: str) -> tuple[str, str]:
    """
    Detects the call type (inbound, outbound, web) and returns
    the associated agent_id and call_type.

    Args:
        room_name (str): The name of the room/call

    Returns:
        tuple[str, str]: A tuple containing (agent_id, call_type)
    """
    if room_name.startswith("call-"):
        print("entrypoint - telephone call detected")
        agent_id = await get_agent_id_from_call_data(room_name)
        if not agent_id:
            logger.error(f"Could not find agent_id for room: {room_name}")
            return "Error: Could not find agent configuration", "error"
        return agent_id, "telephone"

    elif room_name.startswith("outbound_"):
        print("outbound call detected")
        modified_room_name = room_name[9:]  # Skip 'outbound_' prefix
        agent_id = await get_agent_id_from_call_data(modified_room_name)
        if not agent_id:
            logger.error(f"Could not find agent_id for room: {room_name}")
            return "Error: Could not find agent configuration", "error"
        return agent_id, "outbound"

    elif room_name.endswith("_textbot"):
        print("Textbot chat call detected")
        # Extract agent_id from room name
        # format: agent_{agent_id}_room_{visitor_id}_textbot
        agent_id = room_name.split("_room_")[0].replace("agent_", "")
        return agent_id, "textbot"

    else:
        print("voice chat call detected")
        # Extract agent_id from room name format: agent_{agent_id}_room_{visitor_id}
        agent_id = room_name.split("_room_")[0].replace("agent_", "")
        return agent_id, "voice"
