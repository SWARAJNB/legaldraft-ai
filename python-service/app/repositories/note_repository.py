from typing import List
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.note import CaseNote
from app.repositories.base import BaseRepository

class CaseNoteRepository(BaseRepository[CaseNote]):
    def __init__(self, db: Session):
        super().__init__(CaseNote, db)

    def get_by_case(self, case_id: uuid.UUID) -> List[CaseNote]:
        stmt = (
            select(CaseNote)
            .where(CaseNote.case_id == case_id, CaseNote.is_deleted == False)
            .order_by(CaseNote.created_at.desc())
        )
        return list(self.db.scalars(stmt).all())
