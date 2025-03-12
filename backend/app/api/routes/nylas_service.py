# flake8: noqa: E501
import logging
from fastapi import HTTPException, APIRouter, Request
from nylas import Client as NylasClient # type: ignore
from fastapi.responses import RedirectResponse, HTMLResponse, JSONResponse

from app.core.config import settings


router = APIRouter()

# Initialize Nylas client
nylas_config = {
    "client_id": settings.NYLAS_CLIENT_ID,
    "callback_uri": settings.NYLAS_CALLBACK_URI,
    "api_key": settings.NYLAS_API_KEY,
    "api_uri": settings.NYLAS_API_URI,
}

nylas = NylasClient(
    api_key=nylas_config["api_key"],
    api_uri=nylas_config["api_uri"],
)


@router.api_route("/webhook", methods=["POST", "GET"])
async def webhook(request: Request) -> JSONResponse:
    print("\n\n nylas/webhook \n\n")
    return JSONResponse(content={"message": "Hello, World!"}, status_code=200)


@router.get("/auth")
async def nylas_auth() -> RedirectResponse:
    print("\n\n nylas_auth \n\n")
    """Start OAuth2 flow for Nylas"""
    auth_url = nylas.auth.url_for_oauth2({
        "client_id": nylas_config["client_id"],
        "redirect_uri": nylas_config["callback_uri"],
    })
    return RedirectResponse(url=auth_url)


@router.get("/oauth/exchange")
async def oauth_exchange(code: str) -> HTMLResponse:
    """Handle OAuth2 callback from Nylas"""
    if not code:
        raise HTTPException(
            status_code=400,
            detail="No authorization code returned from Nylas"
        )
    try:
        exchange = nylas.auth.exchange_code_for_token({
            "redirect_uri": nylas_config["callback_uri"],
            "code": code,
            "client_id": nylas_config["client_id"]
        })

        grant_id = exchange.grant_id
        print(f"\ngrant_id: {grant_id}")
        # TODO: Store grant_id in your database associated with the user

        html_content = """
        <!DOCTYPE html>
        <html>
            <head>
                <meta http-equiv="refresh" content="5;url=https://flowon.ai/dashboard">
                <style>
                    body { font-family: Arial,sans-serif; text-align: center; padding-top: 50px; }
                </style>
            </head>
            <body>
                <h2>Your account has successfully been linked.</h2>
                <p>Redirecting in 5 seconds...</p>
            </body>
        </html>
        """
        return HTMLResponse(content=html_content, status_code=200)
    except Exception as e:
        logging.error(f"Failed to exchange authorization code: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to exchange authorization code for token"
        )


async def send_notification_email(subject: str, body: str, recipient_email: str = "gabrielhsantosmoura@gmail.com") -> bool:
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
