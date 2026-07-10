from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Optional

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[datetime] = None
    status: str = "pending"
    assigned_to: Optional[uuid.UUID] = None

class TaskCreate(TaskBase):
    case_id: uuid.UUID

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    assigned_to: Optional[uuid.UUID] = None
    completed_at: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: uuid.UUID
    case_id: uuid.UUID
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
