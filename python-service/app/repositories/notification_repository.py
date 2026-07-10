from typing import List
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.repositories.base import BaseRepository

class NotificationRepository(BaseRepository[Notification]):
    def __init__(self, db: Session):
        super().__init__(Notification, db)

    def get_by_user(self, user_id: uuid.UUID, limit: int = 100) -> List[Notification]:
        stmt = (
            select(Notification)
            .where(Notification.user_id == user_id, Notification.is_deleted == False)
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get_unread_by_user(self, user_id: uuid.UUID) -> List[Notification]:
        stmt = (
            select(Notification)
            .where(
                Notification.user_id == user_id,
                Notification.read == False,
                Notification.is_deleted == False
            )
            .order_by(Notification.created_at.desc())
        )
        return list(self.db.scalars(stmt).all())
