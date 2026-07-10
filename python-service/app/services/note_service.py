import uuid
from datetime import datetime
from typing import List
from fastapi import HTTPException, status
from app.models.note import CaseNote
from app.models.activity import ActivityLog
from app.repositories.note_repository import CaseNoteRepository
from app.repositories.case_repository import CaseRepository
from app.repositories.workspace_repository import WorkspaceMemberRepository
from app.repositories.timeline_repository import TimelineEventRepository
from app.services.timeline_service import TimelineEventService
from app.schemas.note import CaseNoteCreate, CaseNoteUpdate
from app.schemas.timeline import TimelineEventCreate

class CaseNoteService:
    def __init__(self, note_repo: CaseNoteRepository, case_repo: CaseRepository, member_repo: WorkspaceMemberRepository, timeline_repo: TimelineEventRepository):
        self.note_repo = note_repo
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

    def list_notes(self, case_id: uuid.UUID, user_id: uuid.UUID) -> List[CaseNote]:
        self._check_access(case_id, user_id)
        return self.note_repo.get_by_case(case_id)

    def get_note(self, note_id: uuid.UUID, user_id: uuid.UUID) -> CaseNote:
        note = self.note_repo.get(note_id)
        if not note or note.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CaseNote not found")
        self._check_access(note.case_id, user_id)
        return note

    def create_note(self, user_id: uuid.UUID, data: CaseNoteCreate) -> CaseNote:
        self._check_access(data.case_id, user_id, ["owner", "admin", "member"])
        case = self.case_repo.get(data.case_id)
        
        note = CaseNote(
            case_id=data.case_id,
            title=data.title,
            content=data.content,
            created_by=user_id
        )
        self.note_repo.create(note)
        self.note_repo.commit()
        self.note_repo.refresh(note)

        t_event = TimelineEventCreate(
            case_id=data.case_id,
            event_type="note",
            title="Note Added",
            description=f"Note '{data.title}' was added by user.",
            event_date=datetime.utcnow()
        )
        self.timeline_service.add_event(t_event)

        activity = ActivityLog(
            user_id=user_id,
            workspace_id=case.workspace_id,
            action="create_note",
            entity_type="note",
            entity_id=note.id,
            details=f"Added note '{data.title}' for case '{case.title}'"
        )
        self.note_repo.db.add(activity)
        self.note_repo.db.commit()

        return note

    def update_note(self, note_id: uuid.UUID, user_id: uuid.UUID, data: CaseNoteUpdate) -> CaseNote:
        note = self.note_repo.get(note_id)
        if not note or note.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
        
        self._check_access(note.case_id, user_id, ["owner", "admin", "member"])
        case = self.case_repo.get(note.case_id)

        update_data = data.model_dump(exclude_unset=True)
        self.note_repo.update(note, update_data)
        self.note_repo.commit()
        self.note_repo.refresh(note)

        activity = ActivityLog(
            user_id=user_id,
            workspace_id=case.workspace_id,
            action="update_note",
            entity_type="note",
            entity_id=note.id,
            details=f"Updated note '{note.title}' for case '{case.title}'"
        )
        self.note_repo.db.add(activity)
        self.note_repo.db.commit()

        return note

    def delete_note(self, note_id: uuid.UUID, user_id: uuid.UUID) -> None:
        note = self.note_repo.get(note_id)
        if not note or note.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
        
        self._check_access(note.case_id, user_id, ["owner", "admin"])
        case = self.case_repo.get(note.case_id)

        note.is_deleted = True
        self.note_repo.commit()

        activity = ActivityLog(
            user_id=user_id,
            workspace_id=case.workspace_id,
            action="delete_note",
            entity_type="note",
            entity_id=note.id,
            details=f"Deleted note '{note.title}' for case '{case.title}'"
        )
        self.note_repo.db.add(activity)
        self.note_repo.db.commit()
