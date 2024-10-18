import os
import random
from fastapi import HTTPException, BackgroundTasks
from livekit import api
from app.core.config import settings
import uuid 
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import cartesia, deepgram, openai, silero
from livekit.api import LiveKitAPI, CreateRoomRequest, ListRoomsRequest, ListParticipantsRequest
import os 
from dotenv import load_dotenv
from livekit.agents import llm
from livekit.agents.llm import FunctionContext

load_dotenv()

async def create_livekit_api():
    return LiveKitAPI(
        url=os.getenv("LIVEKIT_URL"),
        api_key=os.getenv("LIVEKIT_API_KEY"),
        api_secret=os.getenv("LIVEKIT_API_SECRET"))

from livekit.agents import llm
from supabase import create_client, Client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

from asyncio import Lock

# Add this global variable
room_locks = {}

async def token_gen(agent_id: str, user_id: str, background_tasks: BackgroundTasks):
    print("Token request received")
    print(f"Request parameters: agent_id={agent_id}, user_id={user_id}")
    
    if not agent_id or not user_id:
        raise HTTPException(status_code=400, detail="Missing agent_id or user_id")

    room_name = f"agent_{agent_id}_room_{user_id}"

    # Use a lock to ensure only one token generation process happens at a time for this room
    if room_name not in room_locks:
        room_locks[room_name] = Lock()
    
    async with room_locks[room_name]:
        api_key = os.getenv("LIVEKIT_API_KEY")
        api_secret = os.getenv("LIVEKIT_API_SECRET")
        livekit_server_url = os.getenv("LIVEKIT_URL")
        
        if not api_key or not api_secret or not livekit_server_url:
            raise HTTPException(status_code=500, detail="LiveKit credentials not configured")

        print(f"Generating token for room: {room_name}")
        token = api.AccessToken(api_key, api_secret)\
            .with_identity(f"visitorId_{uuid.uuid4()}")\
            .with_name(user_id  )\
            .with_grants(api.VideoGrants(
                room_join=True,
                room=room_name))

        try:
            livekit_api = await create_livekit_api()

            # List rooms
            list_request = ListRoomsRequest()
            rooms_response = await livekit_api.room.list_rooms(list_request)
            
            # Check if the room exists
            room_exists = any(room.name == room_name for room in rooms_response.rooms)

            if room_exists:

                print(f"Room {room_name} already exists")

                # Print all rooms
                print("Room exists. All rooms:")
                for room in rooms_response.rooms:
                    print(f"Room name: {room.name}, SID: {room.sid}")

                list_participants_request = ListParticipantsRequest(room=room_name)
                participants_response = await livekit_api.room.list_participants(list_participants_request)
                print(f"\nParticipants in room '{room_name}':")
                for participant in participants_response.participants:
                    print(f"Participant: {participant.identity}, SID: {participant.sid}")     
            else:
                print(f"Room {room_name} doesn't exist, creating it and starting the agent")
                await create_room(room_name, token.to_jwt(), agent_id)

        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            raise HTTPException(status_code=500, detail="Error checking room existence")
        finally:
            await livekit_api.aclose()
        return token.to_jwt(), livekit_server_url, room_name


async def create_room(room_name: str, access_token: str, agent_id: str):
    try:
        print(f"Starting create_agent_request for room: {room_name}")

        livekit_api = await create_livekit_api()

        # Create a room if it doesn't exist
        create_request = CreateRoomRequest(name=room_name)
        room = await livekit_api.room.create_room(create_request)
        print(f"Created room: {room.name} with SID: {room.sid}")

        print("Room created, starting agent")
        await start_agent_request(access_token, agent_id, room_name)

    finally:
        await livekit_api.aclose()
        print("livekit_api closed in create_room")


async def start_agent_request(access_token: str, agent_id: str, room_name: str):
    livekit_api = await create_livekit_api()
    try:
        # Instead of creating the agent here, we'll just ensure the room exists
        # and let the agent worker handle the agent creation and management
        room = await livekit_api.room.create_room(CreateRoomRequest(name=room_name))
        print(f"Ensured room exists: {room.name} with SID: {room.sid}")

        # The agent will be created and managed by the entrypoint function in livekit_server.py
        print(f"Room ready for agent in: {room_name}")

    finally:
        await livekit_api.aclose()
        print("livekit_api closed in start_agent_request")


async def create_voice_assistant(agent_id):
    agent = await get_agent(agent_id)

    initial_ctx = llm.ChatContext().append(
        role="system",
        text=agent['instructions'])
    

    return VoiceAssistant(
        vad=silero.VAD.load(),
        stt=deepgram.STT(model="nova-2-general"),
        llm=openai.LLM(),   
        tts=cartesia.TTS(),
        # fnc_ctx=AssistantFunction(),
        chat_ctx=initial_ctx,
        allow_interruptions=True,
        interrupt_speech_duration=0.5,
        interrupt_min_words=0,
        min_endpointing_delay=0.5)


# class MyAgentFunctions(FunctionContext):
#     def __init__(self):
#         super().__init__()

#     @llm.ai_callable(
#         name="get_weather",
#         description="Get the current weather for a given location",
#         auto_retry=True
#     )
#     def get_weather(self, location: str) -> str:
#         """
#         Get the current weather for a given location.

#         Args:
#             location (str): The name of the city or location.

#         Returns:
#             str: A description of the current weather.
#         """
#         # Implement your weather fetching logic here
#         return f"The weather in {location} is sunny and 25°C."

#     @llm.ai_callable(
#         description="",
#         auto_retry=False
#     )
#     def calculate_sum(self, a: int, b: int) -> int:
#         """
#         Calculate the sum of two numbers.

#         Args:
#             a (int): The first number.
#             b (int): The second number.

#         Returns:
#             int: The sum of a and b.
#         """
#         return a + b



async def get_agent(agent_id):
    response = supabase.table('agents') \
        .select('*') \
        .eq('id', agent_id) \
        .execute()
    
    if response.data:
        return response.data[0]
    else:
        return None


async def token_embed_gen(agent_id: str, background_tasks: BackgroundTasks):
    print("Token request received")
    print(f"Request parameters: agent_id={agent_id}")
    
    if not agent_id:
        print("Missing agent_id in request")
        raise HTTPException(status_code=400, detail="Missing agent_id")

    visitor_id = f"{random.randint(100000000000, 999999999999):012d}"
    room_name = f"agent_{agent_id}_room_{visitor_id}"
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    livekit_server_url = os.getenv("LIVEKIT_URL")
    
    if not api_key or not api_secret or not livekit_server_url:
        print("LiveKit credentials not configured")
        raise HTTPException(status_code=500, detail="LiveKit credentials not configured")

    print(f"Generating token for room: {room_name}")
    token = livekit_api.AccessToken(api_key, api_secret)\
        .with_identity(visitor_id)\
        .with_name(f"Visitor {visitor_id}")\
        .with_grants(livekit_api.VideoGrants(
            room_join=True,
            room=room_name))

    return token.to_jwt(), livekit_server_url, room_name
