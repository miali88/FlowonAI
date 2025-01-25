from fastapi import APIRouter, Request, Response, HTTPException, Depends
from fastapi.responses import Response, JSONResponse, HTMLResponse
from typing import Dict, List
from pydantic import BaseModel
import logging

from services.twilio import helper as twilio_helper
from services.twilio import call_handle as twilio_call_handle

# Set up logger
logger = logging.getLogger(__name__)

router = APIRouter()

class NumberGroup(BaseModel):
    monthly_cost: float | None
    numbers: List[str]

class AvailableNumbersResponse(BaseModel):
    numbers: Dict[str, NumberGroup]




""" TWILIO CALL HANDLING """
@router.post("/")
async def twilio_status_update(request: Request) -> Response:
    logger.info("Twilio status update received")
    request_data = await request.json()
    logger.debug(f"Status update data: {request_data}")
    return HTMLResponse(content="200")

@router.post('/add_to_conference')
async def add_to_conference_route(request: Request) -> Response:
    try:
        logger.info("Processing add_to_conference request")
        return await twilio_call_handle.add_to_conference(request)
    except Exception as e:
        logger.error(f"Error in add_to_conference: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dial-status")
async def handle_dial_status(request: Request) -> JSONResponse:
    form_data = await request.form()
    logger.info(f"Dial status callback: {dict(form_data)}")
    return JSONResponse(content={"status": "ok"})

@router.post("/conference-status")
async def handle_conference_status(request: Request) -> JSONResponse:
    form_data = await request.form()
    logger.info(f"Conference status callback: {dict(form_data)}")
    return JSONResponse(content={"status": "ok"})

@router.post("/sip-status")
async def handle_sip_status(request: Request) -> JSONResponse:
    form_data = await request.form()
    logger.info(f"SIP status callback: {dict(form_data)}")
    return JSONResponse(content={"status": "ok"})


    
""" TWILIO SERVICES """
@router.get("/country_codes", response_model=dict)
async def get_country_codes_handler() -> JSONResponse:
    """Get list of available country codes from Twilio"""
    twilio_countries = twilio_helper.get_country_codes()
    return JSONResponse(content={"countries": twilio_countries})

@router.get("/available_numbers/{country_code}", response_model = AvailableNumbersResponse)
async def get_available_numbers_handler(country_code: str) -> AvailableNumbersResponse:
    """Get list of available numbers for a given country code from Twilio"""
    logger.info(f"Getting available numbers for country code: {country_code}")

    available_numbers = twilio_helper.get_available_numbers(country_code)
    return {"numbers": available_numbers or {}}  # Return empty dict if no numbers found

@router.get("/user_numbers")
async def get_user_numbers_handler(request: Request) -> JSONResponse:
    """Get list of Twilio numbers for the current user from database"""
    user_id = request.headers.get("x-user-id")
    if not user_id:
        logger.error("User ID not provided in headers")
        raise HTTPException(status_code=401, detail="User ID not provided in headers")
    numbers: list = await twilio_helper.fetch_twilio_numbers(user_id=user_id)
    logger.debug(f"Retrieved Twilio numbers for user {user_id}: {numbers}")
    return JSONResponse(content={"numbers": numbers})

