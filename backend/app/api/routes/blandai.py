from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import Response, JSONResponse

from services.blandai import handle_blandai_webhook

router = APIRouter()

@router.post('/')
async def webhook(request: Request) -> JSONResponse:
    try:
        print('\n\n /blandai')
        return await handle_blandai_webhook(request)
    except Exception as e:
        print(f"Error in / : {e}")
        raise HTTPException(status_code=500, detail=str(e))