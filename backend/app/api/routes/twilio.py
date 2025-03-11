from fastapi import APIRouter, Request, Response, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import Dict, List
from pydantic import BaseModel
import logging
import os

from app.services.twilio import (
    call_handle, helper, process_call_completed, check_user_trial_status, 
    provision_user_phone_number
)
from app.core.auth import get_current_user

# Add logger configuration at the top after imports
logger = logging.getLogger(__name__)

# Suppress verbose Twilio HTTP client logs
twilio_http_client_logger = logging.getLogger("twilio.http_client")
twilio_http_client_logger.setLevel(logging.WARNING)  # Only show WARNING and above

router = APIRouter()

class NumberGroup(BaseModel):
    monthly_cost: float | None
    numbers: List[str]

class AvailableNumbersResponse(BaseModel):
    numbers: Dict[str, NumberGroup]

""" FUNCTIONS FOR FRONTEND """
@router.get("/country_codes", response_model=dict)
async def get_country_codes_handler() -> JSONResponse:
    """Get list of available country codes from Twilio"""
    logger.info("Fetching available country codes from Twilio")
    try:
        twilio_countries = helper.get_country_codes()
        logger.debug(f"Retrieved {len(twilio_countries)} country codes")
        return JSONResponse(content={"countries": twilio_countries})
    except Exception as e:
        logger.error(f"Error fetching country codes: {str(e)}")
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Country codes not found")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/available_numbers/{country_code}", response_model = AvailableNumbersResponse)
async def get_available_numbers_handler(country_code: str) -> AvailableNumbersResponse:
    """Get list of available numbers for a given country code from Twilio"""
    logger.info(f"Fetching available numbers for country code: {country_code}")
    available_numbers = helper.get_available_numbers(country_code)
    print(f"Available numbers: {available_numbers}")
    logger.debug(f"Retrieved {len(available_numbers) if available_numbers else 0} numbers for {country_code}")
    return {"numbers": available_numbers or {}}  # Return empty dict if no numbers found

@router.get("/user_numbers")
async def get_user_numbers_handler(
    current_user = Depends(get_current_user)
) -> JSONResponse:
    """Get primary Twilio number for the current user from database"""
    logger.info(f"Fetching primary Twilio number for user: {current_user}")
    if not current_user:
        logger.warning("Unauthorized attempt to fetch user numbers - no current user")
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    number: str = await helper.fetch_twilio_numbers(user_id=current_user)
    
    if number is None:
        logger.debug(f"No Twilio number found for user {current_user}")
        return JSONResponse(content={"number": None})
    
    logger.debug(f"Retrieved primary Twilio number for user {current_user}")
    return JSONResponse(content={"number": number})

""" WEBHOOK FUNCTIONS """
@router.api_route("/", methods=["GET", "POST"])
async def twilio_status_update(request: Request) -> Response:
    """Handle Twilio status callback webhooks"""
    data = await request.form() if request.method == "POST" else request.query_params
    logger.info(f"Received Twilio status update - Method: {request.method}")
    logger.debug(f"Status update data: {dict(data)}")
    return Response(status_code=200)

@router.post('/add_to_conference')
async def add_to_conference_route(request: Request) -> Response:
    logger.info("Processing add to conference request")
    try:
        return await call_handle.add_to_conference(request)
    except Exception as e:
        logger.error(f"Error in add_to_conference: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/call_completed")
async def call_completed(request: Request):
    """Handle call completion webhook from Twilio to update call duration for trial users"""
    try:
        form_data = await request.form()
        call_sid = form_data.get("CallSid")
        call_duration = form_data.get("CallDuration")  # Duration in seconds
        call_status = form_data.get("CallStatus")
        from_number = form_data.get("From")
        
        result = await process_call_completed(
            call_sid=call_sid,
            call_duration=call_duration,
            call_status=call_status,
            from_number=from_number
        )
        
        return result
    
    except Exception as e:
        logger.error(f"Error processing call completion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing call completion: {str(e)}")

@router.get("/check_trial_status/{user_id}")
async def check_trial_status(user_id: str, current_user: str = Depends(get_current_user)):
    """Check if a user has exceeded their trial limits"""
    try:
        return await check_user_trial_status(user_id=user_id, current_user=current_user)
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error checking trial status: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error checking trial status: {str(e)}")

@router.post("/purchase_phone_number")
async def purchase_phone_number(
    country_code: str,
    number_type: str = "local",
    area_code: str = None,
    current_user: str = Depends(get_current_user)
) -> JSONResponse:
    """Purchase a Twilio phone number for the user"""
    try:
        purchase_result = await provision_user_phone_number(
            country_code=country_code,
            number_type=number_type,
            area_code=area_code,
            user_id=current_user
        )
        
        return JSONResponse(content=purchase_result)
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error in purchase_phone_number: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error provisioning phone number: {str(e)}")
        