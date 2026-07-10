import uuid
from typing import Optional
from sqlalchemy import String, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import BaseModel

class Notification(BaseModel):
    __tablename__ = "fastapi_notifications"
    
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(String(1000), nullable=False)
    type: Mapped[str] = mapped_column(String(50), default="info", nullable=False)  # info, warning, success, error
    read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    workspace_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("fastapi_workspaces.id", ondelete="CASCADE"), index=True, nullable=True
    )
    
    user: Mapped["User"] = relationship()
    workspace: Mapped[Optional["Workspace"]] = relationship()
