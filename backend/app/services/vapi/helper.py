import uuid
from datetime import datetime
from typing import Dict, Any, Optional
import logging

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
        recording_url: str,
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
        self.recording_url = recording_url
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
        # Extract required fields with proper logging
        call_id = webhook_data.get("call", {}).get("id", "")
        logger.debug(f"Extracted call_id: {call_id}")
        
        timestamp = webhook_data.get("timestamp", 0)
        logger.debug(f"Extracted timestamp: {timestamp}")
        
        type = webhook_data.get("type", "")
        logger.debug(f"Extracted type: {type}")
        
        summary = webhook_data.get("summary", "")
        logger.debug(f"Extracted summary length: {len(summary)} chars")
        
        transcript = webhook_data.get("transcript", "")
        logger.debug(f"Extracted transcript length: {len(transcript)} chars")
        
        recording_url = webhook_data.get("recordingUrl", "")
        logger.debug(f"Extracted recording url: {recording_url}")
        
        stereo_recording_url = webhook_data.get("stereoRecordingUrl", "")
        logger.debug(f"Extracted stereo recording url: {stereo_recording_url}")
        
        # Extract phone number from the phoneNumber object
        phone_number = webhook_data.get("phoneNumber", {}).get("number", "")
        if not phone_number:
            # Try alternative location
            phone_number = webhook_data.get("call", {}).get("phoneNumber", "")
        logger.debug(f"Extracted phone_number: {phone_number}")
        
        # Extract customer number from the webhook data
        customer_number = webhook_data.get("customer", {}).get("number", "")
        logger.debug(f"Extracted customer_number: {customer_number}")
        
        cost = webhook_data.get("cost", 0.0)
        logger.debug(f"Extracted cost: {cost}")
        
        ended_reason = webhook_data.get("endedReason", "")
        logger.debug(f"Extracted ended_reason: {ended_reason}")
        
        started_at = webhook_data.get("startedAt", "")
        logger.debug(f"Extracted started_at: {started_at}")
        
        ended_at = webhook_data.get("endedAt", "")
        logger.debug(f"Extracted ended_at: {ended_at}")
        
        duration_seconds = webhook_data.get("durationSeconds", 0.0)
        logger.debug(f"Extracted duration_seconds: {duration_seconds}")
        
        duration_minutes = webhook_data.get("durationMinutes", 0.0)
        logger.debug(f"Extracted duration_minutes: {duration_minutes}")
        
        # Get the user ID associated with the phone number
        # First try with the phone number
        user_id = None
        if phone_number:
            user_id = await get_user_id(phone_number)
            logger.debug(f"Retrieved user_id for phone number: {user_id}")
        
        # If no user ID found with phone number, try with customer number
        if not user_id and customer_number:
            user_id = await get_user_id(customer_number)
            logger.debug(f"Retrieved user_id for customer number: {user_id}")
        
        return cls(
            call_id=call_id,
            timestamp=timestamp,
            type=type,
            summary=summary,
            transcript=transcript,
            recording_url=recording_url,
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
            "recording_url": self.recording_url,
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

if __name__ == "__main__":
    import asyncio
    asyncio.run(get_user_id("+17656881646"))