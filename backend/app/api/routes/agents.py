import logging
from fastapi import Request, HTTPException, APIRouter, Depends, Header
from supabase import create_client, Client

from app.core.config import settings
from services.voice.agents import create_agent, get_agents, delete_agent, get_agent_content, update_agent
from services.agent_create import create_agents_from_urls

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

router = APIRouter()

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def get_current_user(x_user_id: str = Header(...)):
    logger.info("Authenticating user")
    logger.debug(f"x_user_id header: {x_user_id}")
    logger.info(f"User authenticated: {x_user_id}")
    return x_user_id

@router.post("/")
async def new_agent_handler(request: Request, current_user: str = Depends(get_current_user)):
    try:
        data = await request.json()
        data['userId'] = current_user
        logger.debug(f"Received data with user_id: {data}")

        new_agent = await create_agent(data)
        return new_agent
    except Exception as e:
        logger.error(f"Error creating agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/")
async def get_agents_handler(current_user: str = Depends(get_current_user)):
    try:
        agents = await get_agents(current_user)
        return agents
    except Exception as e:
        logger.error(f"Error fetching agents: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.patch("/{agent_id}")
async def update_agent_handler(agent_id: str, request: Request):
    try:
        data = await request.json()
        print(f"\n\nReceived data: {data}")
        updated_agent = await update_agent(agent_id, data)
        return updated_agent
    except Exception as e:
        logger.error(f"Error updating agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{agent_id}")
async def delete_agent_handler(agent_id: str, current_user: str = Depends(get_current_user)):
    try:
        await delete_agent(agent_id, current_user)
        return {"message": "Agent deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/agent_content/{agent_id}")
async def get_agent_content_handler(agent_id: str):
    try:
        logger.info(f"Fetching agent content for agent_id: {agent_id}")
        print(f"\n\nFetching agent content for agent_id: {agent_id}")
        agent_content = await get_agent_content(agent_id)
        return agent_content
    except Exception as e:
        logger.error(f"Error fetching agent content: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/auto_create_agent")
async def auto_create_agent_handler(request: Request, current_user: str = Depends(get_current_user)):
    try:
        data = await request.json()
        url = data.get('url')
        
        if not url:
            raise HTTPException(status_code=400, detail="URL is required")
            
        agent_id = await create_agents_from_urls(url)
        
        return {
            "status": "success",
            "message": "Agent creation started",
            "agent_id": agent_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in auto create agent: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/check_agent_status")
async def check_agent_status(request: Request, current_user: str = Depends(get_current_user)):
    try:
        return {
            "status": "completed",
            "agent_url": "https://flowon.ai/iframe?agentId=AGENT_ID"
        }
    except Exception as e:
        logger.error(f"Error checking agent status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
