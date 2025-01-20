from typing import Optional, Dict, Any, List
from twilio.rest import Client
import os 
from dotenv import load_dotenv

load_dotenv()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


def purchase_phone_number(phone_number: str) -> Dict[str, Any]:
    """
    Purchase a specific phone number from Twilio
    
    Args:
        phone_number (str): The phone number to purchase in E.164 format (e.g., '+1234567890')
    
    Returns:
        Dict[str, Any]: Dictionary containing the purchased number details
        
    Raises:
        Exception: If the purchase fails
    """
    try:
        purchased_number = client.incoming_phone_numbers.create(
            phone_number=phone_number
        )
        return {
            'phone_number': purchased_number.phone_number,
            'sid': purchased_number.sid,
            'friendly_name': purchased_number.friendly_name,
            'capabilities': {
                'voice': purchased_number.capabilities.get('voice', False),
                'sms': purchased_number.capabilities.get('sms', False),
                'mms': purchased_number.capabilities.get('mms', False)
            }
        }
    except Exception as e:
        raise Exception(f"Failed to purchase number: {str(e)}")


if __name__ == "__main__":
    print(purchase_phone_number("+13614281772"))

