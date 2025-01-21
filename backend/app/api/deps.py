from fastapi import Header, HTTPException
import logging
import jwt 
import os 
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# Set up logging
logger = logging.getLogger(__name__)

async def get_current_user(x_user_id: str = Header(...)):
    logger.info("Authenticating user")
    logger.debug(f"x_user_id header: {x_user_id}")
    
    # Here you would typically validate the token with Clerk
    # For now, we'll just return the user ID from the header
    logger.info(f"User authenticated: {x_user_id}")
    return x_user_id 




""" clerk jwt, to replace existing get_current_user """
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        # Remove 'Bearer ' from the token
        token = authorization.replace("Bearer ", "")
        
        # Verify the JWT token using Clerk's public key
        # You can get the public key from Clerk's dashboard
        public_key = os.getenv("CLERK_JWT_PUBLIC_KEY")
        decoded = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=os.getenv("CLERK_JWT_AUDIENCE"),
            issuer=os.getenv("CLERK_ISSUER")
        )
        
        return decoded
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token") 