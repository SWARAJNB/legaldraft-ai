import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import BaseModel

class TimelineEvent(BaseModel):
    __tablename__ = "fastapi_timeline_events"
    
    case_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_cases.id", ondelete="CASCADE"), index=True, nullable=False
    )
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    event_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    
    case: Mapped["Case"] = relationship(back_populates="timeline_events")
