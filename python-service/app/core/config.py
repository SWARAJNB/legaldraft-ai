from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://legaldraft:legaldraft_password@localhost:5432/legaldraft_ai"
    JWT_SECRET: str = Field(
        default="legaldraft-dev-secret-key-change-in-production-2024",
        validation_alias="JWT_SECRET_KEY"
    )
    JWT_ALGORITHM: str = "HS256"

    # Future-ready: issuer and audience validation
    # Not enforced until NestJS adds these claims to the JWT payload.
    # Set via environment variables JWT_ISSUER / JWT_AUDIENCE when ready.
    JWT_ISSUER: Optional[str] = None
    JWT_AUDIENCE: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=("../backend/.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
