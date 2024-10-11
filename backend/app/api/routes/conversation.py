from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import Response, JSONResponse

from services.retellai.retellai import handle_form_webhook
import logging
import traceback

router = APIRouter()

router.get("/history")
async def get_conversation_history(request: Request):
    

    pass
