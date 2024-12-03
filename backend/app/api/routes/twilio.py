from fastapi import APIRouter, Request, Response, HTTPException, Depends
from fastapi.responses import Response, JSONResponse, HTMLResponse
from typing import Dict, List

from services import twilio
from app.api.deps import get_current_user
from sqlalchemy.orm import Session

router = APIRouter()


""" TWILIO NUMBER FUNCTIONS FOR FRONTEND """
@router.get("/country_codes", response_model=dict)
async def get_country_codes_handler() -> JSONResponse:
    """Get list of available country codes from Twilio"""
    twilio_countries = twilio.get_country_codes()
    return JSONResponse(content={"countries": twilio_countries})

@router.get("/available_numbers/{country_code}", response_model=Dict[str, Dict[str, List[str]]])
async def get_available_numbers_handler(country_code: str) -> JSONResponse:
    """Get list of available numbers for a given country code from Twilio"""
    available_numbers = twilio.get_available_numbers(country_code)
    return JSONResponse(content={"numbers": available_numbers})

@router.get("/user_numbers")
async def get_user_numbers_handler(current_user: str = Depends(get_current_user)) -> JSONResponse:
    """Get list of Twilio numbers for the current user from database"""
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")
    numbers = await twilio.fetch_twilio_numbers(user_id=current_user)
    return JSONResponse(content={"numbers": numbers})


""" TWILIO WEBHOOK FUNCTIONS """
@router.post("/")
async def twilio_status_update() -> JSONResponse:
    return JSONResponse(content={"message": "Twilio status update received"})

@router.post('/add_to_conference')
async def add_to_conference_route(request: Request) -> Response:
    try:
        print('\n\n /add_to_conference')
        return await twilio.add_to_conference(request)
    except Exception as e:
        print(f"Error in add_to_conference: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    

# @router.api_route("/twiml", methods=['GET', 'POST'])
# async def twiml() -> None:
#     generate_twiml()



# @router.post("/call_init/{twil_numb}")
# async def call_init(twil_numb: str, request: Request) -> HTMLResponse:
#     """ extract twilio data here """
#     print("twil_numb:", twil_numb)
#     #await call_init_handler(twil_numb, request)
#     return HTMLResponse(content=open("app/api/routes/templates/streams.xml").read(), \
#                         media_type="application/xml")


# @router.post("/retell_handle/{agent_id_path}", response_class=Response)
# async def retell_handle(agent_id_path: str, request: Request) -> Response:
#     try:
#         print('\n\n /retell_handle')
#         #return await handle_voice_webhook(agent_id_path, request)
#     except Exception as e:
#         print(f"Error in /retell_handle : {e}")
#         raise HTTPException(status_code=500, detail=str(e))
        