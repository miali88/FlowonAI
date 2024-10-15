import os
import subprocess
import random
from fastapi import HTTPException, BackgroundTasks
from livekit import api as livekit_api
from app.core.config import settings
import uuid 
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import cartesia, deepgram, openai, silero

from livekit.api.room_service import RoomService
room_service = RoomService()
room_service.create_room("test")
# from livekit.api import LiveKitAPI
# api = LiveKitAPI()
# api.room_service.create_room("test")


from livekit.agents import llm
from supabase import create_client, Client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

from asyncio import Lock

# Add this global variable
agent_creation_locks = {}

async def token_gen(agent_id: str, user_id: str, background_tasks: BackgroundTasks):
    print("Token request received")
    print(f"Request parameters: agent_id={agent_id}, user_id={user_id}")
    
    if not agent_id:
        print("Missing agent_id in request")
        raise HTTPException(status_code=400, detail="Missing agent_id")
    if not user_id:
        print("Missing user_id in request")
        raise HTTPException(status_code=400, detail="Missing user_id")

    room_name = f"agent_{agent_id}_room_{uuid.uuid4()}"
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    livekit_server_url = os.getenv("LIVEKIT_URL")
    
    if not api_key or not api_secret or not livekit_server_url:
        print("LiveKit credentials not configured")
        raise HTTPException(status_code=500, detail="LiveKit credentials not configured")

    print(f"Generating token for room: {room_name}")
    token = livekit_api.AccessToken(api_key, api_secret)\
        .with_identity(user_id)\
        .with_name(f"User {user_id}")\
        .with_grants(livekit_api.VideoGrants(
            room_join=True,
            room=room_name))

    return token.to_jwt(), livekit_server_url, room_name

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

async def start_agent_request(room_name: str, agent_id: str, user_id: str):
    print(f"Starting create_agent_request for room: {room_name}")
    temperature = "0.6"

    agent = await get_agent(agent_id)

    instructions = agent['instructions']
    voice_id = agent['voice']
    functions = agent['functions']
    opening_line = agent['openingLine']

    initial_ctx = llm.ChatContext().append(
        role="system",
        text="You are an arab rug merchant named Ismail")

    room_service.list_rooms()

    agent = VoiceAssistant(
        vad=silero.VAD.load(),
        # flexibility to use any models
        stt=deepgram.STT(model="nova-2-general"),
        llm=openai.LLM(),   
        tts=cartesia.TTS(),
        # intial ChatContext with system prompt
        chat_ctx=initial_ctx,
        # whether the agent can be interrupted
        allow_interruptions=True,
        # sensitivity of when to interrupt
        interrupt_speech_duration=0.5,
        interrupt_min_words=0,
        # minimal silence duration to consider end of turn
        min_endpointing_delay=0.5,
        # callback to run before LLM is called, can be used to modify chat context
        before_llm_cb=None,
        # callback to run before TTS is called, can be used to customize pronounciation
        before_tts_cb=None,
    )

    # start the participant for a particular room, taking audio input from a single participant
    agent.start(room_name)


    # # Construct the command
    # command = [
    #     "python", 
    #     "services/voice/run_open.py",
    #     "--instructions", instructions,
    #     "--voice", voice_id,
    #     "--temperature", temperature,
    #     "--room", room_name,
    #     "--opening_line", opening_line,
    #     "--agent_id", agent_id,
    #     "--user_id", user_id]

    # print(f"Executing command: {' '.join(command)}")

    # # Run run_open.py as a subprocess with arguments
    # subprocess.Popen(command)

    return 

async def get_agent(agent_id):
    response = supabase.table('agents') \
        .select('*') \
        .eq('id', agent_id) \
        .execute()
    
    if response.data:
        return response.data[0]
    else:
        return None