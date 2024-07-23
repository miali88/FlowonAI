from retell import Retell

from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import Response, JSONResponse

from app.core.config import settings
from app.utils import generate_new_account_email, send_email

router = APIRouter()

@router.post('/')
async def webhook(request: Request):
    try:
        print('\n\n / endpoint')
        return await handle_form_webhook(request)
    except Exception as e:
        print(f"Error in / : {e}")
        return HTTPException(status_code=500, detail=str(e))