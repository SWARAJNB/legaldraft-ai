import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.api.deps import get_db, get_current_user
from app.models.auth import User
from app.models.client import Client
from app.models.case import Case
from app.models.draft import Draft
from app.models.storage import File
from app.models.hearing import Hearing
from app.models.task import Task
from app.models.activity import ActivityLog
from app.repositories.workspace_repository import WorkspaceMemberRepository
from app.schemas.dashboard import (
    DashboardStatsResponse,
    RecentDraftResponse,
    RecentDocumentResponse,
    RecentClientResponse,
    RecentCaseResponse,
    DashboardHearingResponse,
    DashboardTaskResponse,
    DashboardActivityResponse,
    DashboardCaseResponse
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    workspace_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify user has access to workspace
    member_repo = WorkspaceMemberRepository(db)
    member = member_repo.get_member(workspace_id, current_user.id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this workspace"
        )

    # Active Clients Count
    active_clients = db.scalar(
        select(func.count(Client.id))
        .where(Client.workspace_id == workspace_id, Client.is_deleted == False)
    ) or 0

    # Active Cases Count
    active_cases = db.scalar(
        select(func.count(Case.id))
        .where(Case.workspace_id == workspace_id, Case.status == "active", Case.is_deleted == False)
    ) or 0

    # Upcoming Hearings Count
    upcoming_hearings = db.scalar(
        select(func.count(Case.id))
        .where(Case.workspace_id == workspace_id, Case.hearing_date >= func.now(), Case.is_deleted == False)
    ) or 0

    # Total Drafts Count
    total_drafts = db.scalar(
        select(func.count(Draft.id))
        .where(Draft.workspace_id == workspace_id, Draft.is_deleted == False)
    ) or 0

    # Recent Drafts
    stmt_drafts = (
        select(Draft)
        .where(Draft.workspace_id == workspace_id, Draft.is_deleted == False)
        .order_by(Draft.updated_at.desc())
        .limit(5)
    )
    drafts = list(db.scalars(stmt_drafts).all())
    recent_drafts_data = []
    for d in drafts:
        client_name = None
        case_number = None
        if d.case:
            case_number = d.case.case_number
            if d.case.client:
                client_name = d.case.client.full_name
        recent_drafts_data.append(
            RecentDraftResponse(
                id=d.id,
                title=d.title,
                updated_at=d.updated_at,
                client_name=client_name,
                case_number=case_number
            )
        )

    # Recent Documents
    stmt_files = (
        select(File)
        .where(File.workspace_id == workspace_id, File.is_deleted == False)
        .order_by(File.created_at.desc())
        .limit(5)
    )
    files = list(db.scalars(stmt_files).all())
    recent_files_data = []
    for f in files:
        case_title = f.case.title if f.case else None
        recent_files_data.append(
            RecentDocumentResponse(
                id=f.id,
                name=f.name,
                mime_type=f.mime_type,
                created_at=f.created_at,
                case_title=case_title
            )
        )

    # Recent Clients
    stmt_clients = (
        select(Client)
        .where(Client.workspace_id == workspace_id, Client.is_deleted == False)
        .order_by(Client.created_at.desc())
        .limit(5)
    )
    clients = list(db.scalars(stmt_clients).all())
    recent_clients_data = [
        RecentClientResponse(
            id=c.id,
            full_name=c.full_name,
            email=c.email,
            company=c.company,
            created_at=c.created_at
        )
        for c in clients
    ]

    # Recent Cases
    stmt_cases = (
        select(Case)
        .where(Case.workspace_id == workspace_id, Case.is_deleted == False)
        .order_by(Case.created_at.desc())
        .limit(5)
    )
    cases = list(db.scalars(stmt_cases).all())
    recent_cases_data = [
        RecentCaseResponse(
            id=cs.id,
            case_number=cs.case_number,
            title=cs.title,
            status=cs.status,
            priority=cs.priority,
            court=cs.court,
            client_name=cs.client.full_name if cs.client else None,
            hearing_date=cs.hearing_date,
            created_at=cs.created_at
        )
        for cs in cases
    ]

    # 1. Upcoming Hearings List
    stmt_hearings = (
        select(Hearing, Case.title.label("case_title"))
        .join(Case, Case.id == Hearing.case_id)
        .where(
            Case.workspace_id == workspace_id,
            Hearing.hearing_date >= datetime.utcnow(),
            Hearing.is_deleted == False,
            Case.is_deleted == False
        )
        .order_by(Hearing.hearing_date.asc())
        .limit(5)
    )
    hearings_res = db.execute(stmt_hearings).all()
    upcoming_hearings_list = [
        DashboardHearingResponse(
            id=h.Hearing.id,
            case_id=h.Hearing.case_id,
            case_title=h.case_title,
            hearing_date=h.Hearing.hearing_date,
            hearing_time=h.Hearing.hearing_time,
            court_name=h.Hearing.court_name,
            judge_name=h.Hearing.judge_name,
            purpose=h.Hearing.purpose
        )
        for h in hearings_res
    ]

    # 2. Pending Tasks List
    stmt_tasks = (
        select(Task, Case.title.label("case_title"))
        .join(Case, Case.id == Task.case_id)
        .where(
            Case.workspace_id == workspace_id,
            Task.status != "completed",
            Task.is_deleted == False,
            Case.is_deleted == False
        )
        .order_by(Task.due_date.asc().nullslast())
        .limit(5)
    )
    tasks_res = db.execute(stmt_tasks).all()
    pending_tasks_list = [
        DashboardTaskResponse(
            id=t.Task.id,
            case_id=t.Task.case_id,
            case_title=t.case_title,
            title=t.Task.title,
            priority=t.Task.priority,
            due_date=t.Task.due_date,
            status=t.Task.status
        )
        for t in tasks_res
    ]

    # 3. Recent Activities List
    stmt_activities = (
        select(ActivityLog, User.full_name.label("user_name"))
        .outerjoin(User, User.id == ActivityLog.user_id)
        .where(ActivityLog.workspace_id == workspace_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(5)
    )
    activities_res = db.execute(stmt_activities).all()
    recent_activities_list = [
        DashboardActivityResponse(
            id=act.ActivityLog.id,
            user_name=act.user_name or "System",
            action=act.ActivityLog.action,
            entity_type=act.ActivityLog.entity_type,
            details=act.ActivityLog.details,
            created_at=act.ActivityLog.created_at
        )
        for act in activities_res
    ]

    # 4. Recently Updated Cases List
    stmt_updated_cases = (
        select(Case)
        .where(Case.workspace_id == workspace_id, Case.is_deleted == False)
        .order_by(Case.updated_at.desc())
        .limit(5)
    )
    updated_cases = list(db.scalars(stmt_updated_cases).all())
    recently_updated_cases_list = [
        DashboardCaseResponse(
            id=cs.id,
            case_number=cs.case_number,
            title=cs.title,
            status=cs.status,
            priority=cs.priority,
            court=cs.court,
            client_name=cs.client.full_name if cs.client else None,
            updated_at=cs.updated_at
        )
        for cs in updated_cases
    ]

    return DashboardStatsResponse(
        active_clients=active_clients,
        active_cases=active_cases,
        upcoming_hearings=upcoming_hearings,
        total_drafts=total_drafts,
        recent_drafts=recent_drafts_data,
        recent_documents=recent_files_data,
        recent_clients=recent_clients_data,
        recent_cases=recent_cases_data,
        upcoming_hearings_list=upcoming_hearings_list,
        pending_tasks_list=pending_tasks_list,
        recent_activities_list=recent_activities_list,
        recently_updated_cases_list=recently_updated_cases_list
    )
