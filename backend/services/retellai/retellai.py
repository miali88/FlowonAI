from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import Response, JSONResponse
from retell import Retell
from thefuzz import process

import asyncio
from pydantic import BaseModel
from typing import Optional

from app.core.config import settings
from services.in_memory_cache import in_memory_cache
from services import twilio
from services.db_queries import db_case_locator

retell = Retell(api_key=settings.RETELL_API_KEY)

class Event(BaseModel):
    name: str
    args: Optional[dict] = None

""" INITIAL CALL HANDLING """
def get_agent_type(agent_id_path):
    """Determine the agent type based on the agent_id_path."""
    if agent_id_path == settings.AGENT_FIRST:
        return "AGENT_FIRST"
    elif agent_id_path == settings.AGENT_SECOND:
        return "AGENT_SECOND"
    else:
        raise ValueError(f"Unknown agent_id_path: {agent_id_path}")

async def handle_retell_logic(agent_id_path):
    """Handle Retell-specific operations."""
    try:
        agent_type = get_agent_type(agent_id_path)
        call = await asyncio.to_thread(retell.call.register,
            agent_id=agent_id_path,
            audio_encoding="mulaw",
            audio_websocket_protocol="twilio",
            sample_rate=8000,
        )
        retell_callid = call.call_id
        in_memory_cache.set(f"{agent_type}.retell_callid",retell_callid)
        print(in_memory_cache.get_all())
        websocket_url = f"wss://api.retellai.com/audio-websocket/{retell_callid}?enable_update=true"
        return websocket_url
    except ValueError as ve:
        print(f"Invalid agent_id_path: {ve}")
        raise HTTPException(status_code=400, detail=f"Invalid agent_id_path: {str(ve)}")
    except AttributeError as ae:
        print(f"AttributeError: {ae}")
        raise HTTPException(status_code=500, detail=f"Retell API error: {str(ae)}")
    except Exception as e:
        print(f"Error in handle_retell_logic: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing Retell logic: {str(e)}")


""" RETELL WEBHOOK HANDLING """
async def handle_form_webhook(request):
    content_type = request.headers.get('Content-Type', '').split(';')[0].strip()
    if content_type == 'application/json':
        # Process JSON data from RetellAI
        try:
            data = await request.json()
            if data:
                #print("Received JSON event", data)
                result = await process_event(data, request)
            else:
                result = {}
            if 'event' in data:
                if data['event'] not in ['call_ended','call_analyzed']:
                    print(f"Received data: {data}")
                    return JSONResponse(content=result, status_code=200)
                else:
                    print('call ended', data['call']['call_id'])
            else:
                return JSONResponse(content=result, status_code=200)
        except Exception as e:
            print(f"Error in webhook: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    elif content_type == 'application/x-www-form-urlencoded':
        # Process form-encoded data from Twilio
        try:
            form = await request.form()
            data = dict(form)
            if data:
                print(f"Received form-encoded data: {data}")
                result = await process_event(data, request)
            else:
                result = {}
            return JSONResponse(content=result, status_code=200)
        except Exception as e:
            print(f"Error in webhook: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    else:
        raise HTTPException(status_code=415, detail="Unsupported Media Type")


''' PROCESSING EVENTS '''
async def process_event(event: Event, request: Request):
    #print('Processing event...', event)
    if 'name' in event:

        """ CALL ROUTING """
        from services.retellai.call_routing import CallRouting
        call_routing = CallRouting(in_memory_cache)
        if event['name'] == 'callerInformation':
            return await call_routing.caller_information(event, request)
        elif event['name'] == 'caseLocator':
            return await call_routing.case_locator(event, request)
        elif event['name'] == 'callAdmin':
            return await call_routing.call_admin(event, request)
        elif event['name'] == 'infoRetrieve':
            return await call_routing.info_retrieve(event, request)
        elif event['name'] == 'adminAvailable':
            return await call_routing.admin_available(event, request)
        
        """ OUTBOUND CALLING """
        from services.retellai.outbound import Outbound
        outbound = Outbound(in_memory_cache)
        if event['name'] == 'outboundCalling':
            return await outbound.outbound_calling(event, request)

        """ APPOINTMENT BOOKING """
        from services.retellai.app_booking import AppBooking
        app_booking = AppBooking(in_memory_cache)
        if event['name'] == 'check_availability':
            return await app_booking.check_availability(event, request)
        if event['name'] == 'book_appointment':
            return await app_booking.book_appointment(event, request)
        

        else:
            raise HTTPException(status_code=400, detail="Unknown event name")
            """ add more logic here """