from fastapi import Header, HTTPException
import logging
import jwt 
import os 
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# Set up logging
logger = logging.getLogger(__name__)


async def get_current_user(
    user_id: Optional[str] = None,  # Accept as query parameter
    x_user_id: Optional[str] = Header(None)  # Accept as header
) -> str:
    """
    Get the current user ID from either query parameter or header.
    
    Returns:
        The user ID
    """
    logger.info("Authenticating user")
    
    # Use the user_id from query parameter or header
    current_user = user_id or x_user_id
    
    if not current_user:
        logger.error("No user ID provided")
        raise HTTPException(status_code=401, detail="User ID is required")
    
    logger.info(f"User authenticated: {current_user}")
    return current_user




# """ clerk jwt, to replace existing get_current_user """
# async def get_current_user(authorization: Optional[str] = Header(None)):
#     if not authorization:
#         raise HTTPException(status_code=401, detail="Authorization header missing")
    
#     try:
#         # Remove 'Bearer ' from the token
#         token = authorization.replace("Bearer ", "")
        
#         # Verify the JWT token using Clerk's public key
#         # You can get the public key from Clerk's dashboard
#         public_key = os.getenv("CLERK_JWT_PUBLIC_KEY")
#         decoded = jwt.decode(
#             token,
#             public_key,
#             algorithms=["RS256"],
#             audience=os.getenv("CLERK_JWT_AUDIENCE"),
#             issuer=os.getenv("CLERK_ISSUER")
#         )
        
#         return decoded
#     except jwt.InvalidTokenError:
#         raise HTTPException(status_code=401, detail="Invalid token") 