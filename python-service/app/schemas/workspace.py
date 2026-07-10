import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, EmailStr

class OrganizationBase(BaseModel):
    name: str
    slug: str

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase):
    id: uuid.UUID
    
    model_config = ConfigDict(from_attributes=True)

class WorkspaceBase(BaseModel):
    name: str
    slug: str

class WorkspaceCreate(WorkspaceBase):
    organization_id: uuid.UUID

class WorkspaceResponse(WorkspaceBase):
    id: uuid.UUID
    organization_id: uuid.UUID
    description: Optional[str] = None
    owner_id: Optional[uuid.UUID] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class WorkspaceProvision(BaseModel):
    organization_name: str
    organization_slug: str
    workspace_name: str
    workspace_slug: str

class InvitationCreate(BaseModel):
    email: EmailStr
    role: str = "member"

class InvitationResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    workspace_id: uuid.UUID
    role: str
    invited_by: uuid.UUID
    token: str
    status: str
    expires_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class InvitationAccept(BaseModel):
    token: str

