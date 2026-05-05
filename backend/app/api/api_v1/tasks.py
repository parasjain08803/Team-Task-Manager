from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.crud.task import (
    get_task, get_tasks, get_tasks_by_project, get_tasks_by_assignee,
    get_overdue_tasks, create_task, update_task, delete_task, update_overdue_tasks
)
from app.crud.project import get_project, get_project_members
from app.crud.user import get_user
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate, AssigneeInfo, ProjectInfo
from app.models.user import User
from app.models.task import TaskStatus

router = APIRouter()

def format_task_response(task, db, current_user):

    db_project = get_project(db, project_id=task.project_id)
    project_info = ProjectInfo(
        id=db_project.id,
        name=db_project.name
    )

    assignee_info = None
    if task.assignee_id:
        assignee = get_user(db, task.assignee_id)
        if assignee:
            assignee_info = AssigneeInfo(
                id=assignee.id,
                email=assignee.email,
                full_name=assignee.full_name,
                is_admin=assignee.role.value == "admin"
            )

    can_complete = (
        task.status != TaskStatus.COMPLETED and
        (current_user.id == task.assignee_id or current_user.id == task.creator_id or current_user.role.value == "admin")
    )

    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        project=project_info,
        assignee=assignee_info,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date,
        can_complete=can_complete
    )

