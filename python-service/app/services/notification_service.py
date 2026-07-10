import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository
from app.repositories.workspace_repository import WorkspaceMemberRepository
from app.schemas.notification import NotificationCreate, NotificationUpdate

class NotificationService:
    def __init__(self, notification_repo: NotificationRepository, member_repo: WorkspaceMemberRepository):
        self.notification_repo = notification_repo
        self.member_repo = member_repo

    def _check_access(self, workspace_id: Optional[uuid.UUID], user_id: uuid.UUID):
        if workspace_id:
            member = self.member_repo.get_member(workspace_id, user_id)
            if not member:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this workspace")
            return member
        return None

    def list_notifications(self, user_id: uuid.UUID, limit: int = 100) -> List[Notification]:
        return self.notification_repo.get_by_user(user_id, limit)

    def list_unread_notifications(self, user_id: uuid.UUID) -> List[Notification]:
        return self.notification_repo.get_unread_by_user(user_id)

    def create_notification(self, data: NotificationCreate) -> Notification:
        notification = Notification(
            user_id=data.user_id,
            title=data.title,
            message=data.message,
            type=data.type,
            read=data.read,
            workspace_id=data.workspace_id
        )
        self.notification_repo.create(notification)
        self.notification_repo.commit()
        self.notification_repo.refresh(notification)
        return notification

    def mark_as_read(self, notification_id: uuid.UUID, user_id: uuid.UUID) -> Notification:
        notification = self.notification_repo.get(notification_id)
        if not notification or notification.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        if notification.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
        
        self.notification_repo.update(notification, {"read": True})
        self.notification_repo.commit()
        self.notification_repo.refresh(notification)
        return notification

    def mark_all_as_read(self, user_id: uuid.UUID) -> None:
        unreads = self.notification_repo.get_unread_by_user(user_id)
        for notif in unreads:
            self.notification_repo.update(notif, {"read": True})
        self.notification_repo.commit()

    def delete_notification(self, notification_id: uuid.UUID, user_id: uuid.UUID) -> None:
        notification = self.notification_repo.get(notification_id)
        if not notification or notification.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        if notification.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
        
        notification.is_deleted = True
        self.notification_repo.commit()
