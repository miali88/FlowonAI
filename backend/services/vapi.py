from vapi_python import Vapi

from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import Response, JSONResponse

from app.core.config import settings

vapi = Vapi(api_key=settings.VAPI_API_KEY)

async def handle_vapi_webhook(request: Request):
    print(request)
    return Response(status_code=200)