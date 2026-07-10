"""
══════════════════════════════════════════════════════════════════════════════
 DEPRECATED — Authentication is handled by NestJS.
══════════════════════════════════════════════════════════════════════════════

 This service is NO LONGER used in production.

 NestJS is the single source of truth for authentication.
 Python NEVER creates authentication tokens.
 Python only verifies JWTs issued by NestJS via app.core.security.

 This file is retained for:
   • Backward compatibility
   • Local development testing
   • Reference for the original authentication flow

 See also:
   • app/core/security.py — JWT verification module (replaces this service)
   • app/api/deps.py — Authentication dependency (get_current_user)

══════════════════════════════════════════════════════════════════════════════
"""

from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings
from app.models.auth import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=30)
        to_encode.update({"exp": expire})
        # Use pyjwt or jose (we configured pyjwt but jose is standard for fastapi docs, let's use pyjwt since it's in requirements)
        import jwt as pyjwt
        encoded_jwt = pyjwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")
        return encoded_jwt

    def register_user(self, user_in: UserCreate) -> User:
        existing_user = self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        hashed_password = self.get_password_hash(user_in.password)
        db_user = User(
            email=user_in.email,
            hashed_password=hashed_password,
            first_name=user_in.first_name,
            last_name=user_in.last_name
        )
        self.user_repo.create(db_user)
        self.user_repo.commit()
        self.user_repo.refresh(db_user)
        return db_user

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = self.user_repo.get_by_email(email)
        if not user or not self.verify_password(password, user.hashed_password):
            return None
        return user
