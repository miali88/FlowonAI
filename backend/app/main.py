import sentry_sdk
from fastapi import FastAPI
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware
from loguru import logger

from app.api.main import api_router
from app.core.config import settings
from services.twilio import cleanup

def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

# Configure Loguru to send logs to Logstash
logger.add("tcp://logstash:5044", format="{message}", serialize=True)

@app.on_event("startup")
async def startup_event():
    logger.info("FastAPI application starting up")
    cleanup()

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("FastAPI application shutting down")

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            str(origin).strip("/") for origin in settings.BACKEND_CORS_ORIGINS
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

logger.info("CORS middleware configured")

app.include_router(api_router, prefix=settings.API_V1_STR)

logger.info("API router included")