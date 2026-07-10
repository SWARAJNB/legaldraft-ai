import uuid
from typing import Optional
from sqlalchemy import String, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import BaseModel

class Draft(BaseModel):
    __tablename__ = "fastapi_drafts"
    
    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_workspaces.id", ondelete="CASCADE"), index=True, nullable=False
    )
    case_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("fastapi_cases.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("fastapi_users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    workspace: Mapped["Workspace"] = relationship()
    case: Mapped[Optional["Case"]] = relationship(back_populates="drafts")
