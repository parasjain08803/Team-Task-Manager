from sqlalchemy.orm import Session
from app.models.project import Project, ProjectMember
from app.schemas.project import ProjectCreate

def get_project(db: Session, project_id: int):
    return db.query(Project).filter(Project.id == project_id).first()

def get_projects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Project).offset(skip).limit(limit).all()

def get_projects_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    creator_projects = db.query(Project).filter(Project.creator_id == user_id)

    member_projects = db.query(Project).join(ProjectMember).filter(
        ProjectMember.user_id == user_id
    ).distinct()

    all_projects = creator_projects.union(member_projects)

    return all_projects.offset(skip).limit(limit).all()

def create_project(db: Session, project: ProjectCreate, creator_id: int):
    db_project = Project(
        name=project.name,
        description=project.description,
        creator_id=creator_id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    db_member = ProjectMember(project_id=db_project.id, user_id=creator_id, role="owner")
    db.add(db_member)
    db.commit()

    return db_project

def update_project(db: Session, project_id: int, project_update: dict):
    db_project = get_project(db, project_id)
    if db_project:
        for key, value in project_update.items():
            setattr(db_project, key, value)
        db.commit()
        db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int):
    db_project = get_project(db, project_id)
    if db_project:
        db.delete(db_project)
        db.commit()
    return db_project

def add_project_member(db: Session, project_id: int, user_id: int, role: str = "member"):
    existing_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()

    if existing_member:
        raise ValueError(f"User {user_id} is already a member of project {project_id}")

    if role not in ["owner", "member"]:
        raise ValueError(f"Invalid role: {role}. Must be 'owner' or 'member'")

    db_member = ProjectMember(project_id=project_id, user_id=user_id, role=role)
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

def remove_project_member(db: Session, project_id: int, user_id: int):
    db_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()

    if not db_member:
        raise ValueError(f"User {user_id} is not a member of project {project_id}")

    if db_member.role == "owner":
        raise ValueError("Cannot remove project owner from project")

    db.delete(db_member)
    db.commit()
    return db_member

def get_project_members(db: Session, project_id: int):
    return db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()
