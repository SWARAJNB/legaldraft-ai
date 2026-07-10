import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from app.models.client import Client
from app.models.activity import ActivityLog
from app.repositories.client_repository import ClientRepository
from app.repositories.workspace_repository import WorkspaceMemberRepository
from app.schemas.client import ClientCreate, ClientUpdate


class ClientService:
    def __init__(self, client_repo: ClientRepository, member_repo: WorkspaceMemberRepository):
        self.client_repo = client_repo
        self.member_repo = member_repo

    def _check_access(self, workspace_id: uuid.UUID, user_id: uuid.UUID, roles: List[str] = None):
        member = self.member_repo.get_member(workspace_id, user_id)
        if not member:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this workspace")
        if roles and member.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
        return member

    def list_clients(self, workspace_id: uuid.UUID, user_id: uuid.UUID, search: Optional[str] = None) -> List[Client]:
        self._check_access(workspace_id, user_id)
        if search:
            return self.client_repo.search(workspace_id, search)
        return self.client_repo.get_by_workspace(workspace_id)

    def get_client(self, client_id: uuid.UUID, user_id: uuid.UUID) -> Client:
        client = self.client_repo.get(client_id)
        if not client or client.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
        self._check_access(client.workspace_id, user_id)
        return client

    def create_client(self, workspace_id: uuid.UUID, user_id: uuid.UUID, data: ClientCreate) -> Client:
        self._check_access(workspace_id, user_id, ["owner", "admin", "member"])
        client = Client(
            full_name=data.full_name,
            mobile_number=data.mobile_number,
            email=data.email,
            address=data.address,
            company=data.company,
            notes=data.notes,
            workspace_id=workspace_id
        )
        self.client_repo.create(client)
        self.client_repo.commit()
        self.client_repo.refresh(client)

        # Log Activity
        activity = ActivityLog(
            user_id=user_id,
            workspace_id=workspace_id,
            action="create_client",
            entity_type="client",
            entity_id=client.id,
            details=f"Created client '{client.full_name}'"
        )
        self.client_repo.db.add(activity)
        self.client_repo.db.commit()

        return client

    def update_client(self, client_id: uuid.UUID, user_id: uuid.UUID, data: ClientUpdate) -> Client:
        client = self.client_repo.get(client_id)
        if not client or client.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
        self._check_access(client.workspace_id, user_id, ["owner", "admin", "member"])
        update_data = data.model_dump(exclude_unset=True)
        self.client_repo.update(client, update_data)
        self.client_repo.commit()
        self.client_repo.refresh(client)
        return client

    def delete_client(self, client_id: uuid.UUID, user_id: uuid.UUID) -> None:
        client = self.client_repo.get(client_id)
        if not client or client.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
        self._check_access(client.workspace_id, user_id, ["owner", "admin"])
        client.is_deleted = True
        self.client_repo.commit()
