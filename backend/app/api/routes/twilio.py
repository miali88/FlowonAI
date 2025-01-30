from fastapi import APIRouter, Request, Response, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import Dict, List
from pydantic import BaseModel
import logging

from services.twilio import call_handle, helper
from app.api.deps import get_current_user

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
    twilio_countries = helper.get_country_codes()
    logger.debug(f"Retrieved {len(twilio_countries)} country codes")
    return JSONResponse(content={"countries": twilio_countries})

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
    current_user: str = Depends(get_current_user)
) -> JSONResponse:
    """Get list of Twilio numbers for the current user from database"""
    logger.info(f"Fetching Twilio numbers for user: {current_user}")
    if not current_user:
        logger.warning("Unauthorized attempt to fetch user numbers - no current user")
        raise HTTPException(status_code=401, detail="User not authenticated")
    numbers = await helper.fetch_twilio_numbers(user_id=current_user)
    logger.debug(f"Retrieved {len(numbers)} numbers for user {current_user}")
    return JSONResponse(content={"numbers": numbers})

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
    
# @router.post("/initiate_call")
# async def initiate_call(
#     to_number: str,
#     from_number: str,
# ) -> JSONResponse:
#     """Initiate an outbound call using Twilio"""
#     logger.info(f"Initiating outbound call from {from_number} to {to_number}")
#     try:
#         # Call should be handled by the twilio service
#         call = await call_handle.create_outbound_call(
#             to_number=to_number,
#             from_number=from_number
#         )
#         logger.info(f"Successfully initiated call with SID: {call.sid}")
#         return JSONResponse(content={"message": "Call initiated", "call_sid": call.sid})
#     except Exception as e:
#         logger.error(f"Failed to initiate call: {str(e)}", exc_info=True)
#         raise HTTPException(status_code=500, detail=str(e))
        