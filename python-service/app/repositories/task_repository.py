from typing import List
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.task import Task
from app.repositories.base import BaseRepository

class TaskRepository(BaseRepository[Task]):
    def __init__(self, db: Session):
        super().__init__(Task, db)

    def get_by_case(self, case_id: uuid.UUID) -> List[Task]:
        stmt = (
            select(Task)
            .where(Task.case_id == case_id, Task.is_deleted == False)
            .order_by(Task.due_date.asc())
        )
        return list(self.db.scalars(stmt).all())

    def get_pending_by_workspace(self, workspace_id: uuid.UUID, limit: int = 5) -> List[Task]:
        from app.models.case import Case
        stmt = (
            select(Task)
            .join(Case, Case.id == Task.case_id)
            .where(
                Case.workspace_id == workspace_id,
                Task.status != "completed",
                Task.is_deleted == False,
                Case.is_deleted == False
            )
            .order_by(Task.due_date.asc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())
