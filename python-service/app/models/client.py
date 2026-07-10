import uuid
from typing import List
from sqlalchemy import String, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import BaseModel

class Client(BaseModel):
    __tablename__ = "fastapi_clients"
    
    full_name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    mobile_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), index=True, nullable=True)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_workspaces.id", ondelete="CASCADE"), index=True, nullable=False
    )
    
    workspace: Mapped["Workspace"] = relationship(back_populates="clients")
    cases: Mapped[List["Case"]] = relationship(
        back_populates="client", cascade="all, delete-orphan"
    )
