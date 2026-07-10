import uuid
import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.api.deps import get_db, get_current_user
from app.models.auth import User
from app.repositories.workspace_repository import WorkspaceMemberRepository
from app.repositories.case_repository import CaseRepository
from app.repositories.client_repository import ClientRepository
from app.models.case import Case
from app.models.client import Client
from app.models.storage import File
from app.models.draft import Draft
from app.schemas.case import (
    CaseCreate,
    CaseUpdate,
    CaseResponse,
    TimelineEventCreate,
    LinkDraftRequest,
    LinkDocumentRequest
)

router = APIRouter(prefix="/cases", tags=["Cases"])

def get_case_response_data(case: Case, db: Session) -> dict:
    # Get client details
    client_name = case.client.full_name if case.client else "Unknown Client"
    client_email = case.client.email if case.client else ""
    
    # Retrieve linked drafts and documents
    stmt_drafts = select(Draft).where(Draft.case_id == case.id)
    drafts = list(db.scalars(stmt_drafts).all())
    related_drafts = [str(d.id) for d in drafts]
    
    stmt_files = select(File).where(File.case_id == case.id)
    files = list(db.scalars(stmt_files).all())
    related_files = [str(f.id) for f in files]
    
    # Parse manual timeline events stored in case model
    timeline = []
    if case.timeline:
        try:
            timeline = json.loads(case.timeline)
        except Exception:
            timeline = []
            
    # Add dynamic timeline events (registered event, next hearing event)
    # 1. Registered event
    filing_date_str = case.filing_date.isoformat() if case.filing_date else (case.created_at.isoformat() if case.created_at else datetime.utcnow().isoformat())
    has_registered = any(e.get("title") == "Case Registered" for e in timeline)
    if not has_registered:
        timeline.insert(0, {
            "id": f"tl_reg_{case.id}",
            "date": filing_date_str,
            "title": "Case Registered",
            "description": f"Case registered in database at {case.court}.",
            "type": "filing"
        })
        
    # 2. Next hearing event
    if case.hearing_date:
        hearing_date_str = case.hearing_date.isoformat()
        has_hearing = any(e.get("title") == "Hearing Scheduled" for e in timeline)
        if not has_hearing:
            timeline.append({
                "id": f"tl_hear_{case.id}",
                "date": hearing_date_str,
                "title": "Hearing Scheduled",
                "description": f"Next hearing scheduled at {case.court}.",
                "type": "hearing"
            })
            
    # Sort timeline events by date descending
    try:
        timeline.sort(key=lambda x: x.get("date", ""), reverse=True)
    except Exception:
        pass
        
    return {
        "id": str(case.id),
        "caseNumber": case.case_number,
        "clientName": client_name,
        "clientEmail": client_email,
        "clientId": str(case.client_id),
        "status": case.status,
        "priority": case.priority,
        "category": case.case_type,
        "assignedLawyer": "Priya Mehta",  # Default placeholder or lawyer details
        "court": case.court,
        "judge": case.judge,
        "title": case.title,
        "filingDate": case.filing_date.isoformat() if case.filing_date else None,
        "nextHearing": case.hearing_date.isoformat() if case.hearing_date else None,
        "description": case.description or "",
        "relatedDrafts": related_drafts,
        "relatedFiles": related_files,
        "timeline": timeline
    }

