import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    STORAGE_MODE: str = "local"  # "local" or "s3"
    LOCAL_STORAGE_DIR: str = "./data"
    DATABASE_URL: str = "sqlite:///./metadata.db"
    
    # AWS S3 Integration
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "ap-south-1"
    AWS_S3_BUCKET_NAME: Optional[str] = None
    AWS_S3_ENDPOINT_URL: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
