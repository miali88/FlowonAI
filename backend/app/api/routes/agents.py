import logging
from fastapi import Request, HTTPException, APIRouter, Depends, Header, Body
from typing import Dict, List, Any

from app.services.voice.agents import (
    create_agent, get_agents, delete_agent, 
    get_agent_content, update_agent, get_agent_completion
)
from app.services.agent_create import create_agents_from_urls
from app.core.auth import get_current_user
from app.models.agent import (
    AgentInDB, 
    AgentCompletionRequest,
    AgentCompletionResponse,
    AgentAutoCreateRequest,
    AgentAutoCreateResponse,
    AgentStatusResponse,
    AgentDeleteResponse
)

router = APIRouter()

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@router.post("/", response_model=Dict[str, List[AgentInDB]], status_code=201)
async def new_agent_handler(request: Request, current_user: str = Depends(get_current_user)):
    """
    Create a new agent for the authenticated user.
    
    Args:
        request: The HTTP request containing agent data
        current_user: The authenticated user ID
        
    Returns:
        The newly created agent
        
    Raises:
        HTTPException: If an error occurs during creation
    """
    try:
        data = await request.json()
        data['userId'] = current_user

        new_agent = await create_agent(data)
        return new_agent
    except Exception as e:
        logger.error(f"Error creating agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/", response_model=Dict[str, List[AgentInDB]])
async def get_agents_handler(current_user: str = Depends(get_current_user)):
    """
    Get all agents for the authenticated user.
    
    Args:
        current_user: The authenticated user ID
        
    Returns:
        List of agents belonging to the user
        
    Raises:
        HTTPException: If an error occurs during fetching
    """
    try:
        agents = await get_agents(current_user)
        return {"data": agents}
    except Exception as e:
        logger.error(f"Error fetching agents: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.patch("/{agent_id}", response_model=Dict[str, List[AgentInDB]])
async def update_agent_handler(agent_id: str, request: Request):
    """
    Update an agent by ID.
    
    Args:
        agent_id: ID of the agent to update
        request: HTTP request containing update data
        
    Returns:
        The updated agent
        
    Raises:
        HTTPException: If an error occurs during update
    """
    try:
        data = await request.json()
        logger.info(f"Updating agent {agent_id}")
        updated_agent = await update_agent(agent_id, data)
        return {"data": updated_agent}
    except Exception as e:
        logger.error(f"Error updating agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{agent_id}", response_model=AgentDeleteResponse)
async def delete_agent_handler(agent_id: str, current_user: str = Depends(get_current_user)):
    """
    Delete an agent by ID.
    
    Args:
        agent_id: ID of the agent to delete
        current_user: The authenticated user ID
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If an error occurs during deletion
    """
    try:
        await delete_agent(agent_id, current_user)
        return {"message": "Agent deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/agent_content/{agent_id}", response_model=Dict[str, List[AgentInDB]])
async def get_agent_content_handler(agent_id: str):
    """
    Get the content of an agent by ID.
    
    Args:
        agent_id: ID of the agent to get
        
    Returns:
        The agent content
        
    Raises:
        HTTPException: If an error occurs during fetching
    """
    try:
        logger.info(f"Fetching agent content for agent_id: {agent_id}")
        agent_content = await get_agent_content(agent_id)
        return {"data": agent_content}
    except Exception as e:
        logger.error(f"Error fetching agent content: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/auto_create_agent", response_model=AgentAutoCreateResponse)
async def auto_create_agent_handler(
    data: AgentAutoCreateRequest = Body(...),
    current_user: str = Depends(get_current_user)
):
    """
    Auto-create an agent from a URL.
    
    Args:
        data: Request containing the URL
        current_user: The authenticated user ID
        
    Returns:
        Success message and agent ID
        
    Raises:
        HTTPException: If an error occurs during creation
    """
    try:
        url = data.url
        
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


@router.get("/check_agent_status", response_model=AgentStatusResponse)
async def check_agent_status(current_user: str = Depends(get_current_user)):
    """
    Check the status of an agent creation.
    
    Args:
        current_user: The authenticated user ID
        
    Returns:
        Status and agent URL
        
    Raises:
        HTTPException: If an error occurs during checking
    """
    try:
        return {
            "status": "completed",
            "agent_url": "https://flowon.ai/iframe?agentId=AGENT_ID"
        }
    except Exception as e:
        logger.error(f"Error checking agent status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/completions", response_model=AgentCompletionResponse)
async def agent_completion_handler(
    data: AgentCompletionRequest = Body(...),
    current_user: str = Depends(get_current_user)
):
    """
    Get a completion from an agent.
    
    Args:
        data: Request containing the prompt and purpose
        current_user: The authenticated user ID
        
    Returns:
        The completion
        
    Raises:
        HTTPException: If an error occurs during completion
    """
    try:
        prompt = data.prompt
        purpose = data.purpose
            
        completion = await get_agent_completion(purpose, prompt)
        return {
            "status": "success",
            "completion": completion
        }
    except Exception as e:
        logger.error(f"Error getting agent completion: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

