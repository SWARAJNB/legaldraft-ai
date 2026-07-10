import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.auth import User
from app.repositories.task_repository import TaskRepository
from app.repositories.case_repository import CaseRepository
from app.repositories.workspace_repository import WorkspaceMemberRepository
from app.repositories.timeline_repository import TimelineEventRepository
from app.services.task_service import TaskService
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/tasks", tags=["Tasks"])

def get_task_service(db: Session = Depends(get_db)) -> TaskService:
    task_repo = TaskRepository(db)
    case_repo = CaseRepository(db)
    member_repo = WorkspaceMemberRepository(db)
    timeline_repo = TimelineEventRepository(db)
    return TaskService(task_repo, case_repo, member_repo, timeline_repo)

@router.get("/case/{case_id}", response_model=List[TaskResponse])
def list_tasks(
    case_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: TaskService = Depends(get_task_service)
):
    return service.list_tasks(case_id, current_user.id)

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user),
    service: TaskService = Depends(get_task_service)
):
    return service.create_task(current_user.id, task_in)

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: TaskService = Depends(get_task_service)
):
    return service.get_task(task_id, current_user.id)

@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: uuid.UUID,
    task_in: TaskUpdate,
    current_user: User = Depends(get_current_user),
    service: TaskService = Depends(get_task_service)
):
    return service.update_task(task_id, current_user.id, task_in)

@router.delete("/{task_id}", status_code=status.HTTP_200_OK)
def delete_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: TaskService = Depends(get_task_service)
):
    service.delete_task(task_id, current_user.id)
    return {"message": "Task deleted successfully"}
