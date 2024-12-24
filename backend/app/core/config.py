import secrets
from typing import Any, Literal

from pydantic import (
    HttpUrl,
    computed_field,
)
from pydantic_settings import BaseSettings, SettingsConfigDict

from dotenv import load_dotenv
import os
load_dotenv()

def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_ignore_empty=True, extra="ignore"
    )
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    DOMAIN: str = "localhost"
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"

    @computed_field  # type: ignore[misc]
    @property
    def server_host(self) -> str:
        # Use HTTPS for anything other than local development
        if self.ENVIRONMENT == "local":
            return f"http://{self.DOMAIN}"
        return f"https://{self.DOMAIN}"

    PROJECT_NAME: str = "FlowOn AI"
    SENTRY_DSN: HttpUrl | None = None
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "changethis"
    POSTGRES_DB: str = ""

    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_NUMBER: str = ""

    NYLAS_CLIENT_ID: str = ""
    NYLAS_API_KEY: str = ""
    NYLAS_API_URI: str = ""
    NYLAS_CALLBACK_URI: str = ""

    WEAVIATE_URL: str = ""
    WEAVIATE_API_KEY: str = ""

    BASE_URL: str = os.getenv("API_BASE_URL")
    #BASE_URL: str = "http://localhost:8000"

   
    JINA_API_KEY: str = ""
    
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

        # LLM service
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = "" 

    # TTS, STT
    DEEPGRAM_API_KEY: str = ""  
    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_VOICE_ID: str = ""

    # Daily
    DAILY_SAMPLE_ROOM_URL: str = ""
    DAILY_API_KEY: str = ""


settings = Settings()