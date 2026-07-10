import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class CaseBase(BaseModel):
    case_number: str
    title: str
    case_type: str
    court: str
    judge: Optional[str] = None
    status: str = "active"
    priority: str = "medium"
    filing_date: Optional[datetime] = None
    hearing_date: Optional[datetime] = None
    description: Optional[str] = None

class CaseCreate(CaseBase):
    client_id: uuid.UUID

class CaseUpdate(BaseModel):
    case_number: Optional[str] = None
    title: Optional[str] = None
    case_type: Optional[str] = None
    court: Optional[str] = None
    judge: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    filing_date: Optional[datetime] = None
    hearing_date: Optional[datetime] = None
    description: Optional[str] = None
    client_id: Optional[uuid.UUID] = None

class CaseResponse(CaseBase):
    id: uuid.UUID
    client_id: uuid.UUID
    workspace_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class TimelineEventCreate(BaseModel):
    title: str
    description: str
    date: datetime
    type: str  # filing, hearing, draft, order, appeal, milestone

class LinkDraftRequest(BaseModel):
    draft_id: uuid.UUID

class LinkDocumentRequest(BaseModel):
    document_id: uuid.UUID
