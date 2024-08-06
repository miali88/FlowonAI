from typing import Any
from datetime import datetime

from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models import Item, ItemCreate, User, UserCreate, UserUpdate, InMemCache, InMemCacheCreate


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


def create_cache_entry(*, session: Session, cache_entry: InMemCacheCreate) -> InMemCache:
    db_obj = InMemCache(**cache_entry.model_dump())
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj

def get_cache_entry(*, session: Session, key: str) -> InMemCache | None:
    statement = select(InMemCache).where(InMemCache.key == key)
    return session.exec(statement).first()

def update_cache_entry(*, session: Session, db_obj: InMemCache, cache_entry: InMemCacheCreate) -> InMemCache:
    db_obj.value = cache_entry.value
    db_obj.expiration = cache_entry.expiration
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj

def delete_cache_entry(*, session: Session, key: str) -> None:
    statement = select(InMemCache).where(InMemCache.key == key)
    db_obj = session.exec(statement).first()
    if db_obj:
        session.delete(db_obj)
        session.commit()

def delete_expired_cache_entries(*, session: Session) -> None:
    current_time = datetime.utcnow()
    statement = select(InMemCache).where(InMemCache.expiration < current_time)
    expired_entries = session.exec(statement).all()
    for entry in expired_entries:
        session.delete(entry)
    session.commit()

class CacheManager:
    def __init__(self, session: Session):
        self.session = session

    def create_entry(self, cache_entry: InMemCacheCreate) -> InMemCache:
        db_obj = InMemCache(**cache_entry.model_dump())
        self.session.add(db_obj)
        self.session.commit()
        self.session.refresh(db_obj)
        return db_obj

    def get_entry(self, key: str) -> InMemCache | None:
        statement = select(InMemCache).where(InMemCache.key == key)
        return self.session.exec(statement).first()

    def update_entry(self, db_obj: InMemCache, cache_entry: InMemCacheCreate) -> InMemCache:
        db_obj.value = cache_entry.value
        db_obj.expiration = cache_entry.expiration
        self.session.add(db_obj)
        self.session.commit()
        self.session.refresh(db_obj)
        return db_obj

    def delete_entry(self, key: str) -> None:
        statement = select(InMemCache).where(InMemCache.key == key)
        db_obj = self.session.exec(statement).first()
        if db_obj:
            self.session.delete(db_obj)
            self.session.commit()

    def delete_expired_entries(self) -> None:
        current_time = datetime.utcnow()
        statement = select(InMemCache).where(InMemCache.expiration < current_time)
        expired_entries = self.session.exec(statement).all()
        for entry in expired_entries:
            self.session.delete(entry)
        self.session.commit()
