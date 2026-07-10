"""
══════════════════════════════════════════════════════════════════════════════
 DEPRECATED — Authentication is handled by NestJS.
══════════════════════════════════════════════════════════════════════════════

 This router is NO LONGER registered in main.py.

 NestJS is the single source of truth for authentication.
 Python verifies NestJS JWTs via app.core.security.

 This file is retained for:
   • Backward compatibility
   • Local development testing
   • Reference for the original authentication flow

 To re-enable for local testing, add to main.py:
   from app.api.v1.auth import router as auth_router
   app.include_router(auth_router, prefix="/api/v1")

 See also:
   • app/core/security.py — JWT verification module
   • app/api/deps.py — Authentication dependency (get_current_user)

══════════════════════════════════════════════════════════════════════════════
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.schemas.auth import UserCreate, UserResponse, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user_repo = UserRepository(db)
    auth_service = AuthService(user_repo)
    return auth_service.register_user(user_in)

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user_repo = UserRepository(db)
    auth_service = AuthService(user_repo)
    user = auth_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth_service.create_access_token(
        data={"sub": user.email}
    )
    return {"access_token": access_token, "token_type": "bearer"}
