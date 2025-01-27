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

    TWILIO_ACCOUNT_SID: str = "AC2e61d0942c25dd6db0c6c1049fe1d3b1"
    TWILIO_AUTH_TOKEN: str = "f2454926f9603411f87e9db96415a37d"
    TWILIO_NUMBER: str = "447723180506"

    NYLAS_CLIENT_ID: str = "b39310e3-7a3d-4f9f-877d-a9193e905b81"
    NYLAS_API_KEY: str = "nyk_v0_3rL6a1ElpMlb3x6riUT84orU4S2s2hoKL5J5F0xZo2T6SLODS7TedbdwiGqbMmKs"
    NYLAS_API_URI: str = "https://api.us.nylas.com"
    NYLAS_CALLBACK_URI: str = "http://localhost:8000/api/v1/nylas/oauth/exchange"

    WEAVIATE_URL: str = "https://l8zwpbz7qcqxxf8ciicq.c0.europe-west3.gcp.weaviate.cloud"
    WEAVIATE_API_KEY: str = "YzEqU07qxyccKewQ7DMC97ua3gzJ0dl8Meg3"  
    BASE_URL: str = os.getenv("API_BASE_URL", "")
    if not BASE_URL:
        raise ValueError("API_BASE_URL is not set")
    # BASE_URL: str = "http://localhost:8000"

    JINA_API_KEY: str = "jina_f286ad37141f4058b863b70d01a37b99pbpTAdX3yJSPsVN6C-BDxZJlxtjR"

    SUPABASE_URL: str = "https://isfghqgmaigvrvohuxbx.supabase.co"
    SUPABASE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZmdocWdtYWlndnJ2b2h1eGJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI5OTUxMzMsImV4cCI6MjAzODU3MTEzM30.koSLaS4NMWK_bjPP898_bJCjg6VONgYLPUaXSqu-COI"
    SUPABASE_SERVICE_ROLE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZmdocWdtYWlndnJ2b2h1eGJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMjk5NTEzMywiZXhwIjoyMDM4NTcxMTMzfQ.GacsdMRTPwTrmmHRrEOdeRiboCjxsn8AmMInNSHGdno"

    # LLM service
    OPENAI_API_KEY: str = "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"
    ANTHROPIC_API_KEY: str = "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"

    # TTS, STT
    DEEPGRAM_API_KEY: str = "98e2c5e7de067d9892581f0c0ebe4414972ad6fb"
    ELEVENLABS_API_KEY: str = "9fcadcb695794ed2065bf9e3233b181d"
    ELEVENLABS_VOICE_ID: str = "aTbnroHRGIomiKpqAQR8"

    # Daily
    DAILY_SAMPLE_ROOM_URL: str = "https://flowoni.daily.co/zBSLFJwv20Bz9Yhq3o1e"
    DAILY_API_KEY: str = "7a7484a1d4fbaf4258b976254867e83072b8f116181703b8f98ac3313a07e7b6"

    AGENT_SECOND: str = "AGENT_SECOND"


settings = Settings()
