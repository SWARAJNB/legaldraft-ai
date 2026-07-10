from typing import List
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.timeline import TimelineEvent
from app.repositories.base import BaseRepository

class TimelineEventRepository(BaseRepository[TimelineEvent]):
    def __init__(self, db: Session):
        super().__init__(TimelineEvent, db)

    def get_by_case(self, case_id: uuid.UUID) -> List[TimelineEvent]:
        stmt = (
            select(TimelineEvent)
            .where(TimelineEvent.case_id == case_id, TimelineEvent.is_deleted == False)
            .order_by(TimelineEvent.event_date.desc())
        )
        return list(self.db.scalars(stmt).all())
