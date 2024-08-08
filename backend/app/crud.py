from typing import Any, List
from datetime import datetime

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import JSON

from app.core.security import get_password_hash, verify_password
from app.models import Item, ItemCreate, User, UserCreate, UserUpdate, CacheEntry

async def create_user(*, session: AsyncSession, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    await session.commit()
    await session.refresh(db_obj)
    return db_obj

async def update_user(*, session: AsyncSession, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    return db_user

async def get_user_by_email(*, session: AsyncSession, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    result = await session.exec(statement)
    return result.first()

async def authenticate(*, session: AsyncSession, email: str, password: str) -> User | None:
    db_user = await get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user

async def create_item(*, session: AsyncSession, item_in: ItemCreate, owner_id: int) -> Item:
    db_item = Item.model_validate(item_in, update={"owner_id": owner_id})
    session.add(db_item)
    await session.commit()
    await session.refresh(db_item)
    return db_item

# class CacheManager:
#     @staticmethod
#     async def create(db: AsyncSession, key: str, value: dict) -> CacheEntry:
#         cache_entry = CacheEntry(key=key, value=value)
#         db.add(cache_entry)
#         await db.commit()
#         await db.refresh(cache_entry)
#         return cache_entry

#     @staticmethod
#     async def get(db: AsyncSession, key: str) -> CacheEntry | None:
#         result = await db.exec(select(CacheEntry).where(CacheEntry.key == key))
#         return result.first()

#     @staticmethod
#     async def update(db: AsyncSession, key: str, value: dict) -> CacheEntry | None:
#         cache_entry = await CacheManager.get(db, key)
#         if cache_entry:
#             cache_entry.value = value
#             cache_entry.last_updated = datetime.utcnow()
#             await db.commit()
#             await db.refresh(cache_entry)
#         return cache_entry

#     @staticmethod
#     async def delete(db: AsyncSession, key: str) -> None:
#         cache_entry = await CacheManager.get(db, key)
#         if cache_entry:
#             await db.delete(cache_entry)
#             await db.commit()

# class RetellAIEventManager:
#     @staticmethod
#     async def create(db: AsyncSession, event_id: str, payload: dict) -> RetellAIEvent:
#         event = RetellAIEvent(event_id=event_id, payload=payload)
#         db.add(event)
#         await db.commit()
#         await db.refresh(event)
#         return event

#     @staticmethod
#     async def get(db: AsyncSession, event_id: str) -> RetellAIEvent | None:
#         result = await db.exec(select(RetellAIEvent).where(RetellAIEvent.event_id == event_id))
#         return result.first()

#     @staticmethod
#     async def get_all(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[RetellAIEvent]:
#         return await db.exec(select(RetellAIEvent).offset(skip).limit(limit))

#     @staticmethod
#     async def delete(db: AsyncSession, event_id: str) -> None:
#         event = await RetellAIEventManager.get(db, event_id)
#         if event:
#             await db.delete(event)
#             await db.commit()

# class RetellAICallsManager:
#     @staticmethod
#     async def create(db: AsyncSession, event_id: str, payload: dict) -> RetellAICalls:
#         event = RetellAICalls(event_id=event_id, payload=payload)
#         db.add(event)
#         await db.commit()
#         await db.refresh(event)
#         return event
    
#     @staticmethod
#     async def get(db: AsyncSession, event_id: str) -> RetellAICalls | None:
#         result = await db.exec(select(RetellAICalls).where(RetellAICalls.event_id == event_id))
#         return result.first()
    
#     @staticmethod
#     async def get_all(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[RetellAICalls]:
#         return await db.exec(select(RetellAICalls).offset(skip).limit(limit))
    
#     @staticmethod
#     async def delete(db: AsyncSession, event_id: str) -> None:
#         event = await RetellAICallsManager.get(db, event_id)
#         if event:
#             await db.delete(event)
#             await db.commit()

# class WebhookCaptureManager:
#     @staticmethod
#     async def create(db: AsyncSession, method: str, url: str, headers: dict, body: str) -> WebhookCapture:
#         new_capture = WebhookCapture(
#             method=method,
#             url=url,
#             headers=headers,
#             body=body
#         )
#         db.add(new_capture)
#         await db.commit()
#         await db.refresh(new_capture)
#         return new_capture