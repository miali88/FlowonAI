from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.core.logging_setup import logger
import asyncio

from app.api.deps import get_current_user
from services.initiate_outbound import initiate_outbound_call

router = APIRouter()

class OutboundCallRequest(BaseModel):
    phone_number: str
    agent_id: str

@router.post("/initiate")
async def initiate_call_handler(
    request: OutboundCallRequest,
    current_user: str = Depends(get_current_user)
) -> dict:
    """
    Initiate an outbound call to a specified phone number using a specific agent.
    
    Args:
        request: Contains phone_number and agent_id
        current_user: The authenticated user ID
        
    Returns:
        A dictionary with status information
    """
    logger.info(f"Initiating outbound call to {request.phone_number} with agent {request.agent_id}")
    
    try:
        # Format the phone number to E.164 format if not already
        phone_number = request.phone_number
        if not phone_number.startswith("+"):
            phone_number = "+" + phone_number
            
        # Create a unique room name for this outbound call
        room_name = f"outbound_{phone_number}"
        
        # Initiate the outbound call
        await initiate_outbound_call(
            phone_number=phone_number,
            room_name=room_name,
            agent_id=request.agent_id
        )
        
        return {
            "status": "success",
            "message": f"Outbound call initiated to {phone_number}",
            "room_name": room_name
        }
        
    except Exception as e:
        logger.error(f"Error initiating outbound call: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to initiate call: {str(e)}") 