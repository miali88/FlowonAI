from services.cache import get_all_agents
import logging
from services.db.supabase_services import get_supabase

logger = logging.getLogger(__name__)

""" DETECT CALL TYPE (INBOUND, OUTBOUND, WEB), EXTRACT AGENT ID, AND CREATE VOICE ASSISTANT """

async def get_agent_id_from_call_data(room_name: str):    
    try:
        supabase = await get_supabase()
        # Extract phone number from room name (format: call-_+13614281772_2p9dY5xViH9b)
        phone_number = room_name.split('_')[1] if '_' in room_name else None
        
        if not phone_number:
            logger.error(f"Could not extract phone number from room name: {room_name}")
            return None
            
        # Query Supabase for the twilio number and get assigned_agent_id
        result = await supabase.table('twilio_numbers').select('assigned_agent_id').eq('phone_number', phone_number).execute()
        
        if not result.data:
            logger.error(f"No matching twilio number found in database: {phone_number}")
            return None
            
        agent_id = result.data[0]['assigned_agent_id']
        return agent_id

    except Exception as e:
        logger.error(f"Error getting twilio number from database: {str(e)}")
        return None



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
