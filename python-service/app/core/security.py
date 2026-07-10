"""
══════════════════════════════════════════════════════════════════════════════
 LegalDraft AI — Unified Authentication Module
══════════════════════════════════════════════════════════════════════════════

 Single authentication module for the Python microservice.

 NestJS is the ONLY authentication provider.
 This module ONLY verifies JWTs issued by NestJS.
 Python NEVER creates authentication tokens.

 NestJS JWT Payload:
   {
     "sub": "<user-uuid>",
     "email": "<user-email>",
     "role": "<user-role>",
     "iat": <issued-at>,
     "exp": <expiration>
   }

 Usage:
   from app.core.security import verify_token, get_current_user_from_token, CurrentUser

══════════════════════════════════════════════════════════════════════════════
"""

import uuid
import logging
from dataclasses import dataclass, field
from typing import Optional

import jwt as pyjwt
from fastapi import HTTPException, status

from app.core.config import settings

logger = logging.getLogger("app.security")


# ── CurrentUser Dataclass ──────────────────────────────────────────────────


@dataclass
class CurrentUser:
    """Lightweight user object built from NestJS JWT claims.

    Authentication does NOT depend on database lookups.
    All fields are populated from the JWT payload.

    Business endpoints that need additional data (workspace membership,
    tenant membership, profile data) should perform those lookups
    AFTER authentication succeeds.

    Future-ready: when NestJS adds tenant_id, workspace_id, permissions,
    or organization_id to the JWT payload, this dataclass will automatically
    pick them up — zero changes in business controllers.
    """

    # ── Required fields (always present in NestJS JWT) ──
    id: uuid.UUID
    email: str
    full_name: str
    role: str
    is_active: bool = True

    # ── Future-ready fields (populated from JWT when available) ──
    tenant_id: Optional[str] = None
    workspace_id: Optional[str] = None
    permissions: list[str] = field(default_factory=list)
    organization_id: Optional[str] = None


# ── JWT Verification ───────────────────────────────────────────────────────


def verify_token(token: str) -> dict:
    """Verify and decode a NestJS JWT token.

    Validates:
      ✓ Signature (using shared secret + algorithm)
      ✓ Expiration (exp claim)
      ✓ Issuer (if JWT_ISSUER is configured — future-ready)
      ✓ Audience (if JWT_AUDIENCE is configured — future-ready)

    Args:
        token: Raw JWT string from the Authorization header.

    Returns:
        Decoded JWT payload as a dict.

    Raises:
        HTTPException(401) on any verification failure.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Build decode options
        decode_options: dict = {}
        decode_kwargs: dict = {
            "algorithms": [settings.JWT_ALGORITHM],
        }

        # Issuer validation (future-ready: only enforced if configured)
        if settings.JWT_ISSUER:
            decode_kwargs["issuer"] = settings.JWT_ISSUER

        # Audience validation (future-ready: only enforced if configured)
        if settings.JWT_AUDIENCE:
            decode_kwargs["audience"] = settings.JWT_AUDIENCE
        else:
            # Don't verify audience when not configured
            decode_options["verify_aud"] = False

        payload = pyjwt.decode(
            token,
            settings.JWT_SECRET,
            options=decode_options,
            **decode_kwargs,
        )

        return payload

    except pyjwt.ExpiredSignatureError:
        logger.warning("JWT token has expired")
        raise credentials_exception
    except pyjwt.InvalidIssuerError:
        logger.warning("JWT issuer validation failed")
        raise credentials_exception
    except pyjwt.InvalidAudienceError:
        logger.warning("JWT audience validation failed")
        raise credentials_exception
    except pyjwt.InvalidTokenError as e:
        logger.warning(f"JWT verification failed: {e}")
        raise credentials_exception
    except Exception as e:
        logger.error(f"Unexpected error during JWT verification: {e}")
        raise credentials_exception


# ── CurrentUser Extraction ─────────────────────────────────────────────────


def get_current_user_from_token(token: str) -> CurrentUser:
    """Verify JWT and build CurrentUser from claims.

    Flow:
        1. Verify JWT signature and expiration via verify_token()
        2. Extract required claims (sub, email, role)
        3. Extract optional/future claims (tenant_id, workspace_id, etc.)
        4. Build and return CurrentUser dataclass

    No database lookup is performed.
    Authentication and business logic remain separate.

    Args:
        token: Raw JWT string from the Authorization header.

    Returns:
        CurrentUser dataclass populated from JWT claims.

    Raises:
        HTTPException(401) if JWT is invalid or missing required claims.
    """
    payload = verify_token(token)

    # ── Extract required claims ──
    user_id_str = payload.get("sub")
    email = payload.get("email")
    role = payload.get("role", "lawyer")

    if not user_id_str or not email:
        logger.warning("JWT missing required claims (sub or email)")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── Parse UUID ──
    try:
        user_id = uuid.UUID(str(user_id_str))
    except (ValueError, AttributeError):
        logger.warning(f"Invalid UUID in JWT sub claim: {user_id_str}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── Build full_name ──
    # Use JWT claim if present, otherwise derive from email
    full_name = (
        payload.get("full_name")
        or email.split("@")[0].replace(".", " ").replace("_", " ").title()
    )

    # ── Build and return CurrentUser ──
    return CurrentUser(
        id=user_id,
        email=email,
        full_name=full_name,
        role=role,
        is_active=True,
        # Future-ready: populated from JWT when NestJS adds these claims
        tenant_id=payload.get("tenant_id"),
        workspace_id=payload.get("workspace_id"),
        permissions=payload.get("permissions", []),
        organization_id=payload.get("organization_id"),
    )
