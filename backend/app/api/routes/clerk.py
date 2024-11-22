import logging
from fastapi import HTTPException, APIRouter, Request
from supabase import create_client, Client
from nylas import Client as NylasClient
from fastapi.responses import RedirectResponse, HTMLResponse, JSONResponse

from app.core.config import settings

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

router = APIRouter()

@router.post("/webhook")
async def webhook_base(request: Request):
    print("\n\n clerk/webhook \n\n")
    return JSONResponse(content={"message": "Hello, World!"}, status_code=200)