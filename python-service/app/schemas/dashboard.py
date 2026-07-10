import uuid
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class RecentDraftResponse(BaseModel):
    id: uuid.UUID
    title: str
    updated_at: datetime
    client_name: Optional[str] = None
    case_number: Optional[str] = None

class RecentDocumentResponse(BaseModel):
    id: uuid.UUID
    name: str
    mime_type: str
    created_at: datetime
    case_title: Optional[str] = None

class RecentClientResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    email: Optional[str] = None
    company: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RecentCaseResponse(BaseModel):
    id: uuid.UUID
    case_number: str
    title: str
    status: str
    priority: str
    court: str
    client_name: Optional[str] = None
    hearing_date: Optional[datetime] = None
    created_at: datetime

class DashboardHearingResponse(BaseModel):
    id: uuid.UUID
    case_id: uuid.UUID
    case_title: str
    hearing_date: datetime
    hearing_time: Optional[str] = None
    court_name: Optional[str] = None
    judge_name: Optional[str] = None
    purpose: Optional[str] = None

class DashboardTaskResponse(BaseModel):
    id: uuid.UUID
    case_id: uuid.UUID
    case_title: str
    title: str
    priority: str
    due_date: Optional[datetime] = None
    status: str

class DashboardActivityResponse(BaseModel):
    id: uuid.UUID
    user_name: Optional[str] = None
    action: str
    entity_type: str
    details: Optional[str] = None
    created_at: datetime

class DashboardCaseResponse(BaseModel):
    id: uuid.UUID
    case_number: str
    title: str
    status: str
    priority: str
    court: str
    client_name: Optional[str] = None
    updated_at: datetime

class DashboardStatsResponse(BaseModel):
    active_clients: int
    active_cases: int
    upcoming_hearings: int
    total_drafts: int
    recent_drafts: List[RecentDraftResponse]
    recent_documents: List[RecentDocumentResponse]
    recent_clients: List[RecentClientResponse]
    recent_cases: List[RecentCaseResponse]
    upcoming_hearings_list: List[DashboardHearingResponse] = []
    pending_tasks_list: List[DashboardTaskResponse] = []
    recent_activities_list: List[DashboardActivityResponse] = []
    recently_updated_cases_list: List[DashboardCaseResponse] = []
