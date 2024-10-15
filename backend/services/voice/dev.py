import asyncio
from livekit.api import LiveKitAPI, CreateRoomRequest, ListRoomsRequest, ListParticipantsRequest
import os 
from dotenv import load_dotenv

load_dotenv()

async def create_livekit_api():
    return LiveKitAPI(
        url=os.getenv("LIVEKIT_URL"),
        api_key=os.getenv("LIVEKIT_API_KEY"),
        api_secret=os.getenv("LIVEKIT_API_SECRET")
    )

async def main():
    livekit_api = await create_livekit_api()

    try:
        # Create a room
        create_request = CreateRoomRequest(name="my_new_room")
        new_room = await livekit_api.room.create_room(create_request)
        print(f"Created room: {new_room.name} with SID: {new_room.sid}")

        # List rooms
        list_request = ListRoomsRequest()
        rooms_response = await livekit_api.room.list_rooms(list_request)
        for room in rooms_response.rooms:
            print(f"Room: {room.name}, SID: {room.sid}")

        # List participants in the newly created room
        list_participants_request = ListParticipantsRequest(room=new_room.name)
        participants_response = await livekit_api.room.list_participants(list_participants_request)
        
        print(f"\nParticipants in room '{new_room.name}':")
        for participant in participants_response.participants:
            print(f"Participant: {participant.identity}, SID: {participant.sid}")

    finally:
        # Don't forget to close the session when you're done
        await livekit_api.aclose()

if __name__ == "__main__":
    asyncio.run(main())
