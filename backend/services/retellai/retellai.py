from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from retell import Retell

import asyncio
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.core.config import settings
from services.in_memory_cache import in_memory_cache

from datetime import datetime

from services.db.supabase_ops import supabase_ops
import logging

retell = Retell(api_key=settings.RETELL_API_KEY)

logger = logging.getLogger(__name__)

class Event(BaseModel):
    name: str
    args: Optional[Dict[str, Any]] = None

def get_agent_type(agent_id_path: str) -> str:
    """Determine the agent type based on the agent_id_path."""
    if agent_id_path == settings.AGENT_FIRST:
        return "AGENT_FIRST"
    elif agent_id_path == settings.AGENT_SECOND:
        return "AGENT_SECOND"
    else:
        raise ValueError(f"Unknown agent_id_path: {agent_id_path}")

async def handle_retell_logic(agent_id_path: str) -> str:
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

""" WEBHOOK HANDLING """
async def handle_form_webhook(request: Request) -> JSONResponse:
    content_type = request.headers.get('Content-Type', '').split(';')[0].strip()
    if content_type == 'application/json':
        try:
            data = await request.json()
            result, retell_wh = await classify_retell_payload(data, request)
            if data:
                await supabase_ops.retell.create(data, retell_wh)
            return JSONResponse(content=result, status_code=200)
        except Exception as e:
            print(f"Error in webhook: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    else:
        raise HTTPException(status_code=415, detail="Unsupported Media Type")

async def classify_retell_payload(data: Dict[str, Any], request: Request) -> tuple[Dict[str, Any], str]:
    result = {}
    if "event" in data and 'data' in data:
        retell_wh = "retell_ai_calls"
    elif "name" in data and "args" in data:
        retell_wh = "retell_ai_events"
        result = await process_event(data, request)
    else:
        raise ValueError("Unknown Retell AI payload type")
    return result, retell_wh

''' PROCESSING EVENTS '''
async def process_event(event: Dict[str, Any], request: Request) -> Any:
    if 'name' in event:
        event_name = event['name']

        """ CALL ROUTING """
        from services.retellai.call_routing import CallRouting
        call_routing = CallRouting(in_memory_cache)
        if event_name == 'callerInformation':
            return await call_routing.caller_information(event, request)
        elif event_name == 'caseLocator':
            return await call_routing.case_locator(event, request)
        elif event_name == 'callAdmin':
            return await call_routing.call_admin(event, request)
        elif event_name == 'infoRetrieve':
            return await call_routing.info_retrieve(event, request)
        elif event_name == 'adminAvailable':
            return await call_routing.admin_available(event, request)
        
        """ OUTBOUND CALLING """
        from services.retellai.outbound import Outbound
        outbound = Outbound(in_memory_cache)
        # if event_name == 'outboundCalling':
        #     return await outbound.outbound_calling(event, request)

        """ APPOINTMENT BOOKING """
        from services.retellai.app_booking import AppBooking
        app_booking = AppBooking(in_memory_cache)
        # if event_name == 'check_availability':
        #     return await app_booking.check_availability(event, request)
        # if event_name == 'book_appointment':
        #     return await app_booking.book_appointment(event, request)
        # if event_name == 'cal_webhook':
        #     return await app_booking.cal_webhook(event, request)
        
    else:
        raise HTTPException(status_code=400, detail="Unknown event name")