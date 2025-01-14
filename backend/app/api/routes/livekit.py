import logging
from typing import Dict, Any, Tuple
from fastapi import Request, HTTPException, APIRouter, BackgroundTasks, Depends, Header
from supabase import create_client, Client
from fastapi.responses import JSONResponse

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


async def get_current_user(x_user_id: str = Header(...)) -> str:
    logger.info("Authenticating user")
    logger.debug(f"x_user_id header: {x_user_id}")
    logger.info(f"User authenticated: {x_user_id}")
    return x_user_id


@router.get("/token")
async def get_token(request: Request, background_tasks: BackgroundTasks) -> JSONResponse:
    print("\n\n /livekit/token endpoint called")

    agent_id = request.query_params.get("agent_id")
    user_id = request.query_params.get("user_id")
    medium = request.query_params.get("medium")

    # Validate required parameters
    if not all([agent_id, user_id, medium]):
        raise HTTPException(status_code=400, detail="Missing required parameters")

    access_token, livekit_url, room_name = await token_gen(
        str(agent_id),  # Type cast to str
        str(user_id),   # Type cast to str
        background_tasks,
        str(medium)     # Type cast to str
    )

    return JSONResponse({
        "accessToken": access_token,
        "url": livekit_url,
        "roomName": room_name
    })


@router.post("/new_agent")
async def new_agent_handler(
    request: Request,
    current_user: str = Depends(get_current_user)
) -> Dict[str, Any]:
    try:
        data = await request.json()
        data['userId'] = current_user
        logger.debug(f"Received data with user_id: {data}")
        new_agent = await create_agent(data)
        return dict(new_agent)
    except Exception as e:
        logger.error(f"Error creating agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/agents")
async def get_agents_handler(current_user: str = Depends(get_current_user)) -> Dict[str, Any]:
    try:
        agents = await get_agents(current_user)
        return dict(agents)
    except Exception as e:
        logger.error(f"Error fetching agents: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.patch("/agents/{agent_id}")
async def update_agent_handler(agent_id: str, request: Request) -> Dict[str, Any]:
    try:
        data = await request.json()
        print(f"\n\nReceived data: {data}")
        
        updated_agent = await update_agent(int(agent_id), data)
        return dict(updated_agent)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid agent ID format")
    except Exception as e:
        logger.error(f"Error updating agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/agent_content/{agent_id}")
async def get_agent_content_handler(agent_id: str) -> Dict[str, Any]:
    try:
        logger.info(f"Fetching agent content for agent_id: {agent_id}")
        print(f"\n\nFetching agent content for agent_id: {agent_id}")
        agent_content = await get_agent_content(agent_id)
        return dict(agent_content)
    except Exception as e:
        logger.error(f"Error fetching agent content: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/agents/{agent_id}")
async def delete_agent_handler(
    agent_id: str,
    current_user: str = Depends(get_current_user)
) -> Dict[str, str]:
    try:
        # Convert agent_id to int if your delete_agent function expects an int
        await delete_agent(int(agent_id), current_user)
        return {"message": "Agent deleted successfully"}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid agent ID format")
    except Exception as e:
        logger.error(f"Error deleting agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
