from dotenv import load_dotenv
from livekit import api
import os
import asyncio

load_dotenv()

LIVEKIT_URL = os.getenv('LIVEKIT_URL')
LIVEKIT_API_KEY = os.getenv('LIVEKIT_API_KEY')
LIVEKIT_API_SECRET = os.getenv('LIVEKIT_API_SECRET')
SIP_TRUNK_ID = "ST_q8fzfH63TurF"


async def create_sip_participant(phone_number, room_name):
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


async def initiate_outbound_call(phone_number: str, room_name: str):
    # First create the SIP participant
    await create_sip_participant(phone_number, room_name)

    # Create room if it doesn't exist
    livekit_api = api.LiveKitAPI(
        LIVEKIT_URL,
        LIVEKIT_API_KEY,
        LIVEKIT_API_SECRET
    )

    try:
        # Create the room
        create_request = api.CreateRoomRequest(
            name=room_name,
            empty_timeout=120,
            max_participants=2
        )
        await livekit_api.room.create_room(create_request)

        # The worker process running livekit_server.py will automatically
        # pick up the room and start the agent when it detects the SIP participant
        print(f"Created room {room_name} - worker will automatically start agent")

    finally:
        await livekit_api.aclose()


if __name__ == "__main__":
    print("Creating SIP participant")
    asyncio.run(initiate_outbound_call(
        "+447459264413",
        "outbound_447459264413",
    ))
