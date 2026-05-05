from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.crud.project import (
    get_project, get_projects, get_projects_by_user, create_project,
    update_project, delete_project, add_project_member, remove_project_member,
    get_project_members
)
from app.crud.user import get_user
from app.schemas.project import (
    ProjectCreate, ProjectResponse, ProjectUpdate, ProjectWithMembers,
    ProjectMemberResponse, UserInfo
)
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=ProjectResponse)
def create_project_endpoint(
    project: ProjectCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admin users can create projects")
    return create_project(db=db, project=project, creator_id=current_user.id)

@router.get("/", response_model=List[ProjectResponse])
def read_projects(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    projects = get_projects_by_user(db, current_user.id, skip=skip, limit=limit)
    return projects

@router.get("/{project_id}", response_model=ProjectWithMembers)
def read_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_project = get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    if db_project.creator_id != current_user.id and current_user.role.value != "admin":
        members = get_project_members(db, project_id)
        is_member = any(member.user_id == current_user.id for member in members)
        if not is_member:
            raise HTTPException(status_code=403, detail="Not enough permissions")

    members = get_project_members(db, project_id)
    member_responses = []
    for member in members:
        user = get_user(db, member.user_id)
        user_info = UserInfo(
            id=user.id,
            email=user.email,
            full_name=user.full_name
        )
        member_responses.append(
            ProjectMemberResponse(
                id=member.id,
                project_id=member.project_id,
                user_id=member.user_id,
                role=member.role,
                joined_at=member.joined_at,
                user=user_info
            )
        )

    return ProjectWithMembers(
        id=db_project.id,
        name=db_project.name,
        description=db_project.description,
        creator_id=db_project.creator_id,
        is_active=db_project.is_active,
        created_at=db_project.created_at,
        members=member_responses
    )

@router.get("/{project_id}/members", response_model=List[ProjectMemberResponse])
def read_project_members(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_project = get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    if db_project.creator_id != current_user.id and current_user.role.value != "admin":
        members = get_project_members(db, project_id)
        is_member = any(member.user_id == current_user.id for member in members)
        if not is_member:
            raise HTTPException(status_code=403, detail="Not enough permissions")

    members = get_project_members(db, project_id)
    member_responses = []
    for member in members:
        user = get_user(db, member.user_id)
        user_info = UserInfo(
            id=user.id,
            email=user.email,
            full_name=user.full_name
        )
        member_responses.append(
            ProjectMemberResponse(
                id=member.id,
                project_id=member.project_id,
                user_id=member.user_id,
                role=member.role,
                joined_at=member.joined_at,
                user=user_info
            )
        )

    return member_responses

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project_endpoint(
    project_id: int,
    project_update: ProjectUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_project = get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    if db_project.creator_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only project creator can update project")

    return update_project(db, project_id, project_update.model_dump(exclude_unset=True))

@router.delete("/{project_id}")
def delete_project_endpoint(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_project = get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admin users can delete projects")

    delete_project(db, project_id)
    return {"message": "Project deleted successfully"}

@router.post("/{project_id}/members/{user_id}")
def add_member_to_project(
    project_id: int,
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_project = get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    if db_project.creator_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only project creator can add members")

    db_user = get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        add_project_member(db, project_id, user_id)
        return {"message": "Member added to project successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{project_id}/members/{user_id}")
def remove_member_from_project(
    project_id: int,
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_project = get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    if db_project.creator_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only project creator can remove members")

    try:
        remove_project_member(db, project_id, user_id)
        return {"message": "Member removed from project successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
