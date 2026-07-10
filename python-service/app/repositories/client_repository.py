from typing import Optional, List
import uuid
from sqlalchemy import select, or_
from sqlalchemy.orm import Session
from app.models.client import Client
from app.repositories.base import BaseRepository

class ClientRepository(BaseRepository[Client]):
    def __init__(self, db: Session):
        super().__init__(Client, db)

    def get_by_workspace(self, workspace_id: uuid.UUID) -> List[Client]:
        stmt = select(Client).where(Client.workspace_id == workspace_id, Client.is_deleted == False)
        return list(self.db.scalars(stmt).all())

    def search(self, workspace_id: uuid.UUID, query: str) -> List[Client]:
        stmt = select(Client).where(
            Client.workspace_id == workspace_id,
            Client.is_deleted == False,
            or_(
                Client.full_name.ilike(f"%{query}%"),
                Client.email.ilike(f"%{query}%"),
                Client.mobile_number.ilike(f"%{query}%"),
                Client.company.ilike(f"%{query}%"),
            )
        )
        return list(self.db.scalars(stmt).all())

    def get_recent(self, workspace_id: uuid.UUID, limit: int = 5) -> List[Client]:
        stmt = (
            select(Client)
            .where(Client.workspace_id == workspace_id, Client.is_deleted == False)
            .order_by(Client.created_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())
