from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import Response, JSONResponse

from services.retellai.retellai import handle_form_webhook
import logging
import traceback
from services.db.supabase_services import supabase

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/")
async def get_settings(request: Request):
    print('\n\n /settings')
    try:
        data = await request.json()
        user_id = data.get('userId')
        notifications = data.get('notifications')
        
        # Update the user's notification settings in Supabase
        response = supabase.table('users').update({
            'notification_settings': notifications
        }).eq('id', user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, message="User not found")
            
        return {"message": "Settings updated successfully"}
    except Exception as e:
        logger.error(f"Error updating settings: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Failed to update settings")

@router.get("/")
async def get_settings(request: Request):
    print('\n\n /settings')
    try:
        # Get user_id from query parameters
        user_id = request.query_params.get('userId')
        if not user_id:
            raise HTTPException(status_code=400, detail="userId is required")
        
        # Fetch the user's settings from Supabase
        response = supabase.table('users').select('notification_settings').eq('id', user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {"settings": response.data[0]['notification_settings']}
    except Exception as e:
        logger.error(f"Error retrieving settings: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Failed to retrieve settings")
