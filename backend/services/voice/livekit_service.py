from livekit import RoomServiceClient
from dotenv import load_dotenv
import os

load_dotenv()

LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")

# The LiveKit Cloud URL you provided
host = "wss://flowon-f7dobs7m.livekit.cloud"

# Create a RoomServiceClient
room_client = RoomServiceClient(host, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)

# List all active rooms
rooms = room_client.list_rooms()

for room in rooms:
    print(f"Room: {room.name}")
    
    # List participants in the room
    participants = room_client.list_participants(room.name)
    
    for participant in participants:
        print(f"  Participant: {participant.identity}")
        
        # Remove the participant from the room
        room_client.remove_participant(room.name, participant.identity)
        print(f"  Removed participant: {participant.identity}")
    
    # Delete the room after removing all participants
    room_client.delete_room(room.name)
    print(f"Deleted room: {room.name}")

print("All sessions terminated.")