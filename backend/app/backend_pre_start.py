import logging

from sqlalchemy import Engine
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlmodel import select
from tenacity import after_log, before_log, retry, stop_after_attempt, wait_fixed

from app.core.db import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

max_tries = 60 * 5  # 5 minutes
wait_seconds = 1


@retry(
    stop=stop_after_attempt(max_tries),
    wait=wait_fixed(wait_seconds),
    before=before_log(logger, logging.INFO),
    after=after_log(logger, logging.WARN),
)
async def init(db_engine: Engine) -> None:
    try:
        async_session = async_sessionmaker(db_engine, expire_on_commit=False)
        async with async_session() as session:
            # Try to create session to check if DB is awake
            result = await session.execute(select(1))
            logger.info(f"Database connection successful. Result: {result.scalar()}")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        raise e


async def main() -> None:
    logger.info("Initializing service")
    await init(engine)
    logger.info("Service finished initializing")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())