@router.post("/", response_model=TaskResponse)
def create_task_endpoint(
    task: TaskCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    print(f"DEBUG: Task creation request: {task}")
    print(f"DEBUG: User: {current_user.email}, role: {current_user.role}")

    db_project = get_project(db, project_id=task.project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    if db_project.creator_id != current_user.id and current_user.role.value != "admin":
        members = get_project_members(db, task.project_id)
        is_member = any(member.user_id == current_user.id for member in members)
        if not is_member:
            raise HTTPException(status_code=403, detail="Not enough permissions")

    if task.assignee_id:
        assignee = get_user(db, task.assignee_id)
        if not assignee:
            raise HTTPException(status_code=404, detail="Assignee not found")

        members = get_project_members(db, task.project_id)
        is_member = any(member.user_id == task.assignee_id for member in members)

        if not is_member:
            from app.crud.project import add_project_member
            add_project_member(db, task.project_id, task.assignee_id, "member")
            print(f"DEBUG: Automatically added user {task.assignee_id} as project member")

    db_task = create_task(db=db, task=task, creator_id=current_user.id)
    return format_task_response(db_task, db, current_user)

@router.get("/", response_model=List[TaskResponse])
def read_tasks(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    update_overdue_tasks(db)
    tasks = get_tasks(db, skip=skip, limit=limit)

    accessible_tasks = []
    for task in tasks:
        db_project = get_project(db, project_id=task.project_id)
        if db_project.creator_id == current_user.id or current_user.role.value == "admin":
            accessible_tasks.append(task)
        else:
            members = get_project_members(db, task.project_id)
            is_member = any(member.user_id == current_user.id for member in members)
            if is_member:
                accessible_tasks.append(task)

    formatted_tasks = []
    for task in accessible_tasks:
        formatted_task = format_task_response(task, db, current_user)
        formatted_tasks.append(formatted_task)

    return formatted_tasks

@router.get("/my-tasks", response_model=List[TaskResponse])
def read_my_tasks(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    update_overdue_tasks(db)
    tasks = get_tasks_by_assignee(db, assignee_id=current_user.id)
    formatted_tasks = []
    for task in tasks:
        formatted_task = format_task_response(task, db, current_user)
        formatted_tasks.append(formatted_task)
    return formatted_tasks

@router.get("/project/{project_id}", response_model=List[TaskResponse])
def read_tasks_by_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_project = get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    has_access = False
    if db_project.creator_id == current_user.id or current_user.role.value == "admin":
        has_access = True
    else:
        members = get_project_members(db, project_id)
        is_member = any(member.user_id == current_user.id for member in members)
        if is_member:
            has_access = True

    if not has_access:
        raise HTTPException(status_code=403, detail="Not enough permissions to access this project")

    tasks = get_tasks_by_project(db, project_id=project_id)
    formatted_tasks = []
    for task in tasks:
        formatted_task = format_task_response(task, db, current_user)
        formatted_tasks.append(formatted_task)
    return formatted_tasks

@router.get("/overdue", response_model=List[TaskResponse])
def read_overdue_tasks(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    update_overdue_tasks(db)
    overdue_tasks = get_overdue_tasks(db)
    accessible_overdue = []
    for task in overdue_tasks:
        db_project = get_project(db, project_id=task.project_id)
        if db_project.creator_id == current_user.id:
            accessible_overdue.append(task)
        else:
            members = get_project_members(db, task.project_id)
            is_member = any(member.user_id == current_user.id for member in members)
            if is_member:
                accessible_overdue.append(task)

    formatted_tasks = []
    for task in accessible_overdue:
        formatted_task = format_task_response(task, db, current_user)
        formatted_tasks.append(formatted_task)
    return formatted_tasks

@router.get("/{task_id}", response_model=TaskResponse)
def read_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_task = get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    db_project = get_project(db, project_id=db_task.project_id)
    if db_project.creator_id != current_user.id:
        members = get_project_members(db, db_task.project_id)
        is_member = any(member.user_id == current_user.id for member in members)
        if not is_member:
            raise HTTPException(status_code=403, detail="Not enough permissions")

    return format_task_response(db_task, db, current_user)

@router.put("/{task_id}", response_model=TaskResponse)
def update_task_endpoint(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_task = get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    db_project = get_project(db, project_id=db_task.project_id)
    has_access = False

    if db_project.creator_id == current_user.id:
        has_access = True
    else:
        members = get_project_members(db, db_task.project_id)
        is_member = any(member.user_id == current_user.id for member in members)
        if is_member:
            has_access = True

    if not has_access and current_user.id == db_task.assignee_id:
        has_access = True

    if not has_access:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = task_update.model_dump(exclude_unset=True)

    if current_user.role.value != "admin":
        allowed_fields = {'status'}
        invalid_fields = [field for field in update_data.keys() if field not in allowed_fields]
        if invalid_fields:
            raise HTTPException(
                status_code=403,
                detail=f"Non-admin users can only update task status. Invalid fields: {', '.join(invalid_fields)}"
            )

    if 'project_id' in update_data and update_data['project_id']:
        if current_user.role.value != "admin":
            raise HTTPException(status_code=403, detail="Only admins can change project assignment")

        new_project = get_project(db, project_id=update_data['project_id'])
        if not new_project:
            raise HTTPException(status_code=404, detail="New project not found")

        if new_project.creator_id != current_user.id:
            members = get_project_members(db, update_data['project_id'])
            is_member = any(member.user_id == current_user.id for member in members)
            if not is_member:
                raise HTTPException(status_code=403, detail="Not enough permissions for new project")

    if 'assignee_id' in update_data:
        if current_user.role.value != "admin":
            raise HTTPException(status_code=403, detail="Only admins can change task assignment")

        old_assignee_id = db_task.assignee_id
        new_assignee_id = update_data['assignee_id']

        if new_assignee_id:
            assignee = get_user(db, new_assignee_id)
            if not assignee:
                raise HTTPException(status_code=404, detail="Assignee not found")

            project_to_check = update_data.get('project_id', db_task.project_id)

            members = get_project_members(db, project_to_check)
            is_member = any(member.user_id == new_assignee_id for member in members)

            if not is_member:
                from app.crud.project import add_project_member
                add_project_member(db, project_to_check, new_assignee_id, "member")
                print(f"DEBUG: Automatically added user {new_assignee_id} as project member during task update")

        if old_assignee_id and not new_assignee_id:
            from app.crud.task import get_tasks_by_project
            from app.crud.project import remove_project_member

            project_to_check = update_data.get('project_id', db_task.project_id)
            remaining_tasks = get_tasks_by_project(db, project_to_check)
            old_assignee_has_tasks = any(task.assignee_id == old_assignee_id for task in remaining_tasks)

            db_project = get_project(db, project_id=project_to_check)

            if not old_assignee_has_tasks and old_assignee_id != db_project.creator_id:
                try:
                    remove_project_member(db, project_to_check, old_assignee_id)
                    print(f"DEBUG: Automatically removed user {old_assignee_id} from project {project_to_check} (assignee cleared, no more tasks)")
                except ValueError as e:
                    print(f"DEBUG: Could not remove user {old_assignee_id} from project: {e}")

    updated_task = update_task(db, task_id, update_data)
    return format_task_response(updated_task, db, current_user)

@router.post("/{task_id}/complete", response_model=TaskResponse)
def complete_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_task = get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    if (current_user.id != db_task.assignee_id and
        current_user.id != db_task.creator_id and
        current_user.role.value != "admin"):
        raise HTTPException(status_code=403, detail="Not enough permissions to complete this task")

    if db_task.status == TaskStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Task is already completed")

    update_data = {"status": TaskStatus.COMPLETED}
    updated_task = update_task(db, task_id, update_data)
    return format_task_response(updated_task, db, current_user)

@router.delete("/{task_id}")
def delete_task_endpoint(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_task = get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    db_project = get_project(db, project_id=db_task.project_id)
    if db_project.creator_id != current_user.id and db_task.creator_id != current_user.id:
        members = get_project_members(db, db_task.project_id)
        is_member = any(member.user_id == current_user.id for member in members)
        if not is_member:
            raise HTTPException(status_code=403, detail="Not enough permissions")

    assignee_id = db_task.assignee_id
    project_id = db_task.project_id

    delete_task(db, task_id)

    if assignee_id:
        from app.crud.task import get_tasks_by_project
        from app.crud.project import remove_project_member

        remaining_tasks = get_tasks_by_project(db, project_id)
        assignee_has_tasks = any(task.assignee_id == assignee_id for task in remaining_tasks)

        db_project = get_project(db, project_id=project_id)

        if not assignee_has_tasks and assignee_id != db_project.creator_id:
            try:
                remove_project_member(db, project_id, assignee_id)
                print(f"DEBUG: Automatically removed user {assignee_id} from project {project_id} (no more tasks)")
            except ValueError as e:
                print(f"DEBUG: Could not remove user {assignee_id} from project: {e}")

    return {"message": "Task deleted successfully"}
