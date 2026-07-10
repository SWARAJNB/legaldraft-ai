"""
══════════════════════════════════════════════════════════════════════════════
 LegalDraft AI — API Dependencies
══════════════════════════════════════════════════════════════════════════════

 Authentication is handled by NestJS.
 This module verifies NestJS JWTs using app.core.security.

 Flow:
   Bearer token → security.get_current_user_from_token() → CurrentUser → return

 Authentication does NOT depend on database lookups.
 Business endpoints that need additional data (workspace membership, etc.)
 should perform those lookups AFTER authentication succeeds.

══════════════════════════════════════════════════════════════════════════════
"""

from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import CurrentUser, get_current_user_from_token
from app.database.database import SessionLocal


# ── OAuth2 Scheme ──────────────────────────────────────────────────────────
# Token URL points to NestJS auth endpoint (used for Swagger/OpenAPI docs only).
# Python does NOT handle login — NestJS is the sole authentication provider.

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ── Database Session ───────────────────────────────────────────────────────


def get_db() -> Generator[Session, None, None]:
    """Provide a database session for the request lifecycle."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Authentication Dependency ──────────────────────────────────────────────


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> CurrentUser:
    """Authenticate the request by verifying the NestJS JWT.

    Flow:
        1. Extract Bearer token from Authorization header (via oauth2_scheme)
        2. Verify JWT signature, expiration, and claims (via security.py)
        3. Build CurrentUser from JWT claims
        4. Ensure the user exists in fastapi_users table (sync with NestJS users)
        5. Return CurrentUser

    Business endpoints that need additional data (workspace membership,
    tenant details, etc.) should perform database lookups AFTER this
    dependency succeeds. Keep authentication and business logic separate.
    """
    current_user = get_current_user_from_token(token)

    # Ensure user exists in fastapi_users table to satisfy foreign keys
    from app.models.auth import User
    from sqlalchemy import select

    stmt = select(User).where(User.id == current_user.id)
    db_user = db.scalars(stmt).first()
    if not db_user:
        full_name = current_user.full_name or ""
        name_parts = full_name.split(" ", 1)
        first_name = name_parts[0] if len(name_parts) > 0 else ""
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        db_user = User(
            id=current_user.id,
            email=current_user.email,
            hashed_password="NESTJS_EXTERNAL_USER",
            first_name=first_name,
            last_name=last_name,
            is_active=True,
            is_deleted=False
        )
        db.add(db_user)
        try:
            db.commit()
        except Exception:
            db.rollback()
            # If another concurrent request created the user, ignore the error
            pass

    return current_user


# ── RBAC Dependencies ─────────────────────────────────────────────────────


class RoleRequired:
    """Dependency that checks if the current user has one of the allowed roles.

    Uses CurrentUser.role from JWT claims.
    Does NOT depend on database authentication tables.

    Usage:
        @router.get("/admin-only")
        def admin_endpoint(user: CurrentUser = Depends(RoleRequired(["admin"]))):
            ...
    """

    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = [r.lower() for r in allowed_roles]

    def __call__(self, current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role.lower() not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User role does not have access to this resource.",
            )
        return current_user


class PermissionRequired:
    """Dependency that checks if the current user has required permissions.

    Uses role-based permission mapping from JWT claims.
    Does NOT depend on database authentication tables.

    When NestJS adds explicit permissions to the JWT payload,
    this will automatically use CurrentUser.permissions instead
    of the role-based fallback mapping.

    Role-permission mapping mirrors NestJS RBAC defined in:
    backend/src/auth/rbac/permissions.ts

    Usage:
        @router.get("/cases")
        def list_cases(user: CurrentUser = Depends(PermissionRequired(["case"]))):
            ...
    """

    # Role-to-permission mapping (mirrors NestJS RBAC from permissions.ts)
    ROLE_PERMISSIONS: dict[str, list[str]] = {
        "owner": [
            "workspace", "case", "draft", "template",
            "document", "ai", "export", "settings", "invite",
        ],
        "admin": [
            "workspace", "case", "draft", "template",
            "document", "ai", "export", "settings", "invite",
        ],
        "lawyer": [
            "workspace", "case", "draft", "template",
            "document", "ai", "export",
        ],
        "legal-assistant": [
            "workspace", "case", "draft",
            "document", "ai", "export",
        ],
        "intern": [
            "case", "draft", "document", "ai",
        ],
    }

    def __init__(self, allowed_permissions: list[str]):
        self.allowed_permissions = [p.lower() for p in allowed_permissions]

    def __call__(self, current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        # If JWT includes explicit permissions (future-ready), use those
        if current_user.permissions:
            user_permissions = [p.lower() for p in current_user.permissions]
        else:
            # Fall back to role-based permission mapping
            user_permissions = self.ROLE_PERMISSIONS.get(
                current_user.role.lower(), []
            )

        if not any(perm in user_permissions for perm in self.allowed_permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User does not have required permissions to perform this action.",
            )
        return current_user
