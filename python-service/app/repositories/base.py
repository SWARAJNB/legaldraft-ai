from typing import Generic, TypeVar, Type, List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import Session
from app.database.base import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    """
    Generic Repository pattern implementation using SQLAlchemy 2.0.
    Supports basic synchronous CRUD actions.
    """
    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db

    def get(self, id: Any) -> Optional[ModelType]:
        return self.db.get(self.model, id)

    def get_multi(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        stmt = select(self.model).offset(skip).limit(limit)
        return list(self.db.scalars(stmt).all())

    def create(self, obj_in: ModelType) -> ModelType:
        self.db.add(obj_in)
        return obj_in

    def update(self, db_obj: ModelType, update_data: dict) -> ModelType:
        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        self.db.add(db_obj)
        return db_obj

    def delete(self, id: Any) -> Optional[ModelType]:
        obj = self.get(id)
        if obj:
            self.db.delete(obj)
        return obj

    def commit(self) -> None:
        self.db.commit()

    def refresh(self, db_obj: ModelType) -> None:
        self.db.refresh(db_obj)
