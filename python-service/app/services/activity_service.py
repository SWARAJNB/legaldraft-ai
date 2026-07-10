import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from app.models.activity import ActivityLog
from app.repositories.activity_repository import ActivityLogRepository
from app.repositories.workspace_repository import WorkspaceMemberRepository
from app.schemas.activity import ActivityLogCreate

class ActivityLogService:
    def __init__(self, activity_repo: ActivityLogRepository, member_repo: WorkspaceMemberRepository):
        self.activity_repo = activity_repo
        self.member_repo = member_repo

    def _check_access(self, workspace_id: Optional[uuid.UUID], user_id: uuid.UUID):
        if workspace_id:
            member = self.member_repo.get_member(workspace_id, user_id)
            if not member:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this workspace")
            return member
        return None

    def list_activities_by_workspace(self, workspace_id: uuid.UUID, user_id: uuid.UUID, limit: int = 100) -> List[ActivityLog]:
        self._check_access(workspace_id, user_id)
        return self.activity_repo.get_by_workspace(workspace_id, limit)

    def list_activities_by_user(self, target_user_id: uuid.UUID, requesting_user_id: uuid.UUID, limit: int = 100) -> List[ActivityLog]:
        if target_user_id != requesting_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
        return self.activity_repo.get_by_user(target_user_id, limit)

    def log_activity(self, user_id: Optional[uuid.UUID], data: ActivityLogCreate) -> ActivityLog:
        activity = ActivityLog(
            user_id=user_id,
            workspace_id=data.workspace_id,
            action=data.action,
            entity_type=data.entity_type,
            entity_id=data.entity_id,
            details=data.details
        )
        self.activity_repo.create(activity)
        self.activity_repo.commit()
        self.activity_repo.refresh(activity)
        return activity
