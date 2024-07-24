from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import Response, JSONResponse
import asyncio

from retell import Retell
from app.core.config import settings
from services.in_memory_cache import in_memory_cache

from pydantic import BaseModel
from typing import Optional

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
    agent_type = get_agent_type(agent_id_path)
    call = await asyncio.to_thread(retell.call.register,
        agent_id=agent_id_path,
        audio_encoding="mulaw",
        audio_websocket_protocol="twilio",
        sample_rate=8000,
    )
    retell_callid = call.call_id
    # if agent_type not in mem_cache:
    #     mem_cache[agent_type] = {}
    # mem_cache[agent_type]['retell_callid'] = retell_callid
    websocket_url = f"wss://api.retellai.com/audio-websocket/{retell_callid}?enable_update=true"
    return retell_callid, websocket_url






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
            print(f"Received data: {data}")
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
    ## make all others function print the event['args]
    print('\n caller information function...')
    mem_cache['1']['ic_info'] = event['args']
    print('ic_info:',mem_cache['1']['ic_info'])
    return {"function_result": {"name": "callerInformation"}, "result": f"info noted"} 

async def case_locator(event: Event, request: Request):
    #try: 
    if event['args']['CaseName']:
        case_query = event['args']['CaseName']
        print(f'_*_ CASE QUERY NAME {case_query} _*_')
        best_match = process.extractOne(case_query, cases) 
        print(f'_*_ {best_match} LOCATED _*_') # THIS LINE NEVER RUNS
        admin_name = df['Administrator Names:'][df['Company Name:'] == best_match[0]].values[0]
        print(f'_*_ ADMIN NAME: {admin_name} LOCATED _*_')
    elif event['args']['AdministratorName']:
        case_query = event['args']['AdministratorName']
        print(f'_*_ Attempting to match Admin Name to Case Name Now {case_query} _*_')
        best_match = process.extractOne(case_query, cases)
        if best_match[1] >= 90:
            print(f'_*_ {best_match} LOCATED _*_')
            admin_name = df['Administrator Names:'][df['Company Name:'] == best_match[0]].values[0]
            print(f'_*_ ADMIN NAME: {admin_name} LOCATED _*_')    
    mem_cache['1']['case_locator'] = {'admin_name': admin_name, 'case': best_match[0]}
    print('\n\n mem_cache', mem_cache)
    return {"function_result": {"name": "CaseLocator"}, "result": {"case-name": \
            mem_cache['1']['case_locator']['case'], \
            "administrator-name": mem_cache['1']['case_locator']['admin_name']}}
    # except Exception as e:
    #     return {"case_locator function error": f"An unexpected error occurred: {e}"}, 500

async def call_admin(event: Event, request: Request):
    print('\ncall admin function...')
    hold_url = f'{BASE_URL}/add_to_conference'      
    await update_call(mem_cache['1']['twilio_callsid'], hold_url,'hold')

async def info_retrieve(event: Event, request: Request):
    print('\ninfo_retrieve function...')
    return {"function_result": {"name": "infoRetrieve"}, "result": \
            {"callersName": mem_cache['1']['ic_info']['callersName'], \
             "caseName": mem_cache['1']['case_locator']['case'], \
             "whereCallingFrom": mem_cache['1']['ic_info']['whereCallingFrom'], \
            "enquiry": mem_cache['1']['ic_info']['enquiry'],\
            "administratorName": mem_cache['1']['case_locator']['admin_name']}} # may need to request full name from callers

async def admin_available(event: Event, request: Request):
    print('\nadmin available function...')
    admin_available_bool = event['args']['adminAvailable']
    if admin_available_bool == True:
        await admin_to_conf(event, request)

async def call_connected(event: Event, request: Request):
    print('\ncall connected function...')
    return {
        "function_result": {"name": "callConnected"},
        "result": f"administrator available {admin_available_bool}"
    } 
