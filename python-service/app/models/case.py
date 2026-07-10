import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import BaseModel

class Case(BaseModel):
    __tablename__ = "fastapi_cases"
    
    case_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    case_type: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    court: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    judge: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active", index=True, nullable=False)
    filing_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    hearing_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    timeline: Mapped[str | None] = mapped_column(Text, default="[]")
    priority: Mapped[str] = mapped_column(String(50), default="medium", index=True, nullable=False)
    
    client_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_clients.id", ondelete="CASCADE"), index=True, nullable=False
    )
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_workspaces.id", ondelete="CASCADE"), index=True, nullable=False
    )
    
    client: Mapped["Client"] = relationship(back_populates="cases")
    workspace: Mapped["Workspace"] = relationship()
    
    files: Mapped[List["File"]] = relationship(
        back_populates="case", cascade="save-update, merge"
    )
    drafts: Mapped[List["Draft"]] = relationship(
        back_populates="case", cascade="all, delete-orphan"
    )
    hearings: Mapped[List["Hearing"]] = relationship(
        back_populates="case", cascade="all, delete-orphan"
    )
    tasks: Mapped[List["Task"]] = relationship(
        back_populates="case", cascade="all, delete-orphan"
    )
    notes: Mapped[List["CaseNote"]] = relationship(
        back_populates="case", cascade="all, delete-orphan"
    )
    timeline_events: Mapped[List["TimelineEvent"]] = relationship(
        back_populates="case", cascade="all, delete-orphan"
    )
