import uuid
import json
from datetime import datetime
from typing import List
from fastapi import HTTPException, status
from app.models.timeline import TimelineEvent
from app.repositories.timeline_repository import TimelineEventRepository
from app.repositories.case_repository import CaseRepository
from app.repositories.workspace_repository import WorkspaceMemberRepository
from app.schemas.timeline import TimelineEventCreate

class TimelineEventService:
    def __init__(self, timeline_repo: TimelineEventRepository, case_repo: CaseRepository, member_repo: WorkspaceMemberRepository):
        self.timeline_repo = timeline_repo
        self.case_repo = case_repo
        self.member_repo = member_repo

    def list_events(self, case_id: uuid.UUID, user_id: uuid.UUID) -> List[TimelineEvent]:
        case = self.case_repo.get(case_id)
        if not case or case.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
        
        member = self.member_repo.get_member(case.workspace_id, user_id)
        if not member:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
            
        return self.timeline_repo.get_by_case(case_id)

    def add_event(self, data: TimelineEventCreate) -> TimelineEvent:
        event = TimelineEvent(
            case_id=data.case_id,
            event_type=data.event_type,
            title=data.title,
            description=data.description,
            event_date=data.event_date
        )
        self.timeline_repo.create(event)
        self.timeline_repo.commit()
        self.timeline_repo.refresh(event)

        case = self.case_repo.get(data.case_id)
        if case:
            timeline_list = []
            if case.timeline:
                try:
                    timeline_list = json.loads(case.timeline)
                except Exception:
                    timeline_list = []
            timeline_list.append({
                "id": str(event.id),
                "date": event.event_date.isoformat(),
                "title": event.title,
                "description": event.description,
                "type": event.event_type
            })
            case.timeline = json.dumps(timeline_list)
            self.case_repo.commit()

        return event
