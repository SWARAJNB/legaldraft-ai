import boto3
from botocore.exceptions import ClientError
from typing import Dict, Any
from app.config import settings
from app.storage.providers.storage_provider import StorageProvider

class S3StorageProvider(StorageProvider):
    def __init__(self):
        client_kwargs = {
            "region_name": settings.AWS_REGION,
        }
        
        # Inject access keys if provided
        if settings.AWS_ACCESS_KEY_ID:
            client_kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
        if settings.AWS_SECRET_ACCESS_KEY:
            client_kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY
            
        # Support emulator URLs (LocalStack/MinIO)
        if settings.AWS_S3_ENDPOINT_URL:
            client_kwargs["endpoint_url"] = settings.AWS_S3_ENDPOINT_URL
            
        self.s3_client = boto3.client("s3", **client_kwargs)
        self.bucket_name = settings.AWS_S3_BUCKET_NAME

    def upload_file(self, tenant_id: str, category: str, filename: str, content: bytes) -> str:
        s3_key = f"tenants/{tenant_id}/{category}/{filename}"
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=content
            )
            return s3_key
        except ClientError as e:
            raise RuntimeError(f"Failed to upload object to S3 bucket: {e}")

    def download_file(self, key: str) -> bytes:
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=key
            )
            return response["Body"].read()
        except ClientError as e:
            raise FileNotFoundError(f"Failed to retrieve S3 object '{key}': {e}")

    def delete_file(self, key: str) -> bool:
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=key
            )
            return True
        except ClientError:
            return False

    def get_presigned_download_url(self, key: str, expires_in: int = 3600) -> str:
        try:
            url = self.s3_client.generate_presigned_url(
                ClientMethod="get_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": key
                },
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            raise RuntimeError(f"Failed to generate pre-signed S3 download link: {e}")

    def get_presigned_upload_url(self, tenant_id: str, category: str, filename: str, expires_in: int = 3600) -> Dict[str, Any]:
        s3_key = f"tenants/{tenant_id}/{category}/{filename}"
        try:
            response = self.s3_client.generate_presigned_post(
                Bucket=self.bucket_name,
                Key=s3_key,
                ExpiresIn=expires_in
            )
            return response
        except ClientError as e:
            raise RuntimeError(f"Failed to generate pre-signed S3 upload payload: {e}")
