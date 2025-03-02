from fastapi import APIRouter, HTTPException, Depends
import logging

from app.core.auth import get_current_user
from services.guided_setup import (
    QuickSetupData, 
    RetrainAgentRequest, 
    RetrainAgentResponse,
    get_rosie_phone_number,
    submit_quick_setup as submit_quick_setup_service,
    check_setup_status,
    mark_setup_complete,
    get_formatted_setup_data,
    retrain_agent_service
)

router = APIRouter()

@router.post("/quick_setup")
async def submit_quick_setup(data: QuickSetupData, current_user: str = Depends(get_current_user)):
    """
    Endpoint to receive quick setup data and return a mock phone number
    for the Talk to Rosie step.
    """
    try:
        result = await submit_quick_setup_service(current_user, data)
        if not result.get("success", False):
            raise HTTPException(status_code=500, detail=result.get("error", "Unknown error"))
        
        return result
    except Exception as e:
        logging.error(f"Error in quick-setup endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/quick_setup")
async def options_quick_setup():
    """
    Handle OPTIONS requests for CORS preflight.
    """
    return {}

@router.get("/phone_number")
async def get_phone_number(current_user: str = Depends(get_current_user)):
    """
    Endpoint to get the Rosie phone number for the Talk to Rosie step.
    """
    try:
        result = await get_rosie_phone_number(current_user)
        if not result.get("success", False):
            raise HTTPException(status_code=500, detail=result.get("error", "Unknown error"))
        
        return result
    except Exception as e:
        logging.error(f"Error in get_phone_number endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/phone_number")
async def options_phone_number():
    """
    Handle OPTIONS requests for CORS preflight.
    """
    return {}

@router.get("/setup_status", response_model=dict)
async def get_setup_status(user_id: str = Depends(get_current_user)):
    """
    Check if the user has completed the guided setup
    """
    try:
        return await check_setup_status(user_id)
    except Exception as e:
        logging.error(f"Error in setup_status endpoint: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@router.post("/mark_complete", response_model=dict)
async def mark_setup_as_complete(user_id: str = Depends(get_current_user)):
    """
    Mark the guided setup as complete
    """
    try:
        return await mark_setup_complete(user_id)
    except Exception as e:
        logging.error(f"Error in mark_complete endpoint: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@router.get("/setup_data")
async def get_setup_data(current_user: str = Depends(get_current_user)):
    """
    Endpoint to retrieve the complete guided setup data for the current user.
    """
    try:
        result = await get_formatted_setup_data(current_user)
        if not result.get("success", False):
            return result
        
        return result
    except Exception as e:
        logging.error(f"Error in get_setup_data endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/setup_data")
async def options_setup_data():
    """
    Handle OPTIONS requests for CORS preflight.
    """
    return {}

@router.post("/retrain_agent", response_model=RetrainAgentResponse)
async def retrain_agent(request: RetrainAgentRequest, current_user: str = Depends(get_current_user)):
    """
    Retrain the agent for the current user by crawling and scraping a website URL.
    Updates the business information and returns the updated agent data.
    
    Args:
        request: Contains the URL to scrape and optional setup data
        current_user: The authenticated user token
        
    Returns:
        A response with the updated agent data or an error message
    """
    try:
        # Call the service function that contains all the business logic
        result = await retrain_agent_service(current_user, request)
        return result
    except Exception as e:
        logging.error(f"Error in retrain_agent endpoint: {str(e)}")
        # Return a proper error response
        return RetrainAgentResponse(
            success=False,
            business_overview=None,
            setup_data=None,
            error=str(e)
        )

@router.options("/retrain_agent")
async def options_retrain_agent():
    """
    Handle OPTIONS requests for CORS preflight.
    """
    return {}
