import logging
import os

from fastapi import Request, HTTPException, APIRouter
from livekit import api

from services.voice.periperi_livekit import CustomVoiceAssistant

router = APIRouter()
logger = logging.getLogger(__name__)

AGENT_REGISTRY = {
    "agent_1": {
        "name": "SupportBot",
        "voice_id": "HyRvE4YNE0T7VnHEFacJ",
    },
    "agent_2": {
        "name": "SalesBot",
        "voice_id": "AnotherVoiceID",
    },
    # Add more agents as needed
}

@router.get("/token")
async def get_token(request: Request):
    logger.info("Token request received")
    agent_id = request.query_params.get("agent_id")
    user_id = request.query_params.get("user_id")
    
    logger.debug(f"Request parameters: agent_id={agent_id}, user_id={user_id}")
    
    if not agent_id:
        logger.warning("Missing agent_id in request")
        raise HTTPException(status_code=400, detail="Missing agent_id")
    if not user_id:
        logger.warning("Missing user_id in request")
        raise HTTPException(status_code=400, detail="Missing user_id")

    room_name = f"agent_{agent_id}_room"
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    livekit_server_url = os.getenv("LIVEKIT_URL")
    
    if not api_key or not api_secret or not livekit_server_url:
        logger.error("LiveKit credentials not configured")
        raise HTTPException(status_code=500, detail="LiveKit credentials not configured")

    logger.debug(f"Generating token for room: {room_name}")
    token = api.AccessToken(api_key, api_secret)\
        .with_identity(user_id)\
        .with_name(f"User {user_id}")\
        .with_grants(api.VideoGrants(
            room_join=True,
            room=room_name,
        ))

    # # Initialize your custom voice assistant if needed
    # voice_assistant = CustomVoiceAssistant()
    # # voice_assistant.create_agent(
    # #     agent_id=agent_id,
    # #     agent_name=AGENT_REGISTRY[agent_id]["name"],
    # #     voice_id=AGENT_REGISTRY[agent_id]["voice_id"],
    # # )

    logger.info(f"Token generated successfully for user {user_id} in room {room_name}")

    return {
        "accessToken": token.to_jwt(),
        "url": livekit_server_url
    }