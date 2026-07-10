import uuid
from datetime import datetime
from typing import List
from fastapi import HTTPException, status
from app.models.task import Task
from app.models.activity import ActivityLog
from app.repositories.task_repository import TaskRepository
from app.repositories.case_repository import CaseRepository
from app.repositories.workspace_repository import WorkspaceMemberRepository
from app.repositories.timeline_repository import TimelineEventRepository
from app.services.timeline_service import TimelineEventService
from app.schemas.task import TaskCreate, TaskUpdate
from app.schemas.timeline import TimelineEventCreate

class TaskService:
    def __init__(self, task_repo: TaskRepository, case_repo: CaseRepository, member_repo: WorkspaceMemberRepository, timeline_repo: TimelineEventRepository):
        self.task_repo = task_repo
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

    def list_tasks(self, case_id: uuid.UUID, user_id: uuid.UUID) -> List[Task]:
        self._check_access(case_id, user_id)
        return self.task_repo.get_by_case(case_id)

    def get_task(self, task_id: uuid.UUID, user_id: uuid.UUID) -> Task:
        task = self.task_repo.get(task_id)
        if not task or task.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        self._check_access(task.case_id, user_id)
        return task

    def create_task(self, user_id: uuid.UUID, data: TaskCreate) -> Task:
        self._check_access(data.case_id, user_id, ["owner", "admin", "member"])
        case = self.case_repo.get(data.case_id)
        
        task = Task(
            case_id=data.case_id,
            assigned_to=data.assigned_to,
            title=data.title,
            description=data.description,
            priority=data.priority,
            due_date=data.due_date,
            status=data.status
        )
        self.task_repo.create(task)
        self.task_repo.commit()
        self.task_repo.refresh(task)

        t_event = TimelineEventCreate(
            case_id=data.case_id,
            event_type="task",
            title="Task Assigned",
            description=f"Task '{data.title}' was assigned with {data.priority} priority.",
            event_date=datetime.utcnow()
        )
        self.timeline_service.add_event(t_event)

        activity = ActivityLog(
            user_id=user_id,
            workspace_id=case.workspace_id,
            action="create_task",
            entity_type="task",
            entity_id=task.id,
            details=f"Assigned task '{data.title}' for case '{case.title}'"
        )
        self.task_repo.db.add(activity)
        self.task_repo.db.commit()

        return task

    def update_task(self, task_id: uuid.UUID, user_id: uuid.UUID, data: TaskUpdate) -> Task:
        task = self.task_repo.get(task_id)
        if not task or task.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        
        self._check_access(task.case_id, user_id, ["owner", "admin", "member"])
        case = self.case_repo.get(task.case_id)

        update_data = data.model_dump(exclude_unset=True)
        
        just_completed = False
        if "status" in update_data and update_data["status"] == "completed" and task.status != "completed":
            update_data["completed_at"] = datetime.utcnow()
            just_completed = True
            
        self.task_repo.update(task, update_data)
        self.task_repo.commit()
        self.task_repo.refresh(task)

        if just_completed:
            t_event = TimelineEventCreate(
                case_id=task.case_id,
                event_type="task",
                title="Task Completed",
                description=f"Task '{task.title}' was marked as completed.",
                event_date=datetime.utcnow()
            )
            self.timeline_service.add_event(t_event)

            activity = ActivityLog(
                user_id=user_id,
                workspace_id=case.workspace_id,
                action="complete_task",
                entity_type="task",
                entity_id=task.id,
                details=f"Completed task '{task.title}' for case '{case.title}'"
            )
            self.task_repo.db.add(activity)
            self.task_repo.db.commit()

        return task

    def delete_task(self, task_id: uuid.UUID, user_id: uuid.UUID) -> None:
        task = self.task_repo.get(task_id)
        if not task or task.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        
        self._check_access(task.case_id, user_id, ["owner", "admin"])
        case = self.case_repo.get(task.case_id)

        task.is_deleted = True
        self.task_repo.commit()

        t_event = TimelineEventCreate(
            case_id=task.case_id,
            event_type="task",
            title="Task Deleted",
            description=f"Task '{task.title}' was deleted.",
            event_date=datetime.utcnow()
        )
        self.timeline_service.add_event(t_event)

        activity = ActivityLog(
            user_id=user_id,
            workspace_id=case.workspace_id,
            action="delete_task",
            entity_type="task",
            entity_id=task.id,
            details=f"Deleted task '{task.title}' for case '{case.title}'"
        )
        self.task_repo.db.add(activity)
        self.task_repo.db.commit()
