import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.auth import User
from app.repositories.workspace_repository import WorkspaceMemberRepository
from app.repositories.client_repository import ClientRepository
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.get("", response_model=List[ClientResponse])
def list_clients(
    workspace_id: uuid.UUID,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    member_repo = WorkspaceMemberRepository(db)
    member = member_repo.get_member(workspace_id, current_user.id)
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this workspace")
    
    client_repo = ClientRepository(db)
    if search:
        return client_repo.search(workspace_id, search)
    return client_repo.get_by_workspace(workspace_id)

@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    workspace_id: uuid.UUID,
    client_in: ClientCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    member_repo = WorkspaceMemberRepository(db)
    member = member_repo.get_member(workspace_id, current_user.id)
    if not member or member.role not in ["owner", "admin", "member"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied to add clients")
    
    client_repo = ClientRepository(db)
    client = Client(
        full_name=client_in.full_name,
        mobile_number=client_in.mobile_number,
        email=client_in.email,
        address=client_in.address,
        company=client_in.company,
        notes=client_in.notes,
        workspace_id=workspace_id
    )
    client_repo.create(client)
    client_repo.commit()
    client_repo.refresh(client)
    return client

@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    client_repo = ClientRepository(db)
    client = client_repo.get(client_id)
    if not client or client.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    
    member_repo = WorkspaceMemberRepository(db)
    member = member_repo.get_member(client.workspace_id, current_user.id)
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    return client

@router.patch("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: uuid.UUID,
    client_in: ClientUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    client_repo = ClientRepository(db)
    client = client_repo.get(client_id)
    if not client or client.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    
    member_repo = WorkspaceMemberRepository(db)
    member = member_repo.get_member(client.workspace_id, current_user.id)
    if not member or member.role not in ["owner", "admin", "member"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    
    update_data = client_in.model_dump(exclude_unset=True)
    client_repo.update(client, update_data)
    client_repo.commit()
    client_repo.refresh(client)
    return client

@router.delete("/{client_id}", status_code=status.HTTP_200_OK)
def delete_client(
    client_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    client_repo = ClientRepository(db)
    client = client_repo.get(client_id)
    if not client or client.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    
    member_repo = WorkspaceMemberRepository(db)
    member = member_repo.get_member(client.workspace_id, current_user.id)
    if not member or member.role not in ["owner", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owners or admins can delete clients")
    
    # Soft delete
    client.is_deleted = True
    client_repo.commit()
    return {"message": "Client deleted successfully"}
