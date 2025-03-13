import logging

from fastapi import Request, HTTPException, APIRouter, BackgroundTasks, Depends, Header

from app.services.voice.livekit_services import token_gen, start_agent_request

router = APIRouter()

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# @router.get("/token")
# async def get_token(request: Request, background_tasks: BackgroundTasks):
#     """ 
#     Entrypoint to conversation with an agent

#     Create a token for a user to join a room & starts the agent """
#     print("\n\n /livekit/token endpoint called")

#     agent_id = request.query_params.get("agent_id")
#     user_id = request.query_params.get("user_id")
#     medium = request.query_params.get("medium")

#     access_token, livekit_url, room_name = await token_gen(agent_id, user_id, background_tasks, medium)

#     return {
#         "accessToken": access_token,
#         "url": livekit_url,
#         "roomName": room_name
#     }