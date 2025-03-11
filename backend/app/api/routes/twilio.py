from fastapi import APIRouter, Request, Response, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import Dict, List
from pydantic import BaseModel
import logging
import os

from app.services.twilio import call_handle, helper, purchase_number
from app.core.auth import get_current_user
from app.clients.supabase_client import get_supabase

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

@router.post("/call_completed")
async def call_completed(request: Request):
    """Handle call completion webhook from Twilio to update call duration for trial users"""
    try:
        form_data = await request.form()
        call_sid = form_data.get("CallSid")
        call_duration = form_data.get("CallDuration")  # Duration in seconds
        call_status = form_data.get("CallStatus")
        from_number = form_data.get("From")
        
        logger.info(f"Call completed: SID={call_sid}, Duration={call_duration}s, Status={call_status}")
        
        if not call_sid or not call_duration or call_status != "completed":
            logger.warning(f"Invalid call completion data: {form_data}")
            return {"success": False, "message": "Invalid call data"}
        
        # Convert duration to minutes (round up to nearest minute)
        import math
        duration_minutes = math.ceil(int(call_duration) / 60)
        logger.info(f"Call duration in minutes: {duration_minutes}")
        
        # Find the user associated with this Twilio number
        supabase = await get_supabase()
        number_result = await supabase.table("twilio_numbers").select("owner_user_id").eq("phone_number", from_number).execute()
        
        if not number_result.data:
            logger.warning(f"No owner found for number {from_number}")
            return {"success": False, "message": "Number not found"}
        
        user_id = number_result.data[0].get("owner_user_id")
        if not user_id:
            logger.warning(f"Number {from_number} has no owner")
            return {"success": False, "message": "Number has no owner"}
        
        # Check if user is on trial
        user_result = await supabase.table("users").select("is_trial, trial_minutes_used, trial_minutes_total").eq("id", user_id).execute()
        
        if not user_result.data:
            logger.warning(f"User {user_id} not found")
            return {"success": False, "message": "User not found"}
        
        user_data = user_result.data[0]
        is_trial = user_data.get("is_trial", False)
        
        if is_trial:
            # Update trial minutes used
            trial_minutes_used = user_data.get("trial_minutes_used", 0) + duration_minutes
            trial_minutes_total = user_data.get("trial_minutes_total", 25)
            
            logger.info(f"Updating trial minutes for user {user_id}: {trial_minutes_used}/{trial_minutes_total}")
            
            # Update user record
            await supabase.table("users").update({
                "trial_minutes_used": trial_minutes_used
            }).eq("id", user_id).execute()
            
            # Log milestone reached if applicable (50%, 80%, 100%)
            percentage_used = (trial_minutes_used / trial_minutes_total) * 100
            if percentage_used >= 80 and (percentage_used - duration_minutes / trial_minutes_total * 100) < 80:
                logger.info(f"User {user_id} has reached 80% of trial minutes")
                # TODO: Send notification about reaching 80% of trial minutes
            elif percentage_used >= 50 and (percentage_used - duration_minutes / trial_minutes_total * 100) < 50:
                logger.info(f"User {user_id} has reached 50% of trial minutes")
                # TODO: Send notification about reaching 50% of trial minutes
            
            if trial_minutes_used >= trial_minutes_total:
                logger.info(f"User {user_id} has exhausted trial minutes")
                # TODO: Send notification about trial minutes exhausted
        
        return {"success": True, "message": "Call data processed successfully"}
    
    except Exception as e:
        logger.error(f"Error processing call completion: {str(e)}")
        return {"success": False, "message": f"Error: {str(e)}"}

