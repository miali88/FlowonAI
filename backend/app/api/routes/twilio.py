from fastapi import APIRouter, Request, Response, HTTPException
from fastapi.responses import Response, JSONResponse, HTMLResponse

from services.twilio import handle_voice_webhook, add_to_conference, generate_twiml, call_init_handler

router = APIRouter()

@router.post("/")
async def twilio_status_update() -> JSONResponse:
    return JSONResponse(content={"message": "Twilio status update received"})

@router.post("/ws_call_init/{twil_numb}")
async def call_init(twil_numb: str, request: Request) -> HTMLResponse:
    """ extract twilio data here """
    print("twil_numb:", twil_numb)
    await call_init_handler(twil_numb, request)
    return HTMLResponse(content=open("app/api/routes/templates/streams.xml").read(), \
                        media_type="application/xml")

# @router.post("/webrtc_call_init", response_class=PlainTextResponse)    
# async def webrtc_call_init() -> PlainTextResponse:
#     await twilio_start_bot()

@router.post("/retell_handle/{agent_id_path}", response_class=Response)
async def retell_handle(agent_id_path: str, request: Request) -> Response:
    try:
        print('\n\n /retell_handle')
        return await handle_voice_webhook(agent_id_path, request)
    except Exception as e:
        print(f"Error in /retell_handle : {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post('/add_to_conference')
async def add_to_conference_route(request: Request) -> Response:
    try:
        print('\n\n /add_to_conference')
        return await add_to_conference(request)
    except Exception as e:
        print(f"Error in add_to_conference: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.api_route("/twiml", methods=['GET', 'POST'])
async def twiml() -> None:
    generate_twiml()