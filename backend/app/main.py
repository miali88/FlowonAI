import sentry_sdk
from fastapi import FastAPI
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware
from services.twilio import cleanup

from app.api.main import api_router
from app.core.config import settings
from contextlib import asynccontextmanager
import os 
from dotenv import load_dotenv

load_dotenv()

def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"

if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

origins = ["http://localhost:3000", 
           "https://localhost:3000", 
           "https://internally-wise-spaniel.in.ngrok.io",
           "https://internally-wise-spaniel.eu.ngrok.io/",
           "ngrok.io",
           "http://ngrok.io",
           "https://ngrok.io",
           "https://eu.ngrok.io",
           "http://internally-wise-spaniel.ngrok.io",
           "https://internally-wise-spaniel.ngrok.io"]


if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

#print("origins",[str(origins).strip(",") for origin in settings.BACKEND_CORS_ORIGINS])

app.include_router(api_router, prefix=settings.API_V1_STR)

# @app.on_event("startup")
# async def startup_event():
#     cleanup()

# @app.on_event("shutdown")
# async def shutdown_event():
#     cleanup()