from sqlalchemy.orm import Session
from app.models import File
from app.storage import get_storage_provider
from fastapi import HTTPException, status

class DownloadService:
    def __init__(self, db: Session):
        self.db = db
        self.storage = get_storage_provider()

    def execute(self, file_id: str, tenant_id: str) -> tuple[bytes, str]:
        # Fetch file details from metadata DB
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
                detail="Access Denied. You do not have permission to access files from other tenants."
            )

        try:
            # Download file bytes via the storage provider abstraction
            file_bytes = self.storage.download_file(file_record.s3_key)
            return file_bytes, file_record.original_name
        except FileNotFoundError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"The requested file was not found in the storage backend: {str(e)}"
            )
