import os
from typing import Dict, Any
from app.config import settings
from app.storage.providers.storage_provider import StorageProvider

class LocalStorageProvider(StorageProvider):
    def __init__(self, base_dir: str = None):
        self.base_dir = base_dir or settings.LOCAL_STORAGE_DIR
        os.makedirs(self.base_dir, exist_ok=True)

    def _get_full_path(self, key: str) -> str:
        # Standardize separator for windows/linux compatibility
        clean_key = key.replace("/", os.sep)
        return os.path.abspath(os.path.join(self.base_dir, clean_key))

    def upload_file(self, tenant_id: str, category: str, filename: str, content: bytes) -> str:
        relative_key = f"tenants/{tenant_id}/{category}/{filename}"
        full_path = self._get_full_path(relative_key)
        
        # Ensure parent directories exist
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
        with open(full_path, "wb") as f:
            f.write(content)
            
        return relative_key

    def download_file(self, key: str) -> bytes:
        full_path = self._get_full_path(key)
        if not os.path.exists(full_path):
            raise FileNotFoundError(f"File metadata key not found in storage: {key}")
            
        with open(full_path, "rb") as f:
            return f.read()

    def delete_file(self, key: str) -> bool:
        full_path = self._get_full_path(key)
        if os.path.exists(full_path):
            try:
                os.remove(full_path)
                # Clean up empty parent directories up to base_dir
                parent = os.path.dirname(full_path)
                while parent != os.path.abspath(self.base_dir):
                    if not os.listdir(parent):
                        os.rmdir(parent)
                        parent = os.path.dirname(parent)
                    else:
                        break
                return True
            except Exception:
                return False
        return False

    def get_presigned_download_url(self, key: str, expires_in: int = 3600) -> str:
        # Direct fallback route URL for downloading files locally
        return f"/files/download/{key}"

    def get_presigned_upload_url(self, tenant_id: str, category: str, filename: str, expires_in: int = 3600) -> Dict[str, Any]:
        relative_key = f"tenants/{tenant_id}/{category}/{filename}"
        return {
            "url": "/files/upload-local-presigned",
            "fields": {
                "key": relative_key,
                "expires_in": expires_in
            }
        }
