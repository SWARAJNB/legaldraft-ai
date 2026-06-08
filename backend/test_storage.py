import sys
import os
# Inject app to python path resolution
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import File, FileVersion
from app.storage.services.upload_service import UploadService
from app.storage.services.download_service import DownloadService
from app.storage.services.delete_service import DeleteService
from app.storage.services.presigned_url_service import PresignedUrlService
from fastapi import HTTPException

# Test configuration: in-memory sqlite instance
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def run_tests():
    print("Initializing SQLite test database in-memory...")
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    tenant_a = "firm_mumbai_associates"
    tenant_b = "firm_delhi_lawyers"
    user_email = "priya.mehta@lexfirm.in"

    upload_service = UploadService(db)
    download_service = DownloadService(db)
    delete_service = DeleteService(db)
    presigned_service = PresignedUrlService(db)

    print("\n--- Starting Verification Suite ---")

    # Test 1: Upload a valid template (DOCX)
    print("Test 1: Uploading valid DOCX template...")
    mock_docx_content = b"PK\x03\x04...mock_docx_xml_payload..."
    file_record = upload_service.execute(
        tenant_id=tenant_a,
        category="templates",
        filename="bail_application.docx",
        content=mock_docx_content,
        content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        uploaded_by=user_email
    )
    assert file_record.original_name == "bail_application.docx"
    assert file_record.tenant_id == tenant_a
    assert file_record.file_size == len(mock_docx_content)
    
    # Verify version 1 is created
    v1 = db.query(FileVersion).filter(FileVersion.file_id == file_record.id).first()
    assert v1 is not None
    assert v1.version_number == 1
    print("✅ Test 1 Passed: Valid DOCX template uploaded, version v1 tracked.")

    # Test 2: Upload new version of the same file
    print("\nTest 2: Uploading version 2 of the same file...")
    mock_docx_v2_content = b"PK\x03\x04...mock_docx_v2_altered_payload..."
    updated_record = upload_service.execute(
        tenant_id=tenant_a,
        category="templates",
        filename="bail_application.docx",
        content=mock_docx_v2_content,
        content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        uploaded_by=user_email
    )
    assert updated_record.id == file_record.id
    assert updated_record.file_size == len(mock_docx_v2_content)
    
    # Check versions list
    versions = db.query(FileVersion).filter(FileVersion.file_id == file_record.id).order_by(FileVersion.version_number.asc()).all()
    assert len(versions) == 2
    assert versions[0].version_number == 1
    assert versions[1].version_number == 2
    print("✅ Test 2 Passed: Version v2 tracked successfully in DB.")

    # Test 3: Download file bytes
    print("\nTest 3: Downloading file bytes...")
    downloaded_bytes, name = download_service.execute(file_record.id, tenant_a)
    assert downloaded_bytes == mock_docx_v2_content
    assert name == "bail_application.docx"
    print("✅ Test 3 Passed: Correct file bytes downloaded from Local Storage.")

    # Test 4: Enforce tenant isolation (Access Denied)
    print("\nTest 4: Verifying Tenant Isolation Security...")
    try:
        download_service.execute(file_record.id, tenant_b)
        print("❌ Test 4 Failed: Tenant B was allowed to download Tenant A's file!")
        sys.exit(1)
    except HTTPException as e:
        assert e.status_code == 403
        assert "Access Denied" in e.detail
        print("✅ Test 4 Passed: Access Denied to unauthorized tenant (403 Forbidden).")

    # Test 5: Validate file size check (Max 15MB)
    print("\nTest 5: Verifying File Size Validation...")
    huge_content = b"x" * (16 * 1024 * 1024) # 16 MB
    try:
        upload_service.execute(
            tenant_id=tenant_a,
            category="templates",
            filename="large.docx",
            content=huge_content,
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            uploaded_by=user_email
        )
        print("❌ Test 5 Failed: Large file over 15MB was uploaded!")
        sys.exit(1)
    except HTTPException as e:
        assert e.status_code == 400
        assert "exceeds maximum allowed limit" in e.detail
        print("✅ Test 5 Passed: Huge file rejected successfully.")

    # Test 6: Validate MIME type check
    print("\nTest 6: Verifying MIME Type Validation...")
    try:
        upload_service.execute(
            tenant_id=tenant_a,
            category="templates",
            filename="exploit.exe",
            content=b"MZ...",
            content_type="application/x-msdownload",
            uploaded_by=user_email
        )
        print("❌ Test 6 Failed: Invalid content type was uploaded!")
        sys.exit(1)
    except HTTPException as e:
        assert e.status_code == 400
        assert "not permitted" in e.detail
        print("✅ Test 6 Passed: Malicious executable rejected successfully.")

    # Test 7: Pre-signed urls
    print("\nTest 7: Generating presigned urls...")
    download_url = presigned_service.get_download_url(file_record.id, tenant_a)
    assert download_url == f"/files/download/{file_record.s3_key}"
    
    upload_url_data = presigned_service.get_upload_url(tenant_a, "drafts", "brief.docx")
    assert upload_url_data["url"] == "/files/upload-local-presigned"
    print("✅ Test 7 Passed: Pre-signed URL endpoints resolved correctly.")

    # Test 8: Delete file
    print("\nTest 8: Deleting file and versions...")
    delete_service.execute(file_record.id, tenant_a)
    
    # Assert DB is empty
    assert db.query(File).filter(File.id == file_record.id).first() is None
    assert db.query(FileVersion).filter(FileVersion.file_id == file_record.id).first() is None
    print("✅ Test 8 Passed: File and all associated version records purged.")

    db.close()
    print("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉")

if __name__ == "__main__":
    run_tests()
