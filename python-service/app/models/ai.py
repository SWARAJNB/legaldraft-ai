import uuid
from typing import List, Optional
from sqlalchemy import String, ForeignKey, Text, Boolean, Integer
from sqlalchemy.dialects.postgresql import ARRAY, FLOAT
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import BaseModel

# RAG ready vector configuration
try:
    from pgvector.sqlalchemy import Vector
    HAS_PGVECTOR = True
except ImportError:
    HAS_PGVECTOR = False

class AIConversation(BaseModel):
    __tablename__ = "fastapi_ai_conversations"
    
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_workspaces.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_users.id", ondelete="CASCADE"), index=True
    )
    
    workspace: Mapped["Workspace"] = relationship()
    user: Mapped["User"] = relationship()
    messages: Mapped[List["AIMessage"]] = relationship(
        back_populates="conversation", cascade="all, delete-orphan"
    )

class AIMessage(BaseModel):
    __tablename__ = "fastapi_ai_messages"
    
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_ai_conversations.id", ondelete="CASCADE"), index=True
    )
    role: Mapped[str] = mapped_column(String(50))  # e.g., "user", "assistant", "system"
    content: Mapped[str] = mapped_column(Text)
    
    # Streaming ready: track if message chunks are finished processing
    is_streaming_finished: Mapped[bool] = mapped_column(Boolean, default=True)
    token_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    conversation: Mapped[AIConversation] = relationship(back_populates="messages")

class AIMemory(BaseModel):
    __tablename__ = "fastapi_ai_memories"
    
    key: Mapped[str] = mapped_column(String(255), index=True)
    value: Mapped[str] = mapped_column(Text)
    workspace_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("fastapi_workspaces.id", ondelete="CASCADE"), nullable=True, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_users.id", ondelete="CASCADE"), index=True
    )
    
    workspace: Mapped[Optional["Workspace"]] = relationship()
    user: Mapped["User"] = relationship()

class Embedding(BaseModel):
    __tablename__ = "fastapi_embeddings"
    
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fastapi_workspaces.id", ondelete="CASCADE"), index=True
    )
    chunk_content: Mapped[str] = mapped_column(Text)
    
    # Use Vector type if pgvector is installed, otherwise float array
    if HAS_PGVECTOR:
        embedding: Mapped[list] = mapped_column(Vector(768), nullable=False)
    else:
        embedding: Mapped[List[float]] = mapped_column(ARRAY(FLOAT), nullable=False)
        
    source_file_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("fastapi_files.id", ondelete="SET NULL"), nullable=True, index=True
    )
    source_version_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("fastapi_file_versions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    workspace: Mapped["Workspace"] = relationship()
    source_file: Mapped[Optional["File"]] = relationship()
