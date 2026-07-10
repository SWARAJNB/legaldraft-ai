from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Optional

class CaseNoteBase(BaseModel):
    title: str
    content: str

class CaseNoteCreate(CaseNoteBase):
    case_id: uuid.UUID

class CaseNoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class CaseNoteResponse(CaseNoteBase):
    id: uuid.UUID
    case_id: uuid.UUID
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