@router.get("/check_trial_status/{user_id}")
async def check_trial_status(user_id: str, current_user: str = Depends(get_current_user)):
    """Check if a user has exceeded their trial limits"""
    try:
        # Ensure the current user is checking their own status
        if current_user != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this resource")
        
        supabase = await get_supabase()
        result = await supabase.table("users").select(
            "is_trial, trial_minutes_used, trial_minutes_total, trial_start_date, trial_end_date"
        ).eq("id", user_id).execute()
        
        if not result.data:
            logger.warning(f"User {user_id} not found")
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = result.data[0]
        is_trial = user_data.get("is_trial", False)
        
        if not is_trial:
            return {
                "is_trial": False,
                "message": "User is not on trial"
            }
        
        import datetime
        
        # Check trial expiration
        trial_end_date = user_data.get("trial_end_date")
        if trial_end_date:
            trial_end = datetime.datetime.fromisoformat(trial_end_date.replace('Z', '+00:00'))
            now = datetime.datetime.now(datetime.timezone.utc)
            
            if now > trial_end:
                return {
                    "is_trial": True,
                    "trial_expired": True,
                    "message": "Trial period has expired"
                }
        
        # Check minutes usage
        trial_minutes_used = user_data.get("trial_minutes_used", 0)
        trial_minutes_total = user_data.get("trial_minutes_total", 25)
        
        minutes_exceeded = trial_minutes_used >= trial_minutes_total
        
        # Calculate remaining days in trial
        trial_start_date = user_data.get("trial_start_date")
        remaining_days = None
        
        if trial_start_date and trial_end_date:
            trial_start = datetime.datetime.fromisoformat(trial_start_date.replace('Z', '+00:00'))
            trial_end = datetime.datetime.fromisoformat(trial_end_date.replace('Z', '+00:00'))
            now = datetime.datetime.now(datetime.timezone.utc)
            
            trial_total_days = (trial_end - trial_start).days
            days_elapsed = (now - trial_start).days
            remaining_days = max(0, trial_total_days - days_elapsed)
        
        return {
            "is_trial": True,
            "minutes_used": trial_minutes_used,
            "minutes_total": trial_minutes_total,
            "minutes_exceeded": minutes_exceeded,
            "remaining_days": remaining_days,
            "trial_end_date": trial_end_date
        }
    
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
        print(f"[TWILIO] 📞 Starting purchase phone number flow...")
        print(f"[TWILIO] 📋 Parameters: user={current_user}, country_code={country_code}, number_type={number_type}")
        
        if not current_user:
            print(f"[TWILIO] ⚠️ Unauthorized attempt to purchase phone number - no current user")
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        # Get an available number from the specified country and type
        print(f"[TWILIO] 🔍 Fetching available numbers for country_code={country_code}, type={number_type}")
        available_numbers = helper.get_available_numbers(country_code)
        
        if not available_numbers or number_type not in available_numbers:
            print(f"[TWILIO] ❌ No available {number_type} numbers found for country code {country_code}")
            raise HTTPException(
                status_code=404, 
                detail=f"No available {number_type} numbers found for country code {country_code}"
            )
        
        # Get the first available number of the requested type
        phone_number = available_numbers[number_type]["numbers"][0]
        print(f"[TWILIO] ✅ Selected phone number {phone_number} for user {current_user}")
        
        try:
            # Use the purchase_number function from services instead of duplicating the logic
            print(f"[TWILIO] 💰 Initiating purchase of number {phone_number} for user {current_user}")
            purchase_result = await purchase_number(
                phone_number=phone_number, 
                user_id=current_user
            )
            
            # Add additional info to the response
            purchase_result["number_type"] = number_type
            purchase_result["country_code"] = country_code
            
            # Also add monthly cost if available
            if "monthly_cost" in available_numbers[number_type]:
                purchase_result["monthly_cost"] = available_numbers[number_type]["monthly_cost"]
                print(f"[TWILIO] 💲 Monthly cost for number: {available_numbers[number_type]['monthly_cost']}")
            
            print(f"[TWILIO] ✅ Successfully purchased and stored number {phone_number} for user {current_user}")
            print(f"[TWILIO] 📊 Purchase result: {purchase_result}")
            return JSONResponse(content=purchase_result)
            
        except Exception as e:
            print(f"[TWILIO] ❌ Failed to purchase number from Twilio: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to purchase number: {str(e)}")
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"[TWILIO] ❌ Error in purchase_phone_number: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error purchasing phone number: {str(e)}")
        