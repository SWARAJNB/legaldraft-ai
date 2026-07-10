import uuid
from datetime import datetime
from typing import List
from sqlalchemy import String, ForeignKey, UniqueConstraint, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import BaseModel

class Organization(BaseModel):
    __tablename__ = "fastapi_organizations"
    
    name: Mapped[str] = mapped_column(String(255), index=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    
    workspaces: Mapped[List["Workspace"]] = relationship(
        back_populates="organization", cascade="all, delete-orphan"
    )

class Workspace(BaseModel):
    __tablename__ = "fastapi_workspaces"
    
    name: Mapped[str] = mapped_column(String(255), index=True)
    slug: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    owner_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("fastapi_users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_organizations.id", ondelete="CASCADE"), index=True
    )
    
    organization: Mapped[Organization] = relationship(back_populates="workspaces")
    members: Mapped[List["WorkspaceMember"]] = relationship(
        back_populates="workspace", cascade="all, delete-orphan"
    )
    clients: Mapped[List["Client"]] = relationship(
        back_populates="workspace", cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        UniqueConstraint("organization_id", "slug", name="uq_fastapi_workspace_org_slug"),
    )

class WorkspaceMember(BaseModel):
    __tablename__ = "fastapi_workspace_members"
    
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_workspaces.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_users.id", ondelete="CASCADE"), index=True
    )
    role: Mapped[str] = mapped_column(String(50), default="member") # owner, admin, member
    
    workspace: Mapped[Workspace] = relationship(back_populates="members")
    user: Mapped["User"] = relationship(back_populates="workspace_memberships")
    
    __table_args__ = (
        UniqueConstraint("workspace_id", "user_id", name="uq_fastapi_workspace_member_user"),
    )

class WorkspaceInvitation(BaseModel):
    __tablename__ = "fastapi_workspace_invitations"
    
    email: Mapped[str] = mapped_column(String(255), index=True)
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_workspaces.id", ondelete="CASCADE"), index=True
    )
    role: Mapped[str] = mapped_column(String(50), default="member")
    invited_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_users.id", ondelete="SET NULL"), index=True
    )
    token: Mapped[str] = mapped_column(String(255), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, accepted, expired, revoked
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    
    workspace: Mapped[Workspace] = relationship()
    inviter: Mapped["User"] = relationship()

