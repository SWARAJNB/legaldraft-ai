import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import BaseModel

class Task(BaseModel):
    __tablename__ = "fastapi_tasks"
    
    case_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_cases.id", ondelete="CASCADE"), index=True, nullable=False
    )
    assigned_to: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("fastapi_users.id", ondelete="SET NULL"), index=True, nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(50), default="medium", nullable=False)  # high, medium, low
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)  # pending, in_progress, completed
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    case: Mapped["Case"] = relationship(back_populates="tasks")
    assignee: Mapped[Optional["User"]] = relationship()
