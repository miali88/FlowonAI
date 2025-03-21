import logging
from app.api.routes.nylas import nylas
from app.api.routes.nylas import settings

logger = logging.getLogger(__name__)

async def send_notification_email(subject: str, body: str, recipient_email: str = "support@flowon.ai") -> bool:
    """
    Send an email notification using Nylas API
    
    Args:
        subject: Email subject
        body: Email body (HTML format)
        recipient_email: Email recipient
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        # Create the email request body
        email_data = {
            "subject": subject,
            "body": body,
            "to": [{"email": recipient_email, "name": "Flowon Admin"}],
        }
        
        # Get the grant ID from settings
        grant_id = settings.NYLAS_GRANT_ID
        
        if not grant_id:
            logging.error("NYLAS_GRANT_ID is not set in environment variables")
            return False
            
        logging.info(f"Attempting to send email via Nylas with grant_id: {grant_id}")
        
        # Send the email using the Nylas v3 API format
        try:
            response = nylas.messages.send(
                identifier=grant_id,
                request_body=email_data
            )
            
            return True
        except Exception as api_error:
            logging.error(f"Nylas API error: {str(api_error)}")
            logging.error(f"API error type: {type(api_error)}")
            return False
            
    except Exception as e:
        logging.error(f"Failed to send notification email: {str(e)}")
        logging.error(f"Error type: {type(e)}")
        import traceback
        logging.error(f"Traceback: {traceback.format_exc()}")
        return False
