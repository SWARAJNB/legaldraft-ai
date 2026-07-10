import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.auth import User
from app.repositories.note_repository import CaseNoteRepository
from app.repositories.case_repository import CaseRepository
from app.repositories.workspace_repository import WorkspaceMemberRepository
from app.repositories.timeline_repository import TimelineEventRepository
from app.services.note_service import CaseNoteService
from app.schemas.note import CaseNoteCreate, CaseNoteUpdate, CaseNoteResponse

router = APIRouter(prefix="/notes", tags=["CaseNotes"])

def get_note_service(db: Session = Depends(get_db)) -> CaseNoteService:
    note_repo = CaseNoteRepository(db)
    case_repo = CaseRepository(db)
    member_repo = WorkspaceMemberRepository(db)
    timeline_repo = TimelineEventRepository(db)
    return CaseNoteService(note_repo, case_repo, member_repo, timeline_repo)

@router.get("/case/{case_id}", response_model=List[CaseNoteResponse])
def list_notes(
    case_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: CaseNoteService = Depends(get_note_service)
):
    return service.list_notes(case_id, current_user.id)

@router.post("", response_model=CaseNoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    note_in: CaseNoteCreate,
    current_user: User = Depends(get_current_user),
    service: CaseNoteService = Depends(get_note_service)
):
    return service.create_note(current_user.id, note_in)

@router.get("/{note_id}", response_model=CaseNoteResponse)
def get_note(
    note_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: CaseNoteService = Depends(get_note_service)
):
    return service.get_note(note_id, current_user.id)

@router.patch("/{note_id}", response_model=CaseNoteResponse)
def update_note(
    note_id: uuid.UUID,
    note_in: CaseNoteUpdate,
    current_user: User = Depends(get_current_user),
    service: CaseNoteService = Depends(get_note_service)
):
    return service.update_note(note_id, current_user.id, note_in)

@router.delete("/{note_id}", status_code=status.HTTP_200_OK)
def delete_note(
    note_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: CaseNoteService = Depends(get_note_service)
):
    service.delete_note(note_id, current_user.id)
    return {"message": "Note deleted successfully"}
