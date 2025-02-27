from dotenv import load_dotenv
from livekit import api
import os
import asyncio

load_dotenv()

LIVEKIT_URL = os.getenv('LIVEKIT_URL')
LIVEKIT_API_KEY = os.getenv('LIVEKIT_API_KEY')
LIVEKIT_API_SECRET = os.getenv('LIVEKIT_API_SECRET')
SIP_TRUNK_ID = "ST_q8fzfH63TurF"

"""
cli: lk dispatch
"""

async def create_sip_participant(phone_number: str, room_name: str) -> None:
    print("create_sip_participant method invoked")
    livekit_api = api.LiveKitAPI(
        LIVEKIT_URL,
        LIVEKIT_API_KEY,
        LIVEKIT_API_SECRET
    )
    sip_trunk_id = SIP_TRUNK_ID
    await livekit_api.sip.create_sip_participant(
        api.CreateSIPParticipantRequest(
            sip_trunk_id=sip_trunk_id,
            sip_call_to=phone_number,
            room_name=room_name,
            participant_identity=f"sip_{phone_number}",
            participant_name="SIP Caller"
        )
    )
    await livekit_api.aclose()

async def initiate_outbound_call(phone_number: str, room_name: str, agent_id: str = None) -> None:
    # First create the SIP participant
    await create_sip_participant(phone_number, room_name)

    # Create room if it doesn't exist
    livekit_api = api.LiveKitAPI(
        LIVEKIT_URL,
        LIVEKIT_API_KEY,
        LIVEKIT_API_SECRET
    )

    try:
        # Create the room with metadata containing the agent_id if provided
        create_request = api.CreateRoomRequest(
            name=room_name,
            empty_timeout=120,
            max_participants=2,
            metadata=agent_id if agent_id else None
        )
        await livekit_api.room.create_room(create_request)

        # The worker process running livekit_server.py will automatically
        # pick up the room and start the agent when it detects the SIP participant
        print(f"Created room {room_name} - worker will automatically start agent")
        if agent_id:
            print(f"Room created with agent_id: {agent_id}")
        else:
            print("Warning: No agent_id provided for outbound call")

    finally:
        await livekit_api.aclose()

if __name__ == "__main__":
    print("Creating SIP participant")
    numb_to_call = "+447745187688"
    # Example agent ID - replace with an actual agent ID from your database
    agent_id = "1bf662cf-4d01-4c82-b919-8534ad071380"
    room_name = f"outbound_{numb_to_call}"
    asyncio.run(initiate_outbound_call(
        numb_to_call,
        room_name,
        agent_id
    ))
