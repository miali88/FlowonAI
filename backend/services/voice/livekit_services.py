import os
import subprocess
import random
from fastapi import HTTPException, BackgroundTasks
from livekit import api as livekit_api
from app.core.config import settings

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

    random_digits = f"{random.randint(1000, 9999):04d}"
    room_name = f"agent_{agent_id}_room_{random_digits}"
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

    # Construct the command
    command = [
        "python", 
        "services/voice/run_open.py",
        "--instructions", instructions,
        "--voice", voice_id,
        "--temperature", temperature,
        "--room", room_name,
        "--opening_line", opening_line,
        "--agent_id", agent_id,
        "--user_id", user_id]

    print(f"Executing command: {' '.join(command)}")

    # Run run_open.py as a subprocess with arguments
    subprocess.Popen(command)

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