import logging
import os
import asyncio
import math
from typing import Dict, Any

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from twilio.twiml.voice_response import VoiceResponse, Dial
from twilio.base.exceptions import TwilioRestException

from app.services.twilio.client import client
from app.clients.supabase_client import get_supabase

livekit_sip_host = os.getenv('LIVEKIT_SIP_HOST')

# Add this near the top of the file, after imports
logger = logging.getLogger(__name__)

""" CALL HANDLING """
async def add_to_conference(request: Request) -> JSONResponse:
    try:
        # Get basic call info from request
        form_data = await request.form()
        call_sid = str(form_data['CallSid'])
        twilio_number = str(form_data['To'])
        from_number = str(form_data['From'])
        
        # Create conference name
        conference_name = f"conf_{call_sid}"

        # Create TwiML to move caller to conference immediately
        response = VoiceResponse()
        dial = Dial()
        dial.conference(
            conference_name,
            startConferenceOnEnter=True,
            endConferenceOnExit=False,
            waitUrl='http://twimlets.com/holdmusic?Bucket=com.twilio.music.classical'
        )
        response.append(dial)

        # Update the call with the TwiML
        client.calls(call_sid).update(twiml=str(response))
        logger.info(f'Moved caller {call_sid} to conference {conference_name}')

        # After moving caller, initiate LiveKit bridge asynchronously
        asyncio.create_task(bridge_conference_to_livekit(
            conference_name=conference_name,
            from_number=from_number,
            sip_trunk_number=twilio_number,
            sip_host=livekit_sip_host
        ))
        
        return JSONResponse(content={'message': 'Caller moved to conference'})
        
    except TwilioRestException as e:
        logger.error(f"Twilio error: {e.code} - {e.msg}", exc_info=True)
        raise HTTPException(status_code=e.code, detail=e.msg)
    except Exception as e:
        logger.error(f"Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


async def bridge_conference_to_livekit(conference_name: str, from_number: str, sip_trunk_number: str, sip_host: str) -> None:
    """
    Bridges a Twilio conference to LiveKit via SIP trunk with aggressive retry logic
    """
    try:
        # Create SIP address for LiveKit trunk
        sip_address = f"sip:{sip_trunk_number}@{sip_host};transport=tcp"
        
        # More aggressive retry strategy
        max_retries = 8
        initial_delay = 0.5  # Start with just 500ms delay
        
        for attempt in range(max_retries):
            # Shorter exponential backoff
            await asyncio.sleep(initial_delay * (2 ** attempt))
            
            logger.info(f"Attempt {attempt + 1}/{max_retries}: Looking for conference {conference_name}")
            conferences = client.conferences.list(friendly_name=conference_name, status=['in-progress', 'init'])
            
            if conferences:
                conference = conferences[0]
                logger.info(f"Found conference {conference_name} with SID {conference.sid}")
                
                # Immediately try to create participant
                participant = client.conferences(conference.sid).participants.create(
                    from_=sip_trunk_number,
                    to=sip_address,
                    time_limit=600,
                )
                logger.info(f"Successfully bridged conference to LiveKit at {sip_address}")
                return participant
            
            logger.info(f"Conference not found, waiting {initial_delay * (2 ** (attempt + 1))}s before next attempt...")
        
        raise Exception(f"Conference {conference_name} not found after {max_retries} attempts")
        
    except TwilioRestException as e:
        logger.error(f"Twilio error while bridging conference: {e.code} - {e.msg}")
        raise
    except Exception as e:
        logger.error(f"Error while bridging conference: {str(e)}")
        raise



def cleanup() -> None:
    logger.info("Starting cleanup process...")
    try:
        # Verify credentials before making calls
        if not client.auth:
            raise ValueError("Twilio client not properly authenticated")

        # Get active calls with proper authentication
        calls = client.calls.list(status='in-progress', limit=50)  # Added limit for safety

        if calls:
            for call in calls:
                try:
                    logger.info(f"Ending call SID: {call.sid}, From: {call.from_formatted}, "
                              f"To: {call.to}, Status: {call.status}")
                    
                    client.calls(call.sid).update(status='completed')
                    logger.info(f"Successfully ended call SID: {call.sid}")
                    
                except TwilioRestException as call_error:
                    logger.error(f"Failed to end call {call.sid}: {str(call_error)}")
                    continue
        else:
            logger.info('No active calls found to clean up')
            
    except TwilioRestException as e:
        logger.error(f"Twilio API error during cleanup: {e.code} - {e.msg}")
        raise
    except ValueError as e:
        logger.error(f"Authentication error: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during cleanup: {str(e)}")
        raise


async def process_call_completed(
    call_sid: str,
    call_duration: str,
    call_status: str,
    from_number: str
) -> Dict[str, Any]:
    """
    Process call completion data and update trial minutes for users
    
    Args:
        call_sid: The Twilio call SID
        call_duration: Duration of the call in seconds
        call_status: Status of the call (completed, etc.)
        from_number: The Twilio number the call was made from
        
    Returns:
        Dict with success status and message
    """
    logger.info(f"Call completed: SID={call_sid}, Duration={call_duration}s, Status={call_status}")
    
    if not call_sid or not call_duration or call_status != "completed":
        logger.warning(f"Invalid call completion data: SID={call_sid}, Duration={call_duration}, Status={call_status}")
        return {"success": False, "message": "Invalid call data"}
    
    # Convert duration to minutes (round up to nearest minute)
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

