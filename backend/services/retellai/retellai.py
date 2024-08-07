from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from retell import Retell

import asyncio
from pydantic import BaseModel
from typing import Optional

from app.core.config import settings
from services.in_memory_cache import in_memory_cache

from sqlmodel import select
from app.models import RetellAIEvent, RetellAICalls #, WebhookCapture

import json

from sqlalchemy.future import select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from contextlib import asynccontextmanager
from supabase import create_client, Client

retell = Retell(api_key=settings.RETELL_API_KEY)

import logging

logger = logging.getLogger(__name__)

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
    

""" WEBHOOK HANDLING """
async def handle_form_webhook(request):
    content_type = request.headers.get('Content-Type', '').split(';')[0].strip()
    if content_type == 'application/json':
        try:
            data = await request.json()
            if data:
                result = await process_event(data, request)
                await save_retell_data(data)  # saves to Supabase
            else:
                result = {}
            return JSONResponse(content=result, status_code=200)
        except Exception as e:
            print(f"Error in webhook: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    else:
        raise HTTPException(status_code=415, detail="Unsupported Media Type")

async_engine = create_async_engine(settings.DATABASE_URL)
AsyncSessionLocal = sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)

@asynccontextmanager
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

from supabase import create_client, Client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
async def save_retell_data(data):
    try:
        table_name = "retell_ai_calls"  # or "retell_ai_events" based on the data type
        
        if "call" in data:
            table_name = "retell_ai_calls"
            event_id = data["call"].get("call_id", "")
        elif "name" in data:
            table_name = "retell_ai_events"
            event_id = data.get("name", "")
        else:
            print("Unknown data type")
            return

        # Prepare the data for insertion
        insert_data = {
            "event_id": event_id,
            "payload": json.dumps(data),
            "timestamp": datetime.utcnow().isoformat()
        }

        # Insert the data into Supabase
        result = supabase.table(table_name).insert(insert_data).execute()

        if result.data:
            print(f"Data saved successfully to {table_name}: {event_id}")
        else:
            print(f"Error saving data to {table_name}: {result.error}")

        # Verify the data was saved
        saved_data = supabase.table(table_name).select("*").eq("event_id", event_id).execute()
        if saved_data.data:
            print(f"Saved data in {table_name}: {saved_data.data[0]}")
        else:
            print(f"No data found in {table_name} for event_id: {event_id}")

    except Exception as e:
        print(f"Error saving data to Supabase: {e}")
        

''' PROCESSING EVENTS '''
async def process_event(event: dict, request: Request):
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
        if event_name == 'outboundCalling':
            return await outbound.outbound_calling(event, request)

        """ APPOINTMENT BOOKING """
        from services.retellai.app_booking import AppBooking
        app_booking = AppBooking(in_memory_cache)
        if event_name == 'check_availability':
            return await app_booking.check_availability(event, request)
        if event_name == 'book_appointment':
            return await app_booking.book_appointment(event, request)
        if event_name == 'cal_webhook':
            return await app_booking.cal_webhook(event, request)
        
        else:
            raise HTTPException(status_code=400, detail="Unknown event name")
    else:
        raise HTTPException(status_code=400, detail="Event name not provided")