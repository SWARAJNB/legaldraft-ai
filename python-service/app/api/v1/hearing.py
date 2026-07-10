import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.auth import User
from app.repositories.hearing_repository import HearingRepository
from app.repositories.case_repository import CaseRepository
from app.repositories.workspace_repository import WorkspaceMemberRepository
from app.repositories.timeline_repository import TimelineEventRepository
from app.services.hearing_service import HearingService
from app.schemas.hearing import HearingCreate, HearingUpdate, HearingResponse

router = APIRouter(prefix="/hearings", tags=["Hearings"])

def get_hearing_service(db: Session = Depends(get_db)) -> HearingService:
    hearing_repo = HearingRepository(db)
    case_repo = CaseRepository(db)
    member_repo = WorkspaceMemberRepository(db)
    timeline_repo = TimelineEventRepository(db)
    return HearingService(hearing_repo, case_repo, member_repo, timeline_repo)

@router.get("/case/{case_id}", response_model=List[HearingResponse])
def list_hearings(
    case_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: HearingService = Depends(get_hearing_service)
):
    return service.list_hearings(case_id, current_user.id)

@router.post("", response_model=HearingResponse, status_code=status.HTTP_201_CREATED)
def create_hearing(
    hearing_in: HearingCreate,
    current_user: User = Depends(get_current_user),
    service: HearingService = Depends(get_hearing_service)
):
    return service.create_hearing(current_user.id, hearing_in)

@router.get("/{hearing_id}", response_model=HearingResponse)
def get_hearing(
    hearing_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: HearingService = Depends(get_hearing_service)
):
    return service.get_hearing(hearing_id, current_user.id)

@router.patch("/{hearing_id}", response_model=HearingResponse)
def update_hearing(
    hearing_id: uuid.UUID,
    hearing_in: HearingUpdate,
    current_user: User = Depends(get_current_user),
    service: HearingService = Depends(get_hearing_service)
):
    return service.update_hearing(hearing_id, current_user.id, hearing_in)

@router.delete("/{hearing_id}", status_code=status.HTTP_200_OK)
def delete_hearing(
    hearing_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: HearingService = Depends(get_hearing_service)
):
    service.delete_hearing(hearing_id, current_user.id)
    return {"message": "Hearing deleted successfully"}
