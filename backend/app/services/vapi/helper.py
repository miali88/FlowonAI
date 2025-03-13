import uuid
from datetime import datetime
from typing import Dict, Any, Optional
import logging

from app.clients.supabase_client import get_supabase
from app.services.vapi.utils import get_user_id

logger = logging.getLogger(__name__)

class VapiEndOfCallReport:
    """Data model for storing summarized VAPI call data."""
    
    def __init__(
        self,
        call_id: str,
        timestamp: int,
        type: str,
        summary: str,
        transcript: str,
        stereo_recording_url: str,
        phone_number: str,
        customer_number: str,
        cost: float,
        ended_reason: str,
        started_at: str,
        ended_at: str,
        duration_seconds: float,
        duration_minutes: float,
        user_id: Optional[str] = None,
    ):
        self.id = str(uuid.uuid4())
        self.call_id = call_id
        self.timestamp = timestamp
        self.type = type
        self.summary = summary
        self.transcript = transcript
        self.stereo_recording_url = stereo_recording_url
        self.phone_number = phone_number
        self.customer_number = customer_number
        self.cost = cost
        self.ended_reason = ended_reason
        self.started_at = started_at
        self.ended_at = ended_at
        self.duration_seconds = duration_seconds
        self.duration_minutes = duration_minutes
        self.user_id = user_id
        self.created_at = datetime.utcnow().isoformat()
    
    @classmethod
    async def from_webhook(cls, webhook_data: Dict[str, Any]) -> 'VapiEndOfCallReport':
        """Create a VapiEndOfCallReport instance from webhook data."""
        # For end-of-call reports, the main data is in the message field
        message = webhook_data.get("message", {})
        
        # Extract required fields with proper logging
        call_id = message.get("call", {}).get("id", "")
        logger.debug(f"Extracted call_id: {call_id}")
        
        timestamp = message.get("timestamp", 0)
        logger.debug(f"Extracted timestamp: {timestamp}")
        
        type = message.get("type", "")
        logger.debug(f"Extracted type: {type}")
        
        summary = message.get("summary", "")
        logger.debug(f"Extracted summary length: {len(summary)} chars")
        
        transcript = message.get("transcript", "")
        logger.debug(f"Extracted transcript length: {len(transcript)} chars")
        
        stereo_recording_url = message.get("stereoRecordingUrl", "")
        logger.debug(f"Extracted stereo_recording_url: {stereo_recording_url}")
        
        phone_number = message.get("phoneNumber", {}).get("number", "")
        logger.debug(f"Extracted phone_number: {phone_number}")
        
        # Extract customer number from the webhook data
        customer_number = message.get("customer", {}).get("number", "")
        logger.debug(f"Extracted customer_number: {customer_number}")
        
        cost = message.get("cost", 0.0)
        logger.debug(f"Extracted cost: {cost}")
        
        ended_reason = message.get("endedReason", "")
        logger.debug(f"Extracted ended_reason: {ended_reason}")
        
        started_at = message.get("startedAt", "")
        logger.debug(f"Extracted started_at: {started_at}")
        
        ended_at = message.get("endedAt", "")
        logger.debug(f"Extracted ended_at: {ended_at}")
        
        duration_seconds = message.get("durationSeconds", 0.0)
        logger.debug(f"Extracted duration_seconds: {duration_seconds}")
        
        duration_minutes = message.get("durationMinutes", 0.0)
        logger.debug(f"Extracted duration_minutes: {duration_minutes}")
        
        # Get the user ID associated with the phone number
        user_id = await get_user_id(phone_number)
        logger.debug(f"Retrieved user_id for phone number: {user_id}")
        
        return cls(
            call_id=call_id,
            timestamp=timestamp,
            type=type,
            summary=summary,
            transcript=transcript,
            stereo_recording_url=stereo_recording_url,
            phone_number=phone_number,
            customer_number=customer_number,
            cost=cost,
            ended_reason=ended_reason,
            started_at=started_at,
            ended_at=ended_at,
            duration_seconds=duration_seconds,
            duration_minutes=duration_minutes,
            user_id=user_id,
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for database storage."""
        return {
            "id": self.id,
            "call_id": self.call_id,
            "timestamp": self.timestamp,
            "type": self.type,
            "summary": self.summary,
            "transcript": self.transcript,
            "stereo_recording_url": self.stereo_recording_url,
            "phone_number": self.phone_number,
            "customer_number": self.customer_number,
            "cost": self.cost,
            "ended_reason": self.ended_reason,
            "started_at": self.started_at,
            "ended_at": self.ended_at,
            "duration_seconds": self.duration_seconds,
            "duration_minutes": self.duration_minutes,
            "user_id": self.user_id,
            "created_at": self.created_at,
        }

async def store_call_data(webhook_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Store summarized call data in Supabase.
    
    Args:
        webhook_data: The webhook payload containing VAPI call data
        
    Returns:
        Dict containing the stored call data, including user_id
    """
    try:
        logger.info("Processing call data for storage in vapi_calls table")
        
        # Create structured data object from webhook
        call_data = await VapiEndOfCallReport.from_webhook(webhook_data)
        
        # Convert to dictionary for storage
        data_dict = call_data.to_dict()
        
        # Get Supabase client
        supabase = await get_supabase()
        
        # Store in the vapi_calls table
        logger.info(f"Storing call data for call ID: {call_data.call_id}")
        result = await supabase.table("vapi_calls").insert(data_dict).execute()
        
        logger.info(f"Successfully stored call data for call ID: {call_data.call_id}, user ID: {call_data.user_id}")
        
        # Return the data for further processing
        return data_dict
    except Exception as e:
        logger.error(f"Error storing call data: {str(e)}")
        # Return None if there was an error
        return None


if __name__ == "__main__":
    import asyncio
    asyncio.run(get_user_id("+17656881646"))