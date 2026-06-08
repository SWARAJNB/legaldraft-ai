from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import files

# Auto-create SQLite metadata tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LegalDraft AI Storage API",
    description="Enterprise-grade tenant-isolated document storage service for LegalDraft AI",
    version="1.0.0"
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Safe default for local testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include file management routers
app.include_router(files.router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "legaldraft-storage-backend"
    }
