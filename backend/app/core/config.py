import secrets
from typing import Any, Literal

from pydantic import (
    HttpUrl,
    computed_field,
    field_validator
)
from pydantic_settings import BaseSettings, SettingsConfigDict

from dotenv import load_dotenv
import os
load_dotenv()


def parse_cors(v: Any) -> list[str]:
    if isinstance(v, str):
        # Remove any whitespace and quotes
        v = v.strip().strip('"').strip("'")
        try:
            # Try to parse as JSON first
            import json
            return json.loads(v)
        except json.JSONDecodeError:
            # If JSON parsing fails, treat as comma-separated
            return [url.strip() for url in v.split(",") if url.strip()]
    if isinstance(v, list):
        return v
    raise ValueError(f"Invalid CORS format: {v}")


class Settings(BaseSettings):
    # API
    API_V1_STR: str = "/api/v1"
    DOMAIN: str = "localhost"
    API_BASE_URL: str = "http://localhost:8000/api/v1"
    FRONTEND_BASE_URL: str = "http://localhost:3000"
    
    # Project settings
    PROJECT_NAME: str = "Flowon AI"
    STACK_NAME: str = "fastapi_react"
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"
    SECRET_KEY: str = "secret_key"
    DEV_MODE: bool = True
    DEV_SERVER: str = ""
    
    # Docker settings
    DOCKER_IMAGE_BACKEND: str = "backend"
    DOCKER_IMAGE_FRONTEND: str = "frontend"
    
    # User management
    FIRST_SUPERUSER: str = ""
    FIRST_SUPERUSER_PASSWORD: str = ""
    USERS_OPEN_REGISTRATION: bool = True
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    
    # Redis settings
    REDIS_HOST: str = "redis-18595.c328.europe-west3-1.gce.redns.redis-cloud.com"
    REDIS_PORT: int = 18595
    REDIS_PASSWORD: str = "123456789"
    REDIS_DB: int = 0
    REDIS_TTL: int = 3600
    
    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # LiveKit
    LIVEKIT_API_KEY: str = ""
    LIVEKIT_API_SECRET: str = ""
    LIVEKIT_URL: str = ""
    LIVEKIT_SIP_URL: str = ""
    
    # API Keys
    PINECONE_API_KEY: str = ""
    HUMANLOOP_API_KEY: str = ""
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_NUMBER: str = ""
    RETELL_API_KEY: str = ""
    AGENT_FIRST: str = ""
    AGENT_SECOND: str = ""
    AGENT_FF: str = ""
    VAPI_API_PRIVATE_KEY: str = ""
    VAPI_API_PUBLIC_KEY: str = ""
    COMPOSIO_API_KEY: str = ""
    CAL_API_KEY: str = ""
    
    # Nylas
    NYLAS_API_KEY: str = ""
    NYLAS_CLIENT_ID: str = ""
    NYLAS_API_URI: str = ""
    NYLAS_CALLBACK_URI: str = ""
    
    # AI/ML Services
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    COHERE_PROD_API_KEY: str = ""
    COHERE_TRIAL_API_KEY: str = ""
    JINA_API_KEY: str = ""
    FIRECRAWL_API_KEY: str = ""
    
    # Media Services
    DEEPGRAM_API_KEY: str = ""
    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_VOICE_ID: str = ""
    CARTESIA_API_KEY: str = ""
    
    # Daily
    DAILY_SAMPLE_ROOM_URL: str = ""
    DAILY_API_KEY: str = ""
    DAILY_API_URL: str = ""
    
    # Weaviate
    WEAVIATE_API_KEY: str = ""
    WEAVIATE_URL: str = ""

    # Logging settings
    SENTRY_DSN: str = ""
    POSTHOG_API_KEY: str = ""

    # Payment and Authentication
    STRIPE_SECRET_KEY: str = ""
    STRIPE_SIGNING_SECRET: str = ""
    CLERK_SIGNING_SECRET: str = ""
    CLERK_SECRET_KEY: str = ""
    CLERK_JWT_KEY: str = ""
    
    # Integration APIs
    N8N_API_KEY: str = ""
    GREPTILE_API_KEY: str = ""
    GITHUB_TOKEN: str = ""
    PIPEDRIVE_API_KEY: str = ""
    DEEPSEEK_API_KEY: str = ""
    
    # LiveKit SIP
    LIVEKIT_SIP_HOST: str = ""
    SIP_OUTBOUND_TRUNK_ID: str = ""

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str]:
        try:
            return parse_cors(v)
        except Exception as e:
            print(f"Error parsing CORS origins: {e}")
            return ["http://localhost:3000"]  # fallback to default

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env"
    )


settings = Settings()
