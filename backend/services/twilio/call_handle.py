import logging
import os
import asyncio

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

from services.twilio.client import client as client
from twilio.twiml.voice_response import VoiceResponse, Dial
from twilio.base.exceptions import TwilioRestException

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
                    to=sip_address
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

