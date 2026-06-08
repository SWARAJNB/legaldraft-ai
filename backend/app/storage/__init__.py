from app.config import settings
from app.storage.providers.storage_provider import StorageProvider
from app.storage.providers.local_provider import LocalStorageProvider
from app.storage.providers.s3_provider import S3StorageProvider

# Factory resolver to obtain configured storage provider instance
def get_storage_provider() -> StorageProvider:
    if settings.STORAGE_MODE.lower() == "s3":
        return S3StorageProvider()
    return LocalStorageProvider()
