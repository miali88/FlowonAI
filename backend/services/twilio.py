from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import Response, JSONResponse

from twilio.rest import Client 
from twilio.twiml.voice_response import VoiceResponse, Dial, Stream, Connect
from retell import Retell

from services.retellai import handle_retell_logic, get_agent_type
from services.in_memory_cache import in_memory_cache

""" INITIAL CALL HANDLING """
async def handle_voice_webhook(agent_id_path: str, request: Request):
    try:
        form = await request.form()
        data = dict(form)

        agent_type = get_agent_type(agent_id_path)

        # Handle Twilio data
        call_sid = await handle_twilio_logic(agent_id_path, data)

        # Handle Retell call registration
        retell_callid, websocket_url = await handle_retell_logic(agent_id_path)

        # Create response
        response = create_voice_response(websocket_url)

        #print(f"Memory Cache for {agent_type}: {mem_cache[agent_type]}")  # For debugging

        return Response(content=str(response), media_type='text/xml')
    except ValueError as ve:
        print(f"Error in handle_voice_webhook: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Error in handle_voice_webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def handle_twilio_logic(agent_id_path, data):
    """Handle Twilio-specific operations."""
    agent_type = get_agent_type(agent_id_path)
    # if 'CallSid' in data:
    #     if agent_type not in mem_cache:
    #         mem_cache[agent_type] = {}
    #     mem_cache[agent_type]['twilio_callsid'] = data['CallSid']
    return data.get('CallSid')


def create_voice_response(websocket_url):
    """Create the VoiceResponse object."""
    response = VoiceResponse()
    connect = Connect()
    stream = Stream(url=websocket_url)
    connect.append(stream)
    response.append(connect)
    response.say('You are now connected to the AI receptionist.')
    return response