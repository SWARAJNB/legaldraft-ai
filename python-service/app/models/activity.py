import uuid
from typing import Optional
from sqlalchemy import String, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import BaseModel

class ActivityLog(BaseModel):
    __tablename__ = "fastapi_activity_logs"
    
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("fastapi_users.id", ondelete="SET NULL"), index=True, nullable=True
    )
    workspace_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("fastapi_workspaces.id", ondelete="SET NULL"), index=True, nullable=True
    )
    action: Mapped[str] = mapped_column(String(100), index=True, nullable=False)  # e.g., "create_draft"
    entity_type: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # e.g., "draft"
    entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(index=True, nullable=True)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    user: Mapped[Optional["User"]] = relationship()
    workspace: Mapped[Optional["Workspace"]] = relationship()
