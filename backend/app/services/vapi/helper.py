import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from app.core.logging_setup import logger

from app.services.vapi.utils import get_user_id

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
        logger.debug(f"[SERVICE] VapiEndOfCallReport: Initialized report for call {call_id}")
    
    @classmethod
    async def from_webhook(cls, webhook_data: Dict[str, Any]) -> 'VapiEndOfCallReport':
        """Create a VapiEndOfCallReport instance from webhook data."""
        # For end-of-call reports, the main data is in the message field
        message = webhook_data.get("message", {})
        
        # Extract required fields with proper logging
        call_id = message.get("call", {}).get("id", "")
        logger.debug(f"[SERVICE] from_webhook: Processing call ID: {call_id}")
        
        timestamp = message.get("timestamp", 0)
        logger.debug(f"[SERVICE] from_webhook: Timestamp: {timestamp}")
        
        type = message.get("type", "")
        logger.debug(f"[SERVICE] from_webhook: Event type: {type}")
        
        summary = message.get("summary", "")
        logger.debug(f"[SERVICE] from_webhook: Summary length: {len(summary)} chars")
        
        transcript = message.get("transcript", "")
        logger.debug(f"[SERVICE] from_webhook: Transcript length: {len(transcript)} chars")
        
        recording_url = message.get("recordingUrl", "")
        logger.debug(f"[SERVICE] from_webhook: Recording URL: {recording_url}")
        
        stereo_recording_url = message.get("stereoRecordingUrl", "")
        logger.debug(f"[SERVICE] from_webhook: Stereo recording URL: {stereo_recording_url}")
        
        phone_number = message.get("phoneNumber", {}).get("number", "")
        logger.debug(f"[SERVICE] from_webhook: Phone number: {phone_number}")
        
        # Extract customer number from the webhook data
        customer_number = message.get("customer", {}).get("number", "")
        logger.debug(f"[SERVICE] from_webhook: Customer number: {customer_number}")
        
        cost = message.get("cost", 0.0)
        logger.debug(f"[SERVICE] from_webhook: Cost: {cost}")
        
        ended_reason = message.get("endedReason", "")
        logger.debug(f"[SERVICE] from_webhook: Ended reason: {ended_reason}")
        
        started_at = message.get("startedAt", "")
        logger.debug(f"[SERVICE] from_webhook: Started at: {started_at}")
        
        ended_at = message.get("endedAt", "")
        logger.debug(f"[SERVICE] from_webhook: Ended at: {ended_at}")
        
        duration_seconds = message.get("durationSeconds", 0.0)
        logger.debug(f"[SERVICE] from_webhook: Duration seconds: {duration_seconds}")
        
        duration_minutes = message.get("durationMinutes", 0.0)
        logger.debug(f"[SERVICE] from_webhook: Duration minutes: {duration_minutes}")
        
        # Get the user ID associated with the phone number
        logger.info(f"[SERVICE] from_webhook: Looking up user ID for phone number: {phone_number}")
        user_id = await get_user_id(phone_number)
        logger.debug(f"[SERVICE] from_webhook: Retrieved user ID: {user_id}")
        
        logger.info(f"[SERVICE] from_webhook: Creating call report for call {call_id}")
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
        logger.debug(f"[SERVICE] to_dict: Converting call report {self.call_id} to dictionary")
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