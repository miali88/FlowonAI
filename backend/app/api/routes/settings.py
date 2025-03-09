from fastapi import Request, HTTPException, APIRouter

import logging
import traceback
from typing import Any

from app.clients.supabase_client import get_supabase

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/")
async def update_settings(request: Request) -> dict[str, str]:
    print('\n\n /settings')
    try:
        supabase = await get_supabase()

        data = await request.json()
        user_id = data.get('userId')

        update_data = {}

        # Check which type of settings we're updating
        if 'notifications' in data:
            update_data['notification_settings'] = data['notifications']
        if 'account' in data:
            update_data['account_settings'] = data['account']

        if not update_data:
            logger.error("No valid settings provided")
            raise HTTPException(status_code=400, detail="No valid settings provided")

        # Update the user's settings in Supabase
        response = await supabase.table('users').update(update_data).eq('id', user_id).execute()

        if not response.data:
            logger.error("User not found")
            raise HTTPException(status_code=404, detail="User not found")

        return {"message": "Settings updated successfully"}
    except HTTPException as he:
        # Re-raise HTTP exceptions without wrapping them
        raise he
    except Exception as e:
        logger.error(f"Error updating settings: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Failed to update settings")


@router.get("/")
async def get_settings(request: Request) -> dict[str, Any]:
    print('\n\n /settings')
    try:
        supabase = await get_supabase()

        # Get user_id from query parameters
        user_id = request.query_params.get('userId')
        # Fetch both notification_settings and account_settings from Supabase
        response = await supabase.table('users')\
            .select('notification_settings,account_settings,user_plan').eq('id', user_id).execute()
        
        if not response.data:
            logger.error("User not found")
            raise HTTPException(status_code=404, detail="User not found")
            
        return {
            "settings": {
                "notification_settings": response.data[0]['notification_settings'],
                "account_settings": response.data[0]['account_settings'],
                "user_plan": response.data[0]['user_plan']
            }
        }

    except HTTPException as he:
        # Re-raise HTTP exceptions without wrapping them
        raise he
    except Exception as e:
        logger.error(f"Error retrieving settings: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Failed to retrieve settings")
