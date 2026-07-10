import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import BaseModel

class Hearing(BaseModel):
    __tablename__ = "fastapi_hearings"
    
    case_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_cases.id", ondelete="CASCADE"), index=True, nullable=False
    )
    hearing_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    hearing_time: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    court_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    court_hall: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    judge_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    purpose: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    outcome: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    next_hearing_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    case: Mapped["Case"] = relationship(back_populates="hearings")
