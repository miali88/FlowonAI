import asyncio
import os
from livekit import api, rtc

async def transfer_participant(
    source_room_name: str,
    target_room_name: str,
    participant_identity: str,
):
    print("will sleep for 10 secs since we're immediately calling this after call_transfer")
    await asyncio.sleep(10)
    
    try:
        print(f"Starting transfer for participant {participant_identity} from {source_room_name} to {target_room_name}")
        livekit_api = api.LiveKitAPI(
            url=os.getenv("LIVEKIT_URL"),
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET")
        )
        print("LiveKit API client initialized successfully")

        # First verify target room exists
        print(f"Checking if target room {target_room_name} exists...")
        list_request = api.ListRoomsRequest(names=[target_room_name])
        rooms_response = await livekit_api.room.list_rooms(list_request)
        
        if not rooms_response.rooms:
            print(f"Target room {target_room_name} not found, creating new room...")
            create_request = api.CreateRoomRequest(
                name=target_room_name,
                empty_timeout=120,
                max_participants=2
            )
            await livekit_api.room.create_room(create_request)
            print(f"Successfully created new room: {target_room_name}")
        else:
            print(f"Target room {target_room_name} already exists")

        # Generate token for target room first
        print(f"Generating access token for participant {participant_identity}")
        token = api.AccessToken(
            os.getenv("LIVEKIT_API_KEY"),
            os.getenv("LIVEKIT_API_SECRET")
        ).with_identity(participant_identity)\
         .with_grants(api.VideoGrants(
            room_join=True,
            room=target_room_name
         ))
        new_token = token.to_jwt()
        print("Access token generated successfully")

        # Create and connect to target room first
        target_room = rtc.Room()
        
        # Set up connection handler
        connection_established = asyncio.Event()
        
        @target_room.on("participant_connected")
        def on_participant_connected(participant: rtc.RemoteParticipant):
            if participant.identity == participant_identity:
                connection_established.set()

        # Connect to target room
        print(f"Connecting to target room {target_room_name}")
        await target_room.connect(
            url=os.getenv("LIVEKIT_URL"),
            token=new_token,
            options=rtc.RoomOptions(
                auto_subscribe=True
            )
        )

        # Now remove from source room
        print(f"Removing participant {participant_identity} from source room {source_room_name}")
        await livekit_api.room.remove_participant(api.RoomParticipantIdentity(
            room=source_room_name,
            identity=participant_identity,
        ))
        print(f"Successfully removed participant from {source_room_name}")

        # Wait for participant to connect to target room
        try:
            await asyncio.wait_for(connection_established.wait(), timeout=30.0)
            print(f"Participant successfully connected to target room {target_room_name}")
            return new_token
        except asyncio.TimeoutError:
            print("Timeout waiting for participant to connect to target room")
            raise Exception("Transfer failed - participant did not connect to target room")

    except Exception as e:
        print(f"Error transferring participant: {str(e)}")
        raise
    finally:
        if 'livekit_api' in locals():
            await livekit_api.aclose()
            print("LiveKit API connection closed")
        if 'target_room' in locals():
            await target_room.disconnect()

