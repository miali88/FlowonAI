from fastapi import Header, HTTPException
from clerk import Clerk
import logging
import os

logger = logging.getLogger(__name__)

clerk = Clerk(secret_key=os.getenv("CLERK_SECRET_KEY"))


async def get_current_user(x_user_id: str = Header(...)) -> str:
    logger.info("Authenticating user")
    logger.debug(f"x_user_id header: {x_user_id}")

    try:
        session = clerk.sessions.verify_token(x_user_id)
        
        if not session:
            logger.warning(f"Invalid session token for user: {x_user_id}")
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication credentials"
            )
        
        user_id = session.user_id
        logger.info(f"User authenticated: {user_id}")
        return user_id

    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )
