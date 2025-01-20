from fastapi import Header
import logging

# Set up logging
logger = logging.getLogger(__name__)


async def get_current_user(x_user_id: str = Header(...)) -> str:
    logger.info("Authenticating user")
    logger.debug(f"x_user_id header: {x_user_id}")

    # Here you would typically validate the token with Clerk
    # For now, we'll just return the user ID from the header
    logger.info(f"User authenticated: {x_user_id}")
    return x_user_id
