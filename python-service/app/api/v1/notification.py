import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.auth import User
from app.repositories.notification_repository import NotificationRepository
from app.repositories.workspace_repository import WorkspaceMemberRepository
from app.services.notification_service import NotificationService
from app.schemas.notification import NotificationCreate, NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def list_notifications(
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif_repo = NotificationRepository(db)
    member_repo = WorkspaceMemberRepository(db)
    notif_service = NotificationService(notif_repo, member_repo)
    return notif_service.list_notifications(current_user.id, limit)

@router.get("/unread", response_model=List[NotificationResponse])
def list_unread_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif_repo = NotificationRepository(db)
    member_repo = WorkspaceMemberRepository(db)
    notif_service = NotificationService(notif_repo, member_repo)
    return notif_service.list_unread_notifications(current_user.id)

@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    notification_in: NotificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif_repo = NotificationRepository(db)
    member_repo = WorkspaceMemberRepository(db)
    notif_service = NotificationService(notif_repo, member_repo)
    return notif_service.create_notification(notification_in)

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif_repo = NotificationRepository(db)
    member_repo = WorkspaceMemberRepository(db)
    notif_service = NotificationService(notif_repo, member_repo)
    return notif_service.mark_as_read(notification_id, current_user.id)

@router.post("/read-all", status_code=status.HTTP_200_OK)
def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif_repo = NotificationRepository(db)
    member_repo = WorkspaceMemberRepository(db)
    notif_service = NotificationService(notif_repo, member_repo)
    notif_service.mark_all_as_read(current_user.id)
    return {"message": "All notifications marked as read"}

@router.delete("/{notification_id}", status_code=status.HTTP_200_OK)
def delete_notification(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif_repo = NotificationRepository(db)
    member_repo = WorkspaceMemberRepository(db)
    notif_service = NotificationService(notif_repo, member_repo)
    notif_service.delete_notification(notification_id, current_user.id)
    return {"message": "Notification deleted successfully"}
