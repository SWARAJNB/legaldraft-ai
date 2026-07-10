from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt as pyjwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.database import SessionLocal
from app.repositories.user_repository import UserRepository
from app.schemas.auth import TokenPayload
from app.models.auth import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = pyjwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        email: str = payload.get("email") or payload.get("sub")
        if email is None:
            raise credentials_exception
        token_payload = TokenPayload(sub=email)
    except Exception:
        raise credentials_exception
        
    user_repo = UserRepository(db)
    user = user_repo.get_by_email(token_payload.sub)
    if user is None:
        # Check if the user exists in NestJS users table
        from sqlalchemy import text
        try:
            query = text("SELECT id, email, password_hash, full_name, role FROM users WHERE email = :email")
            res = db.execute(query, {"email": token_payload.sub}).fetchone()
            if res:
                # Auto-provision user in fastapi_users
                name_parts = res.full_name.split(" ", 1)
                first_name = name_parts[0]
                last_name = name_parts[1] if len(name_parts) > 1 else ""
                
                # Check if UUID is string or uuid.UUID object
                import uuid
                u_id = uuid.UUID(str(res.id)) if isinstance(res.id, str) else res.id
                
                user = User(
                    id=u_id,
                    email=res.email,
                    hashed_password=res.password_hash,
                    first_name=first_name,
                    last_name=last_name
                )
                user_repo.create(user)
                user_repo.commit()
                user_repo.refresh(user)
            else:
                raise credentials_exception
        except Exception as e:
            # If query/insert fails, raise 401
            raise credentials_exception
            
    return user

class RoleRequired:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        user_roles = [role.name for role in current_user.roles]
        # Allow if user has any of the allowed roles, or is the owner
        if not any(role in user_roles for role in self.allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User role does not have access to this resource."
            )
        return current_user

class PermissionRequired:
    def __init__(self, allowed_permissions: list[str]):
        self.allowed_permissions = allowed_permissions

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        user_permissions = []
        for role in current_user.roles:
            for perm in role.permissions:
                user_permissions.append(perm.name)
                
        if not any(perm in user_permissions for perm in self.allowed_permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User does not have required permissions to perform this action."
            )
        return current_user

