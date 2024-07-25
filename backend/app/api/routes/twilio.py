from app.utils import generate_new_account_email, send_email

from fastapi import APIRouter, Request, Response, HTTPException
from fastapi.responses import Response, JSONResponse

from services.twilio import handle_voice_webhook, add_to_conference, generate_twiml

router = APIRouter()

@router.post("/")
async def twilio_status_update():
    return JSONResponse(content={"message": "Twilio status update received"})

@router.post("/twilio-voice-webhook/{agent_id_path}", response_class=Response)
async def handle_twilio_voice_webhook(agent_id_path: str, request: Request):
    try:
        print('\n\n /twilio-voice-webhook')
        return await handle_voice_webhook(agent_id_path, request)
    except Exception as e:
        print(f"Error in /twilio-voice-webhook : {e}")
        return HTTPException(status_code=500, detail=str(e))
    
@router.post('/add_to_conference')
async def add_to_conference_route(request: Request):
    try:
        print('\n\n /add_to_conference')
        return await add_to_conference(request)
    except Exception as e:
        print(f"Error in add_to_conference: {e}")
        return HTTPException(status_code=500, detail=str(e))

@router.api_route("/twiml", methods=['GET', 'POST'])
async def twiml():
    generate_twiml()
