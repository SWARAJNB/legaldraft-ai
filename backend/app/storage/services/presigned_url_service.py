from sqlalchemy.orm import Session
from app.models import File
from app.storage import get_storage_provider
from fastapi import HTTPException, status
from typing import Dict, Any

class PresignedUrlService:
    def __init__(self, db: Session):
        self.db = db
        self.storage = get_storage_provider()

    def get_download_url(self, file_id: str, tenant_id: str, expires_in: int = 3600) -> str:
        # Retrieve parent metadata
        file_record = self.db.query(File).filter(File.id == file_id).first()
        if not file_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File with ID '{file_id}' not found."
            )

        # Enforce Tenant Isolation Security
        if file_record.tenant_id != tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied. You do not have permission to generate download URLs for other tenants."
            )

        return self.storage.get_presigned_download_url(file_record.s3_key, expires_in)

    def get_upload_url(self, tenant_id: str, category: str, filename: str, expires_in: int = 3600) -> Dict[str, Any]:
        # Validate category parameter
        from app.storage.services.upload_service import ALLOWED_CATEGORIES
        if category not in ALLOWED_CATEGORIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file category '{category}'. Must be one of: {list(ALLOWED_CATEGORIES.keys())}"
            )

        return self.storage.get_presigned_upload_url(tenant_id, category, filename, expires_in)
