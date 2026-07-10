from pydantic import BaseModel
import uuid
from datetime import datetime

class TimelineEventBase(BaseModel):
    event_type: str
    title: str
    description: str
    event_date: datetime

class TimelineEventCreate(TimelineEventBase):
    case_id: uuid.UUID

class TimelineEventResponse(TimelineEventBase):
    id: uuid.UUID
    case_id: uuid.UUID

    class Config:
        from_attributes = True
