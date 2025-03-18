from fastapi import APIRouter, HTTPException, Depends
import logging

from app.core.auth import get_current_user
from backend.app.models.guided_setup import QuickSetupData
from app.api.schemas.guided_setup import (
    RetrainAgentRequest, 
    RetrainAgentResponse,
    OnboardingPreviewRequest,
    AudioPreviewResponse,
    TrialPlanRequest,
    OnboardingSaveRequest
)
from app.services.guided_setup import (
    get_rosie_phone_number,
    submit_quick_setup as submit_quick_setup_service,
    check_setup_status,
    mark_setup_complete,
    get_formatted_setup_data,
    retrain_agent_service,
    generate_onboarding_preview_service,
    set_trial_plan_service,
)

router = APIRouter()

@router.post("/quick_setup")
async def submit_quick_setup(data: QuickSetupData, current_user: str = Depends(get_current_user)):
    """
    Endpoint to receive quick setup data and return a mock phone number
    for the Talk to Rosie step.
    """
    logging.info(f"[ENDPOINT] /quick_setup invoked by user {current_user}")
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
    logging.debug("[ENDPOINT] /quick_setup OPTIONS request received")
    return {}

@router.get("/phone_number")
async def get_phone_number(current_user: str = Depends(get_current_user)):
    """
    Endpoint to get the Rosie phone number for the Talk to Rosie step.
    """
    logging.info(f"[ENDPOINT] /phone_number invoked by user {current_user}")
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
    logging.debug("[ENDPOINT] /phone_number OPTIONS request received")
    return {}

@router.get("/setup_status", response_model=dict)
async def get_setup_status(user_id: str = Depends(get_current_user)):
    """
    Check if the user has completed the guided setup
    """
    logging.info(f"[ENDPOINT] /setup_status invoked by user {user_id}")
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
    logging.info(f"[ENDPOINT] /mark_complete invoked by user {user_id}")
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
    logging.info(f"[ENDPOINT] /setup_data invoked by user {current_user}")
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
    logging.debug("[ENDPOINT] /setup_data OPTIONS request received")
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
    logging.info(f"[ENDPOINT] /retrain_agent invoked by user {current_user}")
    try:
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
    logging.debug("[ENDPOINT] /retrain_agent OPTIONS request received")
    return {}

@router.post("/onboarding_preview", response_model=AudioPreviewResponse)
async def generate_onboarding_preview(request: OnboardingPreviewRequest, current_user: str = Depends(get_current_user)):
    """
    Generate audio previews for onboarding with minimal business information.
    This returns both greeting and message-taking audio samples.
    """
    logging.info(f"[ENDPOINT] /onboarding_preview invoked by user {current_user} with business name: {request.businessName}")
    try:
        # Call the service function to generate the preview
        result = await generate_onboarding_preview_service(
            user_id=current_user,
            business_name=request.businessName,
            business_description=request.businessDescription,
            business_website=request.businessWebsite,
            agent_language=request.agentLanguage
        )
        
        if not result.get("success"):
            return AudioPreviewResponse(
                success=False,
                error=result.get("error", "Failed to generate audio previews")
            )
        
        # Return a response with the data from the service function
        return AudioPreviewResponse(
            success=True,
            greeting_audio_data_base64=result.get("greeting_audio_data_base64"),
            message_audio_data_base64=result.get("message_audio_data_base64"),
            greeting_text=result.get("greeting_text"),
            message_text=result.get("message_text")
        )
    except Exception as e:
        logging.error(f"Error in generate_onboarding_preview endpoint: {str(e)}")
        return AudioPreviewResponse(success=False, error=str(e))

@router.options("/onboarding_preview")
async def options_onboarding_preview():
    """
    Handle OPTIONS requests for CORS preflight.
    """
    logging.debug("[ENDPOINT] /onboarding_preview OPTIONS request received")
    return {}

@router.post("/set_trial_plan")
async def set_trial_plan(
    request: TrialPlanRequest,
    current_user: str = Depends(get_current_user)
):
    """
    Set up a trial plan for a user.
    This will mark the user as being in a trial and set the appropriate trial parameters.
    """
    logging.info(f"[ENDPOINT] /set_trial_plan invoked by user {current_user} with plan type: {request.trial_plan_type}")
    try:
        # Call the service function to set up the trial plan
        result = await set_trial_plan_service(
            user_id=current_user,
            trial_plan_type=request.trial_plan_type
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Failed to set up trial plan"))
        
        return result
    
    except Exception as e:
        logging.error(f"Error setting up trial plan: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error setting up trial plan: {str(e)}")

@router.options("/set_trial_plan")
async def options_set_trial_plan():
    """
    Handle OPTIONS requests for CORS preflight.
    """
    logging.debug("[ENDPOINT] /set_trial_plan OPTIONS request received")
    return {}

@router.post("/save_onboarding_data")
async def save_onboarding_data(request: OnboardingSaveRequest, current_user: str = Depends(get_current_user)):
    """
    Save onboarding data including website and business information from Google Maps places API.
    """
    logging.info(f"[ENDPOINT] /save_onboarding_data invoked by user {current_user} with business name: {request.businessName}")
    try:
        # Call the service function to save the onboarding data
        result = await save_onboarding_data_service(
            user_id=current_user,
            business_name=request.businessName,
            business_description=request.businessDescription,
            business_website=request.businessWebsite,
            business_address=request.businessAddress,
            business_phone=request.businessPhone,
            agent_language=request.agentLanguage
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Unknown error"))
        
        return result
    except Exception as e:
        logging.error(f"Error in save_onboarding_data endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/save_onboarding_data")
async def options_save_onboarding_data():
    """
    Handle OPTIONS requests for CORS preflight.
    """
    logging.debug("[ENDPOINT] /save_onboarding_data OPTIONS request received")
    return {}

