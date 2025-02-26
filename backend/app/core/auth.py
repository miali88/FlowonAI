import httpx
from typing import Dict
import os

from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()

CLERK_JWT_ISSUER = os.getenv("CLERK_JWT_ISSUER")
CLERK_PUBLIC_KEY = os.getenv("CLERK_PUBLIC_KEY")
if not CLERK_JWT_ISSUER:
    logger.error("CLERK_JWT_ISSUER environment variable is not set")

if not CLERK_PUBLIC_KEY:
    logger.error("CLERK_PUBLIC_KEY environment variable is not set")

# Cache for JWKS
_jwks_cache: Dict = {}

async def get_jwks():
    """Fetch the JWKS from Clerk"""
    global _jwks_cache
    
    try:
        # Return cached JWKS if available
        if _jwks_cache:
            return _jwks_cache
            
        jwks_url = f"{CLERK_JWT_ISSUER}/.well-known/jwks.json"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(jwks_url)
            response.raise_for_status()
            
            _jwks_cache = response.json()
            return _jwks_cache
            
    except Exception as e:
        logger.error(f"Error fetching JWKS: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching JWKS: {str(e)}")

async def get_current_user(
        credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Validate the JWT token from Clerk and return the user ID
    """
    try:
        token = credentials.credentials
        return await validate_token(token)
        
    except Exception as e:
        logger.error(f"Unexpected error during token validation: {str(e)}")
        raise HTTPException(status_code=401, detail=str(e))

async def validate_token(token: str) -> str:
    """
    Helper function to validate a raw JWT token and return the user ID
    """
    try:
        # Decode header without verification to get the key ID
        try:
            header = jwt.get_unverified_header(token)
        except Exception as e:
            logger.error(f"Error decoding token header: {str(e)}")
            raise HTTPException(status_code=401, detail="Invalid token header")
        
        # Get the key ID from the header
        kid = header.get('kid')
        if not kid:
            raise HTTPException(status_code=401, detail="No 'kid' in token header")
            
        # Get JWKS and find the matching key
        jwks = await get_jwks()
        key = None
        for jwk in jwks.get('keys', []):
            if jwk.get('kid') == kid:
                key = jwk
                break
                
        if not key:
            logger.error(f"No matching key found for kid: {kid}")
            raise HTTPException(status_code=401, detail="No matching key found")
            
        # Verify the token
        try:
            payload = jwt.decode(
                token,
                key,
                algorithms=['RS256'],
                audience='bankstream',
                issuer=CLERK_JWT_ISSUER
            )
        except jwt.ExpiredSignatureError:
            logger.error("Token has expired")
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.JWTError as e:
            logger.error(f"JWT validation error: {str(e)}")
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
            
        # Get the user ID from the token
        user_id = payload.get("sub")
        if not user_id:
            logger.error("No user ID found in token payload")
            raise HTTPException(status_code=401, detail="Invalid user ID in token")
            
        logger.info(f"Successfully validated token for user: {user_id}")
        return user_id
    
    except Exception as e:
        logger.error(f"Unexpected error during token validation: {str(e)}")
        raise HTTPException(status_code=401, detail=str(e))