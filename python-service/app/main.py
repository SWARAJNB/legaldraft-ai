from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.api.v1.auth import router as auth_router
from app.api.v1.workspace import router as workspace_router
from app.api.v1.client import router as client_router
from app.api.v1.case import router as case_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.health import router as health_router
from app.api.v1.notification import router as notification_router
from app.api.v1.activity import router as activity_router
from app.api.v1.hearing import router as hearing_router
from app.api.v1.task import router as task_router
from app.api.v1.note import router as note_router
from app.core.config import settings
from app.core.logger import setup_logging

# Initialize logging
setup_logging()
logger = logging.getLogger("app")

# Initialize app ... (omitting actual code because we only replaced imports and will replace register below)


app = FastAPI(
    title="LegalDraft AI — Python Microservice",
    description="FastAPI Service handling multi-tenant workspaces and SQLAlchemy 2.0 Repositories.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers
@app.exception_handler(RequestValidationError)
def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error on {request.method} {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"success": False, "error": {"code": "VALIDATION_ERROR", "message": "Invalid request payload", "details": exc.errors()}}
    )

@app.exception_handler(StarletteHTTPException)
def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.error(f"HTTP exception on {request.method} {request.url.path}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": {"code": f"HTTP_{exc.status_code}", "message": exc.detail}}
    )

@app.exception_handler(Exception)
def generic_exception_handler(request: Request, exc: Exception):
    logger.critical(f"Unhandled system error on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "error": {"code": "INTERNAL_SERVER_ERROR", "message": "An unexpected system error occurred."}}
    )

# Include v1 API routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(workspace_router, prefix="/api/v1")
app.include_router(client_router, prefix="/api/v1")
app.include_router(case_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(health_router, prefix="/api/v1")
app.include_router(notification_router, prefix="/api/v1")
app.include_router(activity_router, prefix="/api/v1")
app.include_router(hearing_router, prefix="/api/v1")
app.include_router(task_router, prefix="/api/v1")
app.include_router(note_router, prefix="/api/v1")

