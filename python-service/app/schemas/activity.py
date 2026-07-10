from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Optional

class ActivityLogBase(BaseModel):
    action: str
    entity_type: str
    entity_id: Optional[uuid.UUID] = None
    details: Optional[str] = None
    workspace_id: Optional[uuid.UUID] = None

class ActivityLogCreate(ActivityLogBase):
    user_id: Optional[uuid.UUID] = None

class ActivityLogResponse(ActivityLogBase):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True
