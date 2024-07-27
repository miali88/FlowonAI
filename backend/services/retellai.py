from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import Response, JSONResponse
from retell import Retell
from thefuzz import process
import pandas as pd

from app.core.config import settings
from services.in_memory_cache import in_memory_cache
from services.twilio import update_call, add_to_conference

retell = Retell(api_key=settings.RETELL_API_KEY)

import asyncio
from pydantic import BaseModel
from typing import Optional
import os 

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
        return retell_callid, websocket_url
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
    print('\n caller information function...')
    in_memory_cache.set(f"{agent_type}.ic_info", event['args'])
    print('ic_info:', in_memory_cache.get(f"{agent_type}.ic_info"))
    return {"function_result": {"name": "callerInformation"}, "result": f"info noted"} 


# Database import and into a dataframe
current_dir = os.path.dirname(__file__)
# Define the path to the CSV file
csv_path = os.path.join(current_dir, 'insolv_data.csv')
df = pd.read_csv(csv_path)
cases = df['Company Name:'].tolist()
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
    in_memory_cache.set("AGENT_FIRST.case_locator",{'admin_name': admin_name, 'case': best_match[0]})
    print('\n\n in_memory_cache', in_memory_cache.get_all())
    return {"function_result": {"name": "CaseLocator"}, "result": {"case-name": \
            in_memory_cache.get("AGENT_FIRST.case_locator.case"), \
            "administrator-name": in_memory_cache.get("AGENT_FIRST.case_locator.admin_name")}}
    # except Exception as e:
    #     return {"case_locator function error": f"An unexpected error occurred: {e}"}, 500

async def call_admin(event: Event, request: Request):
    print('\ncall admin function...')
    hold_url = f'{settings.BASE_URL}/api/v1/twilio/add_to_conference'      
    await update_call(in_memory_cache.get("AGENT_FIRST.twilio_callsid"), hold_url,'hold')

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
        await add_to_conference(event, request)
    return admin_available_bool

# async def call_connected(event: Event, request: Request):
#     print('\ncall connected function...')
#     return {
#         "function_result": {"name": "callConnected"},
#         "result": f"administrator available {admin_available(event)}"
#     } 
