from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys

# Add the root directory to the python path so 'app' can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.database.base import Base

# Import all models here for metadata registration in autogenerations
from app.models.auth import User, Role, Permission, UserRole
from app.models.workspace import Organization, Workspace, WorkspaceMember, WorkspaceInvitation
from app.models.storage import Folder, File, FileVersion
from app.models.ai import AIConversation, AIMessage, AIMemory, Embedding
from app.models.client import Client
from app.models.case import Case
from app.models.draft import Draft
from app.models.notification import Notification
from app.models.activity import ActivityLog
from app.models.hearing import Hearing
from app.models.task import Task
from app.models.note import CaseNote
from app.models.timeline import TimelineEvent
from app.models.file_intelligence import FileIntelligence
from app.models.template_version import TemplateVersion

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Inject the DATABASE_URL dynamically from pydantic settings
# overriding the dummy URL in alembic.ini
alembic_db_url = settings.DATABASE_URL.replace("postgres://", "postgresql+psycopg://").replace("postgresql://", "postgresql+psycopg://")
config.set_main_option("sqlalchemy.url", alembic_db_url)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

def include_object(object, name, type_, reflected, compare_to):
    if type_ == "table":
        # Only manage tables explicitly defined in the Python metadata
        return name in target_metadata.tables
    return True

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_object=include_object,
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata,
            include_object=include_object,
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
