import uuid
from typing import Optional
from sqlalchemy import Integer, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import BaseModel

class TemplateVersion(BaseModel):
    __tablename__ = "template_versions"
    
    template_id: Mapped[uuid.UUID] = mapped_column(
        index=True, nullable=False
    )
    version_number: Mapped[int] = mapped_column(Integer, default=1)
    file_id: Mapped[Optional[uuid.UUID]] = mapped_column(index=True, nullable=True)
    preview_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    placeholders: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(index=True, nullable=True)
