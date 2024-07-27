from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import Response, JSONResponse

from app.utils import generate_new_account_email, send_email

from services.retellai import handle_form_webhook

router = APIRouter()

@router.post('/')
async def webhook(request: Request) -> JSONResponse:
    try:
        print('\n\n /retell')
        return await handle_form_webhook(request)
    except Exception as e:
        print(f"Error in / : {e}")
        raise HTTPException(status_code=500, detail=str(e))