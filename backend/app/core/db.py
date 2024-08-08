from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select, text
from typing import AsyncGenerator

from app.core.config import settings
from app.models import User
from app.core.security import get_password_hash  # Added this import

#engine_sync = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
engine = create_async_engine(settings.DATABASE_URL, echo=True, future=True)
AsyncSessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
    
# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/tiangolo/full-stack-fastapi-template/issues/28

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
            await session.commit()
    except Exception as e:
        print(f"Error initializing DB: {e}")
        await session.rollback()
        raise
    finally:
        await session.close()