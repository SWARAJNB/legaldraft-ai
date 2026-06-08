from sqlalchemy.orm import Session
from app.models import File, FileVersion
from app.storage import get_storage_provider
from fastapi import HTTPException, status

class DeleteService:
    def __init__(self, db: Session):
        self.db = db
        self.storage = get_storage_provider()

    def execute(self, file_id: str, tenant_id: str) -> bool:
        # Fetch file record from DB
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
                detail="Access Denied. You do not have permission to delete this file."
            )

        # Query all versions to clean them up from S3/Local Storage
        versions = self.db.query(FileVersion).filter(FileVersion.file_id == file_id).all()
        for version in versions:
            self.storage.delete_file(version.s3_key)

        # Delete database records (SQLAlchemy cascade deletion will delete child versions)
        self.db.delete(file_record)
        self.db.commit()
        return True
