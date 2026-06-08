from fastapi import APIRouter, Depends, Header, UploadFile, File as FastFile, Form, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO
from typing import Optional
from app.database import get_db
from app.schemas import FileResponse as SchemaFileResponse, PresignedUploadRequest, PresignedUploadResponse
from app.storage.services.upload_service import UploadService
from app.storage.services.download_service import DownloadService
from app.storage.services.delete_service import DeleteService
from app.storage.services.presigned_url_service import PresignedUrlService

router = APIRouter(prefix="/files", tags=["Files"])

@router.post("/upload", response_model=SchemaFileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    category: str = Form(..., description="File category (templates, drafts, exports, profile-images, attachments)"),
    file: UploadFile = FastFile(...),
    x_tenant_id: str = Header(..., alias="X-Tenant-ID", description="Active Tenant Identifier"),
    x_user_email: str = Header("anonymous", alias="X-User-Email", description="Email of user performing upload"),
    db: Session = Depends(get_db)
):
    content = await file.read()
    service = UploadService(db)
    return service.execute(
        tenant_id=x_tenant_id,
        category=category,
        filename=file.filename or "unnamed_file",
        content=content,
        content_type=file.content_type or "application/octet-stream",
        uploaded_by=x_user_email
    )

@router.get("/{file_id}")
async def download_file_by_id(
    file_id: str,
    x_tenant_id: str = Header(..., alias="X-Tenant-ID", description="Active Tenant Identifier"),
    db: Session = Depends(get_db)
):
    service = DownloadService(db)
    file_bytes, filename = service.execute(file_id, x_tenant_id)
    
    # Stream the file back to the client as an attachment
    return StreamingResponse(
        BytesIO(file_bytes),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file_by_id(
    file_id: str,
    x_tenant_id: str = Header(..., alias="X-Tenant-ID", description="Active Tenant Identifier"),
    db: Session = Depends(get_db)
):
    service = DeleteService(db)
    service.execute(file_id, x_tenant_id)
    return None

@router.get("/{file_id}/download-url")
async def get_file_download_url(
    file_id: str,
    expires_in: Optional[int] = 3600,
    x_tenant_id: str = Header(..., alias="X-Tenant-ID", description="Active Tenant Identifier"),
    db: Session = Depends(get_db)
):
    service = PresignedUrlService(db)
    url = service.get_download_url(file_id, x_tenant_id, expires_in)
    return {"url": url}

@router.post("/presigned-upload", response_model=PresignedUploadResponse)
async def create_presigned_upload(
    request: PresignedUploadRequest,
    x_tenant_id: str = Header(..., alias="X-Tenant-ID", description="Active Tenant Identifier"),
    db: Session = Depends(get_db)
):
    service = PresignedUrlService(db)
    expires = request.expires_in or 3600
    url_data = service.get_upload_url(
        tenant_id=x_tenant_id,
        category=request.category,
        filename=request.filename,
        expires_in=expires
    )
    return url_data

# Local file upload handler to mimic S3 pre-signed upload URL behaviors locally
@router.post("/upload-local-presigned")
async def upload_local_presigned(
    key: str = Form(..., description="Target relative S3 key"),
    file: UploadFile = FastFile(...),
    db: Session = Depends(get_db)
):
    # Expected key layout: tenants/{tenant_id}/{category}/{filename}
    parts = key.split("/")
    if len(parts) < 4 or parts[0] != "tenants":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Malformed local target key path. Must follow 'tenants/{tenant_id}/{category}/{filename}'"
        )
    
    tenant_id = parts[1]
    category = parts[2]
    filename = parts[3]
    
    content = await file.read()
    service = UploadService(db)
    return service.execute(
        tenant_id=tenant_id,
        category=category,
        filename=filename,
        content=content,
        content_type=file.content_type or "application/octet-stream",
        uploaded_by="presigned-local-agent"
    )
