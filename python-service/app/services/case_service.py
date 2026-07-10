import uuid
from typing import List, Optional
from fastapi import HTTPException, status
import json
from app.models.case import Case
from app.models.activity import ActivityLog
from app.models.timeline import TimelineEvent
from app.repositories.case_repository import CaseRepository
from app.repositories.workspace_repository import WorkspaceMemberRepository
from app.schemas.case import CaseCreate, CaseUpdate


class CaseService:
    def __init__(self, case_repo: CaseRepository, member_repo: WorkspaceMemberRepository):
        self.case_repo = case_repo
        self.member_repo = member_repo

    def _check_access(self, workspace_id: uuid.UUID, user_id: uuid.UUID, roles: List[str] = None):
        member = self.member_repo.get_member(workspace_id, user_id)
        if not member:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this workspace")
        if roles and member.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
        return member

    def list_cases(self, workspace_id: uuid.UUID, user_id: uuid.UUID, search: Optional[str] = None) -> List[Case]:
        self._check_access(workspace_id, user_id)
        if search:
            return self.case_repo.search(workspace_id, search)
        return self.case_repo.get_by_workspace(workspace_id)

    def get_cases_by_client(self, client_id: uuid.UUID, workspace_id: uuid.UUID, user_id: uuid.UUID) -> List[Case]:
        self._check_access(workspace_id, user_id)
        return self.case_repo.get_by_client(client_id)

    def get_case(self, case_id: uuid.UUID, user_id: uuid.UUID) -> Case:
        case = self.case_repo.get(case_id)
        if not case or case.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
        self._check_access(case.workspace_id, user_id)
        return case

    def create_case(self, workspace_id: uuid.UUID, user_id: uuid.UUID, data: CaseCreate) -> Case:
        self._check_access(workspace_id, user_id, ["owner", "admin", "member"])
        case = Case(
            case_number=data.case_number,
            title=data.title,
            case_type=data.case_type,
            court=data.court,
            judge=data.judge,
            status=data.status,
            priority=data.priority,
            filing_date=data.filing_date,
            hearing_date=data.hearing_date,
            description=data.description,
            client_id=data.client_id,
            workspace_id=workspace_id
        )
        self.case_repo.create(case)
        self.case_repo.commit()
        self.case_repo.refresh(case)

        # 1. Create Timeline Event DB record
        t_event = TimelineEvent(
            case_id=case.id,
            event_type="milestone",
            title="Case Record Created",
            description=f"Case record was successfully initialized under court '{case.court}'.",
            event_date=datetime.utcnow()
        )
        self.case_repo.db.add(t_event)
        self.case_repo.db.commit()
        self.case_repo.db.refresh(t_event)

        # Update case timeline JSON array
        case.timeline = json.dumps([{
            "id": str(t_event.id),
            "date": t_event.event_date.isoformat(),
            "title": t_event.title,
            "description": t_event.description,
            "type": t_event.event_type
        }])
        self.case_repo.commit()

        # 2. Log Activity
        activity = ActivityLog(
            user_id=user_id,
            workspace_id=workspace_id,
            action="create_case",
            entity_type="case",
            entity_id=case.id,
            details=f"Created case record '{case.title}'"
        )
        self.case_repo.db.add(activity)
        self.case_repo.db.commit()

        return case

    def update_case(self, case_id: uuid.UUID, user_id: uuid.UUID, data: CaseUpdate) -> Case:
        case = self.case_repo.get(case_id)
        if not case or case.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
        self._check_access(case.workspace_id, user_id, ["owner", "admin", "member"])
        update_data = data.model_dump(exclude_unset=True)
        self.case_repo.update(case, update_data)
        self.case_repo.commit()
        self.case_repo.refresh(case)
        return case

    def delete_case(self, case_id: uuid.UUID, user_id: uuid.UUID) -> None:
        case = self.case_repo.get(case_id)
        if not case or case.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
        self._check_access(case.workspace_id, user_id, ["owner", "admin"])
        case.is_deleted = True
        self.case_repo.commit()
