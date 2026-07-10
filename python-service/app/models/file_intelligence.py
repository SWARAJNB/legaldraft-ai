import uuid
from typing import Optional
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import BaseModel

class FileIntelligence(BaseModel):
    __tablename__ = "file_intelligence"
    
    file_id: Mapped[uuid.UUID] = mapped_column(
        index=True, nullable=False
    )
    workspace_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    client_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    case_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    conversation_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    classification: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    document_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    parties: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    important_dates: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    clause_headings: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    short_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    detailed_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    keywords: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tags: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    extracted_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
