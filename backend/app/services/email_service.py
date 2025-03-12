import logging
from app.api.routes.nylas_service import send_notification_email

logger = logging.getLogger(__name__)

async def send_user_signup_notification(user_data: dict) -> bool:
    """
    Send a notification email when a new user signs up
    
    Args:
        user_data: User data from Clerk webhook
        
    Returns:
        bool: True if email was sent successfully
    """
    try:
        # Extract user information
        user_id = user_data.get('id', 'Unknown ID')
        email_addresses = user_data.get('email_addresses', [])
        email = email_addresses[0].get('email_address', 'No email provided') if email_addresses else 'No email provided'
        
        first_name = user_data.get('first_name', '')
        last_name = user_data.get('last_name', '')
        full_name = f"{first_name} {last_name}".strip() or "Unknown User"
        
        # Create email content
        subject = f"New User Signup: {full_name}"
        body = f"""
        <h2>New User Registration</h2>
        <p>A new user has signed up for Flowon AI:</p>
        <ul>
            <li><strong>User ID:</strong> {user_id}</li>
            <li><strong>Name:</strong> {full_name}</li>
            <li><strong>Email:</strong> {email}</li>
            <li><strong>Signup Time:</strong> {user_data.get('created_at', 'Unknown')}</li>
        </ul>
        <p>You can view this user in the admin dashboard.</p>
        """
        
        # Send the notification email
        return await send_notification_email(subject, body)
    except Exception as e:
        logger.error(f"Error sending user signup notification: {str(e)}")
        return False 