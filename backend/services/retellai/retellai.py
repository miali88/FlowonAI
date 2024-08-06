from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from retell import Retell

import asyncio
from pydantic import BaseModel
from typing import Optional

from app.core.config import settings
from services.in_memory_cache import in_memory_cache

from sqlmodel import select
from app.models import RetellAIEvent, RetellAICalls, WebhookCapture

import json

from sqlalchemy.future import select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from contextlib import asynccontextmanager

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
    

""" WEBHOOK HANDLING """
async def handle_form_webhook(request):
    content_type = request.headers.get('Content-Type', '').split(';')[0].strip()
    async with get_db() as session:
        new_webhook = WebhookCapture(session, request)
        session.add(new_webhook)
        await session.commit()
    if content_type == 'application/json':
        try:
            data = await request.json()
            if data:
                result = await process_event(data, request)
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

async def save_retell_data(data):
    async with get_db() as session:
        try:
            call_id = data['call']['call_id']
            if "event" in data:
                new_call = RetellAICalls(
                    event_id = call_id,
                    payload = json.dumps(data)
                )
                session.add(new_call)
            elif "call" in data and "name" in data:
                new_event = RetellAIEvent(
                    event_id = call_id+call_id['name'],
                    payload = json.dumps(data)
                )
                session.add(new_event)
            await session.commit()
            print(f"Data saved successfully: {data.get('id', '')}")
        except Exception as e:
            print(f"Error saving data: {e}")
            await session.rollback()
        
        # Verify the data was saved
        if "event" in data:
            result = await session.execute(select(RetellAICalls).where(RetellAICalls.event_id == data.get("id", "")))
            saved_call = result.scalar_one_or_none()
            print(f"Saved call: {saved_call}")
        elif "call" in data and "name" in data:
            result = await session.execute(select(RetellAIEvent).where(RetellAIEvent.event_id == data.get("id", "")))
            saved_event = result.scalar_one_or_none()
            print(f"Saved event: {saved_event}")
        

''' PROCESSING EVENTS '''
async def process_event(event_data: dict, request: Request):
    #print('Processing event...', event)
    if 'name' in event_data:
        event = Event(name=event_data['name'], args=event_data.get('args'))

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
        if event['name'] == 'cal_webhook':
            return await app_booking.cal_webhook(event, request)
        
        else:
            raise HTTPException(status_code=400, detail="Unknown event name")
            """ add more logic here """