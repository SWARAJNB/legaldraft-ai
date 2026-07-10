import uuid
from typing import List
from sqlalchemy import String, ForeignKey, Table, Column, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import BaseModel, Base

# Association table for Many-to-Many between Role and Permission
role_permissions = Table(
    "fastapi_role_permissions",
    Base.metadata,
    Column("role_id", ForeignKey("fastapi_roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", ForeignKey("fastapi_permissions.id", ondelete="CASCADE"), primary_key=True),
)

class UserRole(BaseModel):
    __tablename__ = "fastapi_user_roles"
    
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("fastapi_users.id", ondelete="CASCADE"), index=True)
    role_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("fastapi_roles.id", ondelete="CASCADE"), index=True)
    
    __table_args__ = (
        Index("idx_fastapi_user_role_unique", "user_id", "role_id", unique=True),
    )

class Permission(BaseModel):
    __tablename__ = "fastapi_permissions"
    
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(String(255))
    
    roles: Mapped[List["Role"]] = relationship(
        secondary=role_permissions, back_populates="permissions"
    )

class Role(BaseModel):
    __tablename__ = "fastapi_roles"
    
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(String(255))
    
    permissions: Mapped[List[Permission]] = relationship(
        secondary=role_permissions, back_populates="roles"
    )
    users: Mapped[List["User"]] = relationship(
        secondary="fastapi_user_roles", back_populates="roles"
    )

class User(BaseModel):
    __tablename__ = "fastapi_users"
    
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    first_name: Mapped[str | None] = mapped_column(String(100))
    last_name: Mapped[str | None] = mapped_column(String(100))
    
    roles: Mapped[List[Role]] = relationship(
        secondary="fastapi_user_roles", back_populates="users"
    )
    workspace_memberships: Mapped[List["WorkspaceMember"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
