import os
from sqlalchemy.orm import Session
from app.models import File, FileVersion
from app.storage import get_storage_provider
from fastapi import HTTPException, status

MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB

# Allowed categories and their matching formats
ALLOWED_CATEGORIES = {
    "templates": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"], # DOCX only
    "drafts": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"], # DOCX or Text
    "exports": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/pdf"], # DOCX or PDF
    "profile-images": ["image/jpeg", "image/png", "image/gif"], # Images
    "attachments": ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"] # Mixed attachments
}

class UploadService:
    def __init__(self, db: Session):
        self.db = db
        self.storage = get_storage_provider()

    def validate_file(self, original_name: str, content_type: str, file_size: int, category: str):
        # 1. Enforce size limit
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds maximum allowed limit of 15MB. Provided: {file_size / (1024*1024):.2f}MB"
            )

        # 2. Enforce category correctness
        if category not in ALLOWED_CATEGORIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file category '{category}'. Must be one of: {list(ALLOWED_CATEGORIES.keys())}"
            )

        # 3. Enforce extension validations
        allowed_types = ALLOWED_CATEGORIES[category]
        if content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File format '{content_type}' is not permitted for category '{category}'."
            )

    def execute(self, tenant_id: str, category: str, filename: str, content: bytes, content_type: str, uploaded_by: str) -> File:
        file_size = len(content)
        self.validate_file(filename, content_type, file_size, category)

        # Check if file already exists in database for this tenant and category
        existing_file = self.db.query(File).filter(
            File.tenant_id == tenant_id,
            File.file_name == filename,
            File.file_type == content_type
        ).first()

        # Upload file using configured storage provider
        s3_key = self.storage.upload_file(
            tenant_id=tenant_id,
            category=category,
            filename=filename,
            content=content
        )

        if existing_file:
            # File exists -> Create a new version
            # Calculate next version number
            last_version = self.db.query(FileVersion).filter(
                FileVersion.file_id == existing_file.id
            ).order_by(FileVersion.version_number.desc()).first()
            
            next_version_num = (last_version.version_number + 1) if last_version else 2

            # Update parent metadata
            existing_file.file_size = file_size
            existing_file.s3_key = s3_key
            existing_file.uploaded_by = uploaded_by

            # Create file version record
            file_version = FileVersion(
                file_id=existing_file.id,
                version_number=next_version_num,
                s3_key=s3_key,
                file_size=file_size,
                uploaded_by=uploaded_by
            )
            self.db.add(file_version)
            self.db.commit()
            self.db.refresh(existing_file)
            return existing_file
        else:
            # File does not exist -> Create File and initial FileVersion (v1)
            new_file = File(
                tenant_id=tenant_id,
                file_name=filename,
                original_name=filename,
                file_type=content_type,
                file_size=file_size,
                s3_key=s3_key,
                bucket_name=getattr(self.storage, "bucket_name", "local-disk"),
                uploaded_by=uploaded_by
            )
            self.db.add(new_file)
            self.db.commit() # commit to generate new_file.id
            self.db.refresh(new_file)

            # Create FileVersion v1
            file_version_v1 = FileVersion(
                file_id=new_file.id,
                version_number=1,
                s3_key=s3_key,
                file_size=file_size,
                uploaded_by=uploaded_by
            )
            self.db.add(file_version_v1)
            self.db.commit()
            self.db.refresh(new_file)
            return new_file
