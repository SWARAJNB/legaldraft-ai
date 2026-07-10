from typing import List, Optional
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.activity import ActivityLog
from app.repositories.base import BaseRepository

class ActivityLogRepository(BaseRepository[ActivityLog]):
    def __init__(self, db: Session):
        super().__init__(ActivityLog, db)

    def get_by_workspace(self, workspace_id: uuid.UUID, limit: int = 100) -> List[ActivityLog]:
        stmt = (
            select(ActivityLog)
            .where(ActivityLog.workspace_id == workspace_id, ActivityLog.is_deleted == False)
            .order_by(ActivityLog.created_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get_by_user(self, user_id: uuid.UUID, limit: int = 100) -> List[ActivityLog]:
        stmt = (
            select(ActivityLog)
            .where(ActivityLog.user_id == user_id, ActivityLog.is_deleted == False)
            .order_by(ActivityLog.created_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())
