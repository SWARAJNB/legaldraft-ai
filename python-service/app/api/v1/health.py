from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.api.deps import get_db

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {"status": "healthy", "service": "fastapi-service"}

@router.get("/health/database")
def health_check_database(db: Session = Depends(get_db)):
    try:
        db.execute(select(1))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}"
        )
