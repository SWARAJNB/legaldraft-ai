from typing import Optional, List
import uuid
from sqlalchemy import select, or_
from sqlalchemy.orm import Session
from app.models.case import Case
from app.repositories.base import BaseRepository

class CaseRepository(BaseRepository[Case]):
    def __init__(self, db: Session):
        super().__init__(Case, db)

    def get_by_workspace(self, workspace_id: uuid.UUID) -> List[Case]:
        stmt = select(Case).where(Case.workspace_id == workspace_id, Case.is_deleted == False)
        return list(self.db.scalars(stmt).all())

    def get_by_client(self, client_id: uuid.UUID) -> List[Case]:
        stmt = select(Case).where(Case.client_id == client_id, Case.is_deleted == False)
        return list(self.db.scalars(stmt).all())

    def get_by_number(self, case_number: str) -> Optional[Case]:
        stmt = select(Case).where(Case.case_number == case_number, Case.is_deleted == False)
        return self.db.scalars(stmt).first()

    def search(self, workspace_id: uuid.UUID, query: str) -> List[Case]:
        stmt = select(Case).where(
            Case.workspace_id == workspace_id,
            Case.is_deleted == False,
            or_(
                Case.case_number.ilike(f"%{query}%"),
                Case.title.ilike(f"%{query}%"),
                Case.court.ilike(f"%{query}%"),
                Case.description.ilike(f"%{query}%"),
            )
        )
        return list(self.db.scalars(stmt).all())

    def get_recent(self, workspace_id: uuid.UUID, limit: int = 5) -> List[Case]:
        stmt = (
            select(Case)
            .where(Case.workspace_id == workspace_id, Case.is_deleted == False)
            .order_by(Case.created_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())