@router.get("", response_model=List[dict])
def list_cases(
    workspace_id: uuid.UUID,
    search: Optional[str] = None,
    client_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    member_repo = WorkspaceMemberRepository(db)
    member = member_repo.get_member(workspace_id, current_user.id)
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this workspace")
        
    case_repo = CaseRepository(db)
    if client_id:
        cases = case_repo.get_by_client(client_id)
    elif search:
        cases = case_repo.search(workspace_id, search)
    else:
        cases = case_repo.get_by_workspace(workspace_id)
    return [get_case_response_data(c, db) for c in cases]

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_case(
    workspace_id: uuid.UUID,
    case_in: CaseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    member_repo = WorkspaceMemberRepository(db)
    member = member_repo.get_member(workspace_id, current_user.id)
    if not member or member.role not in ["owner", "admin", "member"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
        
    client_repo = ClientRepository(db)
    client = client_repo.get(case_in.client_id)
    if not client or client.is_deleted:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid client ID")
        
    case_repo = CaseRepository(db)
    # Check duplicate case number
    existing = case_repo.get_by_number(case_in.case_number)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Case number already exists")
        
    case = Case(
        case_number=case_in.case_number,
        title=case_in.title,
        case_type=case_in.case_type,
        court=case_in.court,
        judge=case_in.judge,
        status=case_in.status,
        priority=case_in.priority,
        filing_date=case_in.filing_date,
        hearing_date=case_in.hearing_date,
        description=case_in.description,
        client_id=case_in.client_id,
        workspace_id=workspace_id,
        timeline="[]"
    )
    case_repo.create(case)
    case_repo.commit()
    case_repo.refresh(case)
    return get_case_response_data(case, db)

@router.get("/{case_id}", response_model=dict)
def get_case(
    case_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case_repo = CaseRepository(db)
    case = case_repo.get(case_id)
    if not case or case.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
        
    member_repo = WorkspaceMemberRepository(db)
    member = member_repo.get_member(case.workspace_id, current_user.id)
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    return get_case_response_data(case, db)

@router.patch("/{case_id}", response_model=dict)
def update_case(
    case_id: uuid.UUID,
    case_in: CaseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case_repo = CaseRepository(db)
    case = case_repo.get(case_id)
    if not case or case.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
        
    member_repo = WorkspaceMemberRepository(db)
    member = member_repo.get_member(case.workspace_id, current_user.id)
    if not member or member.role not in ["owner", "admin", "member"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
        
    update_data = case_in.model_dump(exclude_unset=True)
    case_repo.update(case, update_data)
    case_repo.commit()
    case_repo.refresh(case)
    return get_case_response_data(case, db)

@router.delete("/{case_id}", status_code=status.HTTP_200_OK)
def delete_case(
    case_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case_repo = CaseRepository(db)
    case = case_repo.get(case_id)
    if not case or case.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
        
    member_repo = WorkspaceMemberRepository(db)
    member = member_repo.get_member(case.workspace_id, current_user.id)
    if not member or member.role not in ["owner", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owners or admins can delete cases")
        
    case.is_deleted = True
    case_repo.commit()
    return {"message": "Case deleted successfully"}

@router.post("/{case_id}/link-draft", response_model=dict)
def link_draft_to_case(
    case_id: uuid.UUID,
    req: LinkDraftRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case_repo = CaseRepository(db)
    case = case_repo.get(case_id)
    if not case or case.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
        
    # Get the draft. If it doesn't exist, we create/stub it or read it
    stmt = select(Draft).where(Draft.id == req.draft_id)
    draft = db.scalars(stmt).first()
    if not draft:
        # Stub the draft so that we can link NestJS drafts seamlessly!
        # Check draft title from NestJS if needed, or create a mock draft in python
        # Let's see if we can get it from NestJS drafts table!
        from sqlalchemy import text
        try:
            query = text("SELECT title, content, created_at, created_by FROM drafts WHERE id = :id")
            res_draft = db.execute(query, {"id": req.draft_id}).fetchone()
            if res_draft:
                draft = Draft(
                    id=req.draft_id,
                    title=res_draft.title,
                    content=res_draft.content,
                    workspace_id=case.workspace_id,
                    case_id=case.id,
                    created_by=res_draft.created_by
                )
                db.add(draft)
                db.commit()
            else:
                # Create a generic draft record
                draft = Draft(
                    id=req.draft_id,
                    title=f"Draft {str(req.draft_id)[:8]}",
                    workspace_id=case.workspace_id,
                    case_id=case.id,
                    created_by=current_user.id
                )
                db.add(draft)
                db.commit()
        except Exception:
            draft = Draft(
                id=req.draft_id,
                title=f"Draft {str(req.draft_id)[:8]}",
                workspace_id=case.workspace_id,
                case_id=case.id,
                created_by=current_user.id
            )
            db.add(draft)
            db.commit()
    else:
        draft.case_id = case.id
        db.commit()
        
    # Add timeline event for draft link
    timeline = []
    if case.timeline:
        try:
            timeline = json.loads(case.timeline)
        except Exception:
            timeline = []
    timeline.append({
        "id": f"tl_draft_{req.draft_id}_{int(datetime.utcnow().timestamp())}",
        "date": datetime.utcnow().isoformat(),
        "title": "Draft Linked",
        "description": f"Draft '{draft.title}' was connected to this case.",
        "type": "draft"
    })
    case.timeline = json.dumps(timeline)
    db.commit()
    
    return get_case_response_data(case, db)

@router.post("/{case_id}/link-document", response_model=dict)
def link_document_to_case(
    case_id: uuid.UUID,
    req: LinkDocumentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case_repo = CaseRepository(db)
    case = case_repo.get(case_id)
    if not case or case.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
        
    # Check in fastapi_files
    stmt = select(File).where(File.id == req.document_id)
    file = db.scalars(stmt).first()
    if not file:
        # Check in NestJS files table
        from sqlalchemy import text
        try:
            query = text("SELECT file_name, file_type, file_size, uploaded_by FROM files WHERE id = :id")
            res_file = db.execute(query, {"id": req.document_id}).fetchone()
            if res_file:
                # Provision File in fastapi_files
                file = File(
                    id=req.document_id,
                    name=res_file.file_name,
                    mime_type=res_file.file_type,
                    workspace_id=case.workspace_id,
                    case_id=case.id,
                    created_by=current_user.id  # Link to creator
                )
                db.add(file)
                db.commit()
            else:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Document not found in database: {str(e)}")
    else:
        file.case_id = case.id
        db.commit()
        
    # Add timeline event for document link
    timeline = []
    if case.timeline:
        try:
            timeline = json.loads(case.timeline)
        except Exception:
            timeline = []
    timeline.append({
        "id": f"tl_doc_{req.document_id}_{int(datetime.utcnow().timestamp())}",
        "date": datetime.utcnow().isoformat(),
        "title": "Document Linked",
        "description": f"Document '{file.name}' was linked to this case.",
        "type": "filing"
    })
    case.timeline = json.dumps(timeline)
    db.commit()
    
    return get_case_response_data(case, db)

@router.post("/{case_id}/timeline", response_model=dict)
def add_timeline_event(
    case_id: uuid.UUID,
    event_in: TimelineEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case_repo = CaseRepository(db)
    case = case_repo.get(case_id)
    if not case or case.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
        
    timeline = []
    if case.timeline:
        try:
            timeline = json.loads(case.timeline)
        except Exception:
            timeline = []
            
    timeline.append({
        "id": f"tl_manual_{int(datetime.utcnow().timestamp())}_{uuid.uuid4().hex[:4]}",
        "date": event_in.date.isoformat(),
        "title": event_in.title,
        "description": event_in.description,
        "type": event_in.type
    })
    
    case.timeline = json.dumps(timeline)
    case_repo.commit()
    return get_case_response_data(case, db)
