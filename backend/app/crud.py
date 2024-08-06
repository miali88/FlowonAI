from typing import Any, List
from datetime import datetime

from sqlmodel import Session, select
from sqlalchemy import JSON

from app.core.security import get_password_hash, verify_password
from app.models import Item, ItemCreate, User, UserCreate, UserUpdate, CacheEntry, RetellAIEvent, RetellAICalls

def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj

def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user

def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user

def create_item(*, session: Session, item_in: ItemCreate, owner_id: int) -> Item:
    db_item = Item.model_validate(item_in, update={"owner_id": owner_id})
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item

class CacheManager:
    @staticmethod
    def create(db: Session, key: str, value: dict) -> CacheEntry:
        cache_entry = CacheEntry(key=key, value=value)
        db.add(cache_entry)
        db.commit()
        db.refresh(cache_entry)
        return cache_entry

    @staticmethod
    def get(db: Session, key: str) -> CacheEntry | None:
        return db.exec(select(CacheEntry).where(CacheEntry.key == key)).first()

    @staticmethod
    def update(db: Session, key: str, value: dict) -> CacheEntry | None:
        cache_entry = CacheManager.get(db, key)
        if cache_entry:
            cache_entry.value = value
            cache_entry.last_updated = datetime.utcnow()
            db.commit()
            db.refresh(cache_entry)
        return cache_entry

    @staticmethod
    def delete(db: Session, key: str) -> None:
        cache_entry = CacheManager.get(db, key)
        if cache_entry:
            db.delete(cache_entry)
            db.commit()

class RetellAIEventManager:
    @staticmethod
    def create(db: Session, event_id: str, payload: dict) -> RetellAIEvent:
        event = RetellAIEvent(event_id=event_id, payload=payload)
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    @staticmethod
    def get(db: Session, event_id: str) -> RetellAIEvent | None:
        return db.exec(select(RetellAIEvent).where(RetellAIEvent.event_id == event_id)).first()

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[RetellAIEvent]:
        return db.exec(select(RetellAIEvent).offset(skip).limit(limit)).all()

    @staticmethod
    def delete(db: Session, event_id: str) -> None:
        event = RetellAIEventManager.get(db, event_id)
        if event:
            db.delete(event)
            db.commit()

class RetellAICallsManager:
    @staticmethod
    def create(db: Session, event_id: str, payload: dict) -> RetellAICalls:
        event = RetellAICalls(event_id=event_id, payload=payload)
        db.add(event)
        db.commit()
        db.refresh(event)
        return event
    
    @staticmethod
    def get(db: Session, event_id: str) -> RetellAICalls | None:
        return db.exec(select(RetellAICalls).where(RetellAICalls.event_id == event_id)).first()
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[RetellAICalls]:
        return db.exec(select(RetellAICalls).offset(skip).limit(limit)).all()
    
    @staticmethod
    def delete(db: Session, event_id: str) -> None:
        event = RetellAICallsManager.get(db, event_id)
        if event:
            db.delete(event)
            db.commit()