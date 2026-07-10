import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.auth import User
from app.repositories.workspace_repository import (
    OrganizationRepository,
    WorkspaceRepository,
    WorkspaceMemberRepository,
    WorkspaceInvitationRepository
)
from app.services.workspace_service import WorkspaceService
from app.schemas.workspace import (
    WorkspaceProvision,
    WorkspaceResponse,
    InvitationCreate,
    InvitationResponse,
    InvitationAccept
)

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])

@router.post("/provision", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
def provision_workspace(
    data: WorkspaceProvision,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    org_repo = OrganizationRepository(db)
    ws_repo = WorkspaceRepository(db)
    member_repo = WorkspaceMemberRepository(db)
    invite_repo = WorkspaceInvitationRepository(db)
    
    workspace_service = WorkspaceService(org_repo, ws_repo, member_repo, invite_repo)
    return workspace_service.provision_tenant_workspace(current_user.id, data)

@router.post("/{workspace_id}/invitations", response_model=InvitationResponse, status_code=status.HTTP_201_CREATED)
def invite_user(
    workspace_id: uuid.UUID,
    data: InvitationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    org_repo = OrganizationRepository(db)
    ws_repo = WorkspaceRepository(db)
    member_repo = WorkspaceMemberRepository(db)
    invite_repo = WorkspaceInvitationRepository(db)
    
    workspace_service = WorkspaceService(org_repo, ws_repo, member_repo, invite_repo)
    return workspace_service.create_invitation(current_user.id, workspace_id, data)

@router.post("/invitations/accept", status_code=status.HTTP_200_OK)
def accept_invite(
    data: InvitationAccept,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    org_repo = OrganizationRepository(db)
    ws_repo = WorkspaceRepository(db)
    member_repo = WorkspaceMemberRepository(db)
    invite_repo = WorkspaceInvitationRepository(db)
    
    workspace_service = WorkspaceService(org_repo, ws_repo, member_repo, invite_repo)
    workspace_service.accept_invitation(current_user.id, data.token)
    return {"message": "Invitation accepted successfully and workspace membership created."}

@router.get("", response_model=List[WorkspaceResponse])
def list_user_workspaces(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.models.workspace import WorkspaceMember, Workspace
    from sqlalchemy import select
    stmt = select(Workspace).join(WorkspaceMember).where(
        WorkspaceMember.user_id == current_user.id,
        Workspace.is_deleted == False
    )
    return list(db.scalars(stmt).all())

@router.get("/{workspace_id}", response_model=WorkspaceResponse)
def get_workspace_details(
    workspace_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    member_repo = WorkspaceMemberRepository(db)
    member = member_repo.get_member(workspace_id, current_user.id)
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    ws_repo = WorkspaceRepository(db)
    ws = ws_repo.get(workspace_id)
    if not ws or ws.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
    return ws

@router.patch("/{workspace_id}", response_model=WorkspaceResponse)
def update_workspace(
    workspace_id: uuid.UUID,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    member_repo = WorkspaceMemberRepository(db)
    member = member_repo.get_member(workspace_id, current_user.id)
    if not member or member.role not in ["owner", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
        
    ws_repo = WorkspaceRepository(db)
    ws = ws_repo.get(workspace_id)
    if not ws or ws.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
        
    if "name" in data:
        ws.name = data["name"]
    if "description" in data:
        ws.description = data["description"]
    ws_repo.commit()
    ws_repo.refresh(ws)
    return ws


