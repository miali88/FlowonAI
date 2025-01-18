# flake8: noqa: E501
import logging
from fastapi import HTTPException, APIRouter, Request
from supabase import create_client, Client
from nylas import Client as NylasClient # type: ignore
from fastapi.responses import RedirectResponse, HTMLResponse, JSONResponse

from app.core.config import settings

supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY
)

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
