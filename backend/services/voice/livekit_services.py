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

async def start_agent_request(room_name: str, agent_id: str):
    print(f"Starting create_agent_request for room: {room_name}")
    
    # # Use a lock to prevent multiple agent creations for the same room
    # if room_name not in agent_creation_locks:
    #     agent_creation_locks[room_name] = Lock()
    
    # async with agent_creation_locks[room_name]:
    #     # Check if an agent process is already running for this room
    #     if await is_agent_running(room_name):
    #         print(f"Agent already running for room: {room_name}")
    #         return

    #     try:
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
        "--agent_id", agent_id]

    print(f"Executing command: {' '.join(command)}")

    # Run run_open.py as a subprocess with arguments
    subprocess.Popen(command)
    # print(f"Agent process started for room: {room_name}")
    #     except Exception as e:
    #         print(f"Error starting agent process for room {room_name}: {str(e)}")
    #         print(traceback.format_exc())

# async def is_agent_running(room_name: str) -> bool:
#     # Implement a check to see if an agent is already running for this room
#     # This could involve checking a database, a file, or a shared memory structure
#     # For now, we'll use a simple file-based approach
#     lock_file = f"/tmp/agent_lock_{room_name}"
#     if os.path.exists(lock_file):
#         return True
#     else:
#         # Create the lock file
#         with open(lock_file, 'w') as f:
#             f.write("1")
#         return False

async def get_agent(agent_id):
    response = supabase.table('agents') \
        .select('*') \
        .eq('id', agent_id) \
        .execute()
    
    if response.data:
        return response.data[0]
    else:
        return None