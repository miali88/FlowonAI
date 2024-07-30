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
from services.db_queries import cases, db_case_locator

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
    # try:
    if 'name' in event:
        if event['name'] == 'callerInformation':
            return await caller_information(event, request)
        elif event['name'] == 'caseLocator':
            return await case_locator(event, request)
        elif event['name'] == 'callAdmin':
            return await call_admin(event, request)
        elif event['name'] == 'infoRetrieve':
            return await info_retrieve(event, request)
        elif event['name'] == 'adminAvailable':
            return await admin_available(event, request)
        else:
            raise HTTPException(status_code=400, detail="Unknown event name")
    # except Exception as e:
    #     print(f"Error in process_event: {e}")
    #     raise HTTPException(status_code=500, detail=str(e))

async def caller_information(event: Event, request: Request):
    ''' from agent 1. to then be used by agent 2 in relaying to the admin'''
    print('\n caller information function...')
    in_memory_cache.set("AGENT_FIRST.ic_info", event['args'])
    print('ic_info:', in_memory_cache.get("AGENT_FIRST.ic_info"))
    return {"function_result": {"name": "callerInformation"}, "result": f"info noted"} 

async def case_locator(event: Event, request: Request):
    print('\n case locator function...')
    case_name, admin_name = await db_case_locator(event)
    if case_name and admin_name:
        print('\n\n in_memory_cache', in_memory_cache.get_all())
        return {"function_result": {"name": "CaseLocator"}, "result": {"case-name": case_name, "administrator-name": admin_name}}
    else:
        return {"function_result": {"name": "CaseLocator"}, "result": {"error": "Case or administrator not found"}}

async def call_admin(event: Event, request: Request):
    print('\ncall admin function...')
    hold_url = f'{settings.BASE_URL}/api/v1/twilio/add_to_conference'
    print('hold_url', hold_url)      
    print('twilio_callsid', in_memory_cache.get("AGENT_FIRST.twilio_callsid"))
    await twilio.update_call(in_memory_cache.get("AGENT_FIRST.twilio_callsid"), hold_url,'hold')

async def info_retrieve(event: Event, request: Request):
    print('\ninfo_retrieve function...')
    return {"function_result": {"name": "infoRetrieve"}, "result": \
            {"callersName": in_memory_cache.get("AGENT_FIRST.ic_info.callersName"), \
             "caseName": in_memory_cache.get("AGENT_FIRST.case_locator.case"), \
             "whereCallingFrom": in_memory_cache.get("AGENT_FIRST.ic_info.whereCallingFrom"), \
            "enquiry": in_memory_cache.get("AGENT_FIRST.ic_info.enquiry"),\
            "administratorName": in_memory_cache.get("AGENT_FIRST.case_locator.admin_name")}} # may need to request full name from callers

async def admin_available(event: Event, request: Request):
    print('\nadmin available function...')
    admin_available_bool = event['args']['adminAvailable']
    if admin_available_bool == True:
        await twilio.add_to_conference(event, request)
    return admin_available_bool

# async def call_connected(event: Event, request: Request):
#     print('\ncall connected function...')
#     return {
#         "function_result": {"name": "callConnected"},
#         "result": f"administrator available {admin_available(event)}"
#     } 