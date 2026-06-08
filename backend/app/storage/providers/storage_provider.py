from abc import ABC, abstractmethod
from typing import Dict, Any

class StorageProvider(ABC):
    @abstractmethod
    def upload_file(self, tenant_id: str, category: str, filename: str, content: bytes) -> str:
        """
        Uploads a file to storage and returns its unique storage key (e.g. s3 key).
        """
        pass

    @abstractmethod
    def download_file(self, key: str) -> bytes:
        """
        Retrieves a file from storage and returns its raw bytes.
        """
        pass

    @abstractmethod
    def delete_file(self, key: str) -> bool:
        """
        Deletes a file from storage. Returns True if succeeded, otherwise False.
        """
        pass

    @abstractmethod
    def get_presigned_download_url(self, key: str, expires_in: int = 3600) -> str:
        """
        Generates a secure temporary download URL.
        """
        pass

    @abstractmethod
    def get_presigned_upload_url(self, tenant_id: str, category: str, filename: str, expires_in: int = 3600) -> Dict[str, Any]:
        """
        Generates a secure temporary upload url/payload parameters.
        """
        pass
