import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.auth import User
from app.repositories.activity_repository import ActivityLogRepository
from app.repositories.workspace_repository import WorkspaceMemberRepository
from app.services.activity_service import ActivityLogService
from app.schemas.activity import ActivityLogCreate, ActivityLogResponse

router = APIRouter(prefix="/activities", tags=["Activities"])

@router.get("/workspace/{workspace_id}", response_model=List[ActivityLogResponse])
def list_workspace_activities(
    workspace_id: uuid.UUID,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activity_repo = ActivityLogRepository(db)
    member_repo = WorkspaceMemberRepository(db)
    activity_service = ActivityLogService(activity_repo, member_repo)
    return activity_service.list_activities_by_workspace(workspace_id, current_user.id, limit)

@router.get("/user/{user_id}", response_model=List[ActivityLogResponse])
def list_user_activities(
    user_id: uuid.UUID,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activity_repo = ActivityLogRepository(db)
    member_repo = WorkspaceMemberRepository(db)
    activity_service = ActivityLogService(activity_repo, member_repo)
    return activity_service.list_activities_by_user(user_id, current_user.id, limit)

@router.post("", response_model=ActivityLogResponse, status_code=status.HTTP_201_CREATED)
def log_activity(
    activity_in: ActivityLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activity_repo = ActivityLogRepository(db)
    member_repo = WorkspaceMemberRepository(db)
    activity_service = ActivityLogService(activity_repo, member_repo)
    return activity_service.log_activity(current_user.id, activity_in)
