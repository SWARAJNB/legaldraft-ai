from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Dict, Any, Optional

class FileVersionResponse(BaseModel):
    id: str
    file_id: str
    version_number: int
    s3_key: str
    file_size: int
    uploaded_by: str
    created_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }


class FileResponse(BaseModel):
    id: str
    tenant_id: str
    file_name: str
    original_name: str
    file_type: str
    file_size: int
    s3_key: str
    bucket_name: str
    uploaded_by: str
    created_at: datetime
    versions: List[FileVersionResponse] = []

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }


class PresignedUploadRequest(BaseModel):
    filename: str = Field(..., description="Name of the file to be uploaded")
    category: str = Field(..., description="Folder category (e.g. templates, drafts, exports, profile-images, attachments)")
    expires_in: Optional[int] = Field(3600, description="Pre-signed URL duration validity in seconds")


class PresignedUploadResponse(BaseModel):
    url: str
    fields: Dict[str, Any] = Field(..., description="Form fields for multi-part upload parameters")
