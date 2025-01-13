import logging

from fastapi import Request, HTTPException, APIRouter, BackgroundTasks, Depends, Header
from supabase import create_client, Client

from app.core.config import settings
from services.voice.livekit_services import token_gen
from services.voice.agents import (
    create_agent,
    get_agents,
    delete_agent,
    get_agent_content,
    update_agent,
)

supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY
    )

router = APIRouter()

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
logger = logging.getLogger(__name__)


async def get_current_user(x_user_id: str = Header(...)):
    logger.info("Authenticating user")
    # logger.debug(f"Authorization header: {authorization}")
    logger.debug(f"x_user_id header: {x_user_id}")

    # if not authorization or not authorization.startswith('Bearer '):
    # logger.error("Invalid or missing token")
    # raise HTTPException(status_code=401, detail="Invalid or missing token")

    # Here you would typically validate the token with Clerk
    # For now, we'll just return the user ID from the header
    logger.info(f"User authenticated: {x_user_id}")
    return x_user_id


@router.get("/token")
async def get_token(request: Request, background_tasks: BackgroundTasks):
    """
    Entrypoint to conversation with an agent

    Create a token for a user to join a room & starts the agent """
    print("\n\n /livekit/token endpoint called")

    agent_id = request.query_params.get("agent_id")
    user_id = request.query_params.get("user_id")
    medium = request.query_params.get("medium")

    access_token, livekit_url, room_name = await token_gen(
        agent_id,
        user_id,
        background_tasks,
        medium
        )

    return {
        "accessToken": access_token,
        "url": livekit_url,
        "roomName": room_name
        }


@router.post("/new_agent")
async def new_agent_handler(
    request: Request,
    current_user: str = Depends(get_current_user)
):
    try:
        data = await request.json()
        # Extract user_id from header (via dependency) and add to data
        data['userId'] = current_user
        logger.debug(f"Received data with user_id: {data}")
        new_agent = await create_agent(data)
        return new_agent
    except Exception as e:
        logger.error(f"Error creating agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/agents")
async def get_agents_handler(current_user: str = Depends(get_current_user)):
    try:
        agents = await get_agents(current_user)
        return agents
    except Exception as e:
        logger.error(f"Error fetching agents: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.patch("/agents/{agent_id}")
async def update_agent_handler(agent_id: str, request: Request):
    try:
        data = await request.json()
        print(f"\n\nReceived data: {data}")
        # logger.debug(f"Received data: {data}")

        updated_agent = await update_agent(agent_id, data)
        return updated_agent
    except Exception as e:
        logger.error(f"Error updating agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/agent_content/{agent_id}")
async def get_agent_content_handler(agent_id: str):
    try:
        logger.info(f"Fetching agent content for agent_id: {agent_id}")
        print(f"\n\nFetching agent content for agent_id: {agent_id}")
        agent_content = await get_agent_content(agent_id)
        logger.info(f"Successfully fetched agent content: {agent_content}")
        return agent_content
    except Exception as e:
        logger.error(f"Error fetching agent content: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/agents/{agent_id}")
async def delete_agent_handler(
    agent_id: str,
    current_user: str = Depends(get_current_user)
):
    try:
        await delete_agent(agent_id, current_user)
        return {"message": "Agent deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
