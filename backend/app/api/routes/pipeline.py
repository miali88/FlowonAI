from fastapi import APIRouter, WebSocket
from fastapi.responses import FileResponse, HTMLResponse

from services.pipecat.main import handle_websocket
import logging
import traceback

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get('/web_call')
async def get_index() -> FileResponse:
    print("GET /index.html")
    return FileResponse('templates/index.html')

@router.post('/tel_call')
async def start_call() -> HTMLResponse:
    """ extract twilio data here """
    """ use twilio utils, inbound agent to update url """
    print("POST /tel_call")
    return HTMLResponse(content=open("templates/streams.xml").read(), media_type="application/xml")

""" websocket connection to our server """
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    print("WS /ws")
    await handle_websocket(websocket)
