import sentry_sdk
from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware

from app.api.main import api_router
from app.core.config import settings
from services.twilio import cleanup
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine, async_sessionmaker
from sqlalchemy.orm import AsyncSession
from sqlalchemy import text, select
from app.models import User
from app.core.security import get_password_hash
import asyncio 
import logging
from typing import AsyncGenerator

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

logger.debug("Starting application")

try:
    engine: AsyncEngine = create_async_engine(settings.DATABASE_URL, echo=True)
    logger.debug("Created async engine")
    AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)
    logger.debug("Created AsyncSessionLocal")
except Exception as e:
    logger.exception(f"Error creating engine or session: {e}")
    raise

def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"

if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

async def init_db(session: AsyncSession) -> None:
    try:
        # First, let's check if the database is accessible
        await session.execute(text("SELECT 1"))

        # Use select() instead of raw SQL
        result = await session.execute(
            select(User).where(User.email == settings.FIRST_SUPERUSER)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            user = User(
                email=settings.FIRST_SUPERUSER,
                hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
                is_superuser=True,
            )
            session.add(user)
            await session.commit()  # type: ignore
    except Exception as e:
        print(f"Error initializing DB: {e}")
        await session.rollback()  # type: ignore
        raise

async def init() -> None:
    async with AsyncSessionLocal() as session:
        await init_db(session)

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.debug("Entering lifespan function")
    # Startup
    retry_count = 0
    max_retries = 5
    while retry_count < max_retries:
        try:
            await init()
            break
        except Exception as e:
            retry_count += 1
            logger.warning(f"Initialization attempt {retry_count} failed: {e}")
            if retry_count < max_retries:
                await asyncio.sleep(2)  # Wait before retrying
            else:
                logger.error("All initialization attempts failed")
                raise  # Re-raise the last exception if all retries fail
    yield
    # Shutdown
    await engine.dispose()  # type: ignore
    cleanup()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
    lifespan=lifespan
)

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

app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)