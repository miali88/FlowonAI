import asyncio
import logging
from app.services.vapi.utils import register_phone_number_with_vapi

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

async def main():
    try:
        phone_number = "+19473005216"
        twilio_account_sid = "AC2e61d0942c25dd6db0c6c1049fe1d3b1"
        
        logger.info(f"Testing Vapi phone number registration for {phone_number}")
        result = await register_phone_number_with_vapi(
            phone_number=phone_number,
            twilio_account_sid=twilio_account_sid
        )
        
        logger.info("Registration successful!")
        logger.info(f"Result: {result}")
        
    except Exception as e:
        logger.error(f"Error during registration: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(main()) 