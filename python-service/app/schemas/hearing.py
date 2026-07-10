from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Optional

class HearingBase(BaseModel):
    hearing_date: datetime
    hearing_time: Optional[str] = None
    court_name: Optional[str] = None
    court_hall: Optional[str] = None
    judge_name: Optional[str] = None
    purpose: Optional[str] = None
    notes: Optional[str] = None
    outcome: Optional[str] = None
    next_hearing_date: Optional[datetime] = None

class HearingCreate(HearingBase):
    case_id: uuid.UUID

class HearingUpdate(BaseModel):
    hearing_date: Optional[datetime] = None
    hearing_time: Optional[str] = None
    court_name: Optional[str] = None
    court_hall: Optional[str] = None
    judge_name: Optional[str] = None
    purpose: Optional[str] = None
    notes: Optional[str] = None
    outcome: Optional[str] = None
    next_hearing_date: Optional[datetime] = None

class HearingResponse(HearingBase):
    id: uuid.UUID
    case_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
