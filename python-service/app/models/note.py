import uuid
from sqlalchemy import String, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import BaseModel

class CaseNote(BaseModel):
    __tablename__ = "fastapi_case_notes"
    
    case_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_cases.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_users.id", ondelete="SET NULL"), index=True, nullable=False
    )
    
    case: Mapped["Case"] = relationship(back_populates="notes")
    creator: Mapped["User"] = relationship()
