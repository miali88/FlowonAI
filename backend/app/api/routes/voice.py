from fastapi import Request, APIRouter
from fastapi.responses import JSONResponse
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.api_route('/transcript/commit', methods=['POST', 'GET'])
async def voice_webhook(request: Request):
    # transcript = await request.json()

    #print("\n\nCOMMIT TRANSCRIPT:", transcript)

    return JSONResponse(content={"message": "Voice webhook received"})

@router.api_route('/transcript/real_time', methods=['POST', 'GET'])
async def voice_webhook(request: Request):
    transcript = await request.json()

    print("\n\nREAL TIME TRANSCRIPT:", transcript)

    return JSONResponse(content={"message": "Voice webhook received"})

@router.api_route('/state', methods=['POST', 'GET'])
async def voice_webhook(request: Request):
    state = await request.json()

    """ link the state to the user_id of clerk dashboard. """
    print("\n\nSTATE:", state)

    return JSONResponse(content={"message": "Voice webhook received"})