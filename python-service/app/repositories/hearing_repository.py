from typing import List
import uuid
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.hearing import Hearing
from app.repositories.base import BaseRepository

class HearingRepository(BaseRepository[Hearing]):
    def __init__(self, db: Session):
        super().__init__(Hearing, db)

    def get_by_case(self, case_id: uuid.UUID) -> List[Hearing]:
        stmt = (
            select(Hearing)
            .where(Hearing.case_id == case_id, Hearing.is_deleted == False)
            .order_by(Hearing.hearing_date.asc())
        )
        return list(self.db.scalars(stmt).all())

    def get_upcoming_by_workspace(self, workspace_id: uuid.UUID, limit: int = 5) -> List[Hearing]:
        from app.models.case import Case
        stmt = (
            select(Hearing)
            .join(Case, Case.id == Hearing.case_id)
            .where(
                Case.workspace_id == workspace_id,
                Hearing.hearing_date >= datetime.utcnow(),
                Hearing.is_deleted == False,
                Case.is_deleted == False
            )
            .order_by(Hearing.hearing_date.asc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())
