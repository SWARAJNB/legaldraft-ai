import uuid
from datetime import datetime
from typing import List
from fastapi import HTTPException, status
from app.models.hearing import Hearing
from app.models.activity import ActivityLog
from app.repositories.hearing_repository import HearingRepository
from app.repositories.case_repository import CaseRepository
from app.repositories.workspace_repository import WorkspaceMemberRepository
from app.repositories.timeline_repository import TimelineEventRepository
from app.services.timeline_service import TimelineEventService
from app.schemas.hearing import HearingCreate, HearingUpdate
from app.schemas.timeline import TimelineEventCreate

class HearingService:
    def __init__(self, hearing_repo: HearingRepository, case_repo: CaseRepository, member_repo: WorkspaceMemberRepository, timeline_repo: TimelineEventRepository):
        self.hearing_repo = hearing_repo
        self.case_repo = case_repo
        self.member_repo = member_repo
        self.timeline_repo = timeline_repo
        self.timeline_service = TimelineEventService(timeline_repo, case_repo, member_repo)

    def _check_access(self, case_id: uuid.UUID, user_id: uuid.UUID, roles: List[str] = None) -> None:
        case = self.case_repo.get(case_id)
        if not case or case.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
        member = self.member_repo.get_member(case.workspace_id, user_id)
        if not member:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        if roles and member.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")

    def list_hearings(self, case_id: uuid.UUID, user_id: uuid.UUID) -> List[Hearing]:
        self._check_access(case_id, user_id)
        return self.hearing_repo.get_by_case(case_id)

    def get_hearing(self, hearing_id: uuid.UUID, user_id: uuid.UUID) -> Hearing:
        hearing = self.hearing_repo.get(hearing_id)
        if not hearing or hearing.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hearing not found")
        self._check_access(hearing.case_id, user_id)
        return hearing

    def create_hearing(self, user_id: uuid.UUID, data: HearingCreate) -> Hearing:
        self._check_access(data.case_id, user_id, ["owner", "admin", "member"])
        case = self.case_repo.get(data.case_id)
        
        hearing = Hearing(
            case_id=data.case_id,
            hearing_date=data.hearing_date,
            hearing_time=data.hearing_time,
            court_name=data.court_name,
            court_hall=data.court_hall,
            judge_name=data.judge_name,
            purpose=data.purpose,
            notes=data.notes,
            outcome=data.outcome,
            next_hearing_date=data.next_hearing_date
        )
        self.hearing_repo.create(hearing)
        self.hearing_repo.commit()
        self.hearing_repo.refresh(hearing)

        t_event = TimelineEventCreate(
            case_id=data.case_id,
            event_type="hearing",
            title="Hearing Scheduled",
            description=f"Next hearing scheduled on {data.hearing_date.strftime('%Y-%m-%d')} before judge {data.judge_name or 'N/A'} at {data.court_name or 'N/A'}.",
            event_date=datetime.utcnow()
        )
        self.timeline_service.add_event(t_event)

        activity = ActivityLog(
            user_id=user_id,
            workspace_id=case.workspace_id,
            action="create_hearing",
            entity_type="hearing",
            entity_id=hearing.id,
            details=f"Scheduled next hearing on {data.hearing_date.strftime('%Y-%m-%d')} for case '{case.title}'"
        )
        self.hearing_repo.db.add(activity)
        self.hearing_repo.db.commit()

        case.hearing_date = data.hearing_date
        self.case_repo.commit()

        return hearing

    def update_hearing(self, hearing_id: uuid.UUID, user_id: uuid.UUID, data: HearingUpdate) -> Hearing:
        hearing = self.hearing_repo.get(hearing_id)
        if not hearing or hearing.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hearing not found")
        
        self._check_access(hearing.case_id, user_id, ["owner", "admin", "member"])
        case = self.case_repo.get(hearing.case_id)

        update_data = data.model_dump(exclude_unset=True)
        self.hearing_repo.update(hearing, update_data)
        self.hearing_repo.commit()
        self.hearing_repo.refresh(hearing)

        t_event = TimelineEventCreate(
            case_id=hearing.case_id,
            event_type="hearing",
            title="Hearing Updated",
            description=f"Hearing scheduled for {hearing.hearing_date.strftime('%Y-%m-%d')} was updated.",
            event_date=datetime.utcnow()
        )
        self.timeline_service.add_event(t_event)

        activity = ActivityLog(
            user_id=user_id,
            workspace_id=case.workspace_id,
            action="update_hearing",
            entity_type="hearing",
            entity_id=hearing.id,
            details=f"Updated hearing details on {hearing.hearing_date.strftime('%Y-%m-%d')} for case '{case.title}'"
        )
        self.hearing_repo.db.add(activity)
        self.hearing_repo.db.commit()

        if "hearing_date" in update_data:
            case.hearing_date = hearing.hearing_date
            self.case_repo.commit()

        return hearing

    def delete_hearing(self, hearing_id: uuid.UUID, user_id: uuid.UUID) -> None:
        hearing = self.hearing_repo.get(hearing_id)
        if not hearing or hearing.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hearing not found")
        
        self._check_access(hearing.case_id, user_id, ["owner", "admin"])
        case = self.case_repo.get(hearing.case_id)

        hearing.is_deleted = True
        self.hearing_repo.commit()

        t_event = TimelineEventCreate(
            case_id=hearing.case_id,
            event_type="hearing",
            title="Hearing Removed",
            description=f"Hearing scheduled on {hearing.hearing_date.strftime('%Y-%m-%d')} was cancelled/deleted.",
            event_date=datetime.utcnow()
        )
        self.timeline_service.add_event(t_event)

        activity = ActivityLog(
            user_id=user_id,
            workspace_id=case.workspace_id,
            action="delete_hearing",
            entity_type="hearing",
            entity_id=hearing.id,
            details=f"Deleted hearing scheduled on {hearing.hearing_date.strftime('%Y-%m-%d')} for case '{case.title}'"
        )
        self.hearing_repo.db.add(activity)
        self.hearing_repo.db.commit()
