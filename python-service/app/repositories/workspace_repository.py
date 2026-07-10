from typing import Optional, List
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.workspace import Organization, Workspace, WorkspaceMember, WorkspaceInvitation
from app.repositories.base import BaseRepository

class OrganizationRepository(BaseRepository[Organization]):
    def __init__(self, db: Session):
        super().__init__(Organization, db)

    def get_by_slug(self, slug: str) -> Optional[Organization]:
        stmt = select(Organization).where(Organization.slug == slug)
        return self.db.scalars(stmt).first()

class WorkspaceRepository(BaseRepository[Workspace]):
    def __init__(self, db: Session):
        super().__init__(Workspace, db)

    def get_by_org_and_slug(self, organization_id: uuid.UUID, slug: str) -> Optional[Workspace]:
        stmt = select(Workspace).where(
            Workspace.organization_id == organization_id,
            Workspace.slug == slug
        )
        return self.db.scalars(stmt).first()

    def get_by_organization(self, organization_id: uuid.UUID) -> List[Workspace]:
        stmt = select(Workspace).where(Workspace.organization_id == organization_id)
        return list(self.db.scalars(stmt).all())

class WorkspaceMemberRepository(BaseRepository[WorkspaceMember]):
    def __init__(self, db: Session):
        super().__init__(WorkspaceMember, db)

    def get_member(self, workspace_id: uuid.UUID, user_id: uuid.UUID) -> Optional[WorkspaceMember]:
        stmt = select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == user_id
        )
        return self.db.scalars(stmt).first()

class WorkspaceInvitationRepository(BaseRepository[WorkspaceInvitation]):
    def __init__(self, db: Session):
        super().__init__(WorkspaceInvitation, db)

    def get_by_token(self, token: str) -> Optional[WorkspaceInvitation]:
        stmt = select(WorkspaceInvitation).where(
            WorkspaceInvitation.token == token,
            WorkspaceInvitation.status == "pending"
        )
        return self.db.scalars(stmt).first()

