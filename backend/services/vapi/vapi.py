from vapi_python import Vapi

from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import Response, JSONResponse
from services.db.supabase_ops import supabase_ops

from app.core.config import settings

vapi = Vapi(api_key=settings.VAPI_API_KEY)

import json
import logging

logger = logging.getLogger(__name__)

async def handle_vapi_webhook(request: Request) -> Response:
    try:
        payload = await request.json()
    except json.JSONDecodeError:
        logger.warning("Empty or invalid JSON payload received")
        return Response(status_code=200)
    
    if payload:
        logger.info(f"Received VAPI webhook payload: {payload}")
        await supabase_ops.vapi.create(payload)
    else:
        logger.info("Received empty VAPI webhook payload")
    return Response(status_code=200)