from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create the SQLAlchemy Engine using psycopg driver
engine = create_engine(
    settings.DATABASE_URL.replace("postgres://", "postgresql+psycopg://").replace("postgresql://", "postgresql+psycopg://"),
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

# Configure SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# get_db dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
