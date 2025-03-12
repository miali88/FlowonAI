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
    # Not loading from environment to avoid JSON parsing issues
    @computed_field
    @property
    def BACKEND_CORS_ORIGINS(self) -> list[str]:
        """Hardcoded list of CORS origins to avoid parsing issues."""
        return [
            "http://localhost:3000",
            "https://localhost:3000",
            "https://flowon.ai",
            "https://www.flowon.ai",
            "https://internally-wise-spaniel.in.ngrok.io",
            "https://internally-wise-spaniel.eu.ngrok.io",
            "http://ngrok.io",
            "https://ngrok.io",
            "http://internally-wise-spaniel.ngrok.io",
            "*"  # Allow all origins as a fallback
        ]
    
    # Redis settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_USER: str = ""
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0
    REDIS_TTL: int = 3600
    
    # Extra fields from .env
    PUBLIC_BASE_URL: str = ""
    TWILIO_WEBHOOK_URL: str = ""
    ELEVEN_API_KEY: str = ""
    
    # Clerk settings with defaults
    CLERK_JWT_ISSUER: str = ""
    CLERK_PUBLIC_KEY: str = ""
    
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
    NYLAS_GRANT_ID: str = os.getenv("NYLAS_GRANT_ID", "")
    
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
    GROQ_API_KEY: str = ""
    
    # LiveKit SIP
    LIVEKIT_SIP_HOST: str = ""
    SIP_OUTBOUND_TRUNK_ID: str = ""

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="ignore"  # Ignore extra fields from env file
    )


settings = Settings()
