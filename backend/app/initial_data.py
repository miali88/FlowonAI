import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import init_db, engine
from sqlalchemy.ext.asyncio import async_sessionmaker

async_session = async_sessionmaker(engine, expire_on_commit=False)

async def init() -> None:
    async with async_session() as session:
        await init_db(session)

async def main() -> None:
    print("Creating initial data")
    await init()
    print("Initial data created")

if __name__ == "__main__":
    asyncio.run(main())