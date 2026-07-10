import uuid
from typing import List, Optional
from sqlalchemy import String, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import BaseModel

class Folder(BaseModel):
    __tablename__ = "fastapi_folders"
    
    name: Mapped[str] = mapped_column(String(255), index=True)
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_workspaces.id", ondelete="CASCADE"), index=True
    )
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("fastapi_folders.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    workspace: Mapped["Workspace"] = relationship()
    parent: Mapped[Optional["Folder"]] = relationship(
        remote_side="Folder.id", back_populates="subfolders"
    )
    subfolders: Mapped[List["Folder"]] = relationship(
        back_populates="parent", cascade="all, delete-orphan"
    )
    files: Mapped[List["File"]] = relationship(
        back_populates="folder", cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        UniqueConstraint("workspace_id", "parent_id", "name", name="uq_fastapi_folder_workspace_parent_name"),
    )

class File(BaseModel):
    __tablename__ = "fastapi_files"
    
    name: Mapped[str] = mapped_column(String(255), index=True)
    mime_type: Mapped[str] = mapped_column(String(100), index=True)
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_workspaces.id", ondelete="CASCADE"), index=True
    )
    folder_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("fastapi_folders.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_users.id", ondelete="SET NULL"), index=True
    )
    case_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("fastapi_cases.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    workspace: Mapped["Workspace"] = relationship()
    folder: Mapped[Optional[Folder]] = relationship(back_populates="files")
    owner: Mapped["User"] = relationship()
    case: Mapped[Optional["Case"]] = relationship(back_populates="files")
    versions: Mapped[List["FileVersion"]] = relationship(
        back_populates="file", cascade="all, delete-orphan"
    )

class FileVersion(BaseModel):
    __tablename__ = "fastapi_file_versions"
    
    file_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_files.id", ondelete="CASCADE"), index=True
    )
    version_number: Mapped[int] = mapped_column(Integer, default=1)
    storage_provider: Mapped[str] = mapped_column(String(50))  # e.g., "s3", "local"
    storage_path: Mapped[str] = mapped_column(String(1024))      # path/key to object
    storage_bucket: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    file_size: Mapped[int] = mapped_column(Integer)
    checksum: Mapped[Optional[str]] = mapped_column(String(255), nullable=True) # MD5 or SHA256 hash
    created_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_users.id", ondelete="SET NULL"), index=True
    )
    
    file: Mapped[File] = relationship(back_populates="versions")
    creator: Mapped["User"] = relationship()
    
    __table_args__ = (
        UniqueConstraint("file_id", "version_number", name="uq_fastapi_file_version_number"),
    )
