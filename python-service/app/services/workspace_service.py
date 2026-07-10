from datetime import datetime, timedelta, timezone
import uuid
from fastapi import HTTPException, status
from app.models.workspace import Organization, Workspace, WorkspaceMember, WorkspaceInvitation
from app.repositories.workspace_repository import (
    OrganizationRepository,
    WorkspaceRepository,
    WorkspaceMemberRepository,
    WorkspaceInvitationRepository
)
from app.schemas.workspace import WorkspaceProvision, InvitationCreate

class WorkspaceService:
    def __init__(
        self,
        org_repo: OrganizationRepository,
        workspace_repo: WorkspaceRepository,
        member_repo: WorkspaceMemberRepository,
        invite_repo: WorkspaceInvitationRepository
    ):
        self.org_repo = org_repo
        self.workspace_repo = workspace_repo
        self.member_repo = member_repo
        self.invite_repo = invite_repo

    def provision_tenant_workspace(self, user_id: uuid.UUID, data: WorkspaceProvision) -> Workspace:
        """
        Transactional use case: Provision an organization, its default workspace,
        and assign the calling user as the workspace owner.
        """
        # 1. Create Organization
        existing_org = self.org_repo.get_by_slug(data.organization_slug)
        if existing_org:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization slug already exists"
            )
        
        org = Organization(
            name=data.organization_name,
            slug=data.organization_slug
        )
        self.org_repo.create(org)
        self.org_repo.commit()
        self.org_repo.refresh(org)

        # 2. Create Workspace
        existing_ws = self.workspace_repo.get_by_org_and_slug(org.id, data.workspace_slug)
        if existing_ws:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Workspace slug already exists under this organization"
            )
            
        ws = Workspace(
            name=data.workspace_name,
            slug=data.workspace_slug,
            organization_id=org.id,
            owner_id=user_id
        )
        self.workspace_repo.create(ws)
        self.workspace_repo.commit()
        self.workspace_repo.refresh(ws)

        # 3. Enroll Owner
        member = WorkspaceMember(
            workspace_id=ws.id,
            user_id=user_id,
            role="owner"
        )
        self.member_repo.create(member)
        self.member_repo.commit()

        return ws

    def create_invitation(
        self,
        user_id: uuid.UUID,
        workspace_id: uuid.UUID,
        data: InvitationCreate
    ) -> WorkspaceInvitation:
        # Enforce Workspace Isolation & Permissions: only owner or admin can invite
        inviter_member = self.member_repo.get_member(workspace_id, user_id)
        if not inviter_member or inviter_member.role not in ["owner", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only workspace owners or administrators can invite new members."
            )
            
        # 7-day expiration time
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        invitation = WorkspaceInvitation(
            email=data.email,
            workspace_id=workspace_id,
            role=data.role,
            invited_by=user_id,
            expires_at=expires_at
        )
        self.invite_repo.create(invitation)
        self.invite_repo.commit()
        self.invite_repo.refresh(invitation)
        return invitation

    def accept_invitation(self, user_id: uuid.UUID, token: str) -> WorkspaceMember:
        invitation = self.invite_repo.get_by_token(token)
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation token is invalid, expired, or already accepted."
            )
            
        # Check expiration
        if datetime.now(timezone.utc) > invitation.expires_at.replace(tzinfo=timezone.utc):
            invitation.status = "expired"
            self.invite_repo.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invitation token has expired."
            )
            
        # Create membership
        # Check if already a member
        existing_member = self.member_repo.get_member(invitation.workspace_id, user_id)
        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member of this workspace."
            )
            
        member = WorkspaceMember(
            workspace_id=invitation.workspace_id,
            user_id=user_id,
            role=invitation.role
        )
        self.member_repo.create(member)
        
        # Mark invitation as accepted
        invitation.status = "accepted"
        self.invite_repo.commit()
        
        return member

