from sqlalchemy.orm import Session
from app.models.task import Task, TaskStatus
from app.schemas.task import TaskCreate
from datetime import datetime

def get_task(db: Session, task_id: int):
    return db.query(Task).filter(Task.id == task_id).first()

def get_tasks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Task).offset(skip).limit(limit).all()

def get_tasks_by_project(db: Session, project_id: int):
    return db.query(Task).filter(Task.project_id == project_id).all()

def get_tasks_by_assignee(db: Session, assignee_id: int):
    return db.query(Task).filter(Task.assignee_id == assignee_id).all()

def get_overdue_tasks(db: Session):
    return db.query(Task).filter(
        Task.due_date < datetime.utcnow(),
        Task.status != TaskStatus.COMPLETED
    ).all()

def create_task(db: Session, task: TaskCreate, creator_id: int):
    db_task = Task(
        title=task.title,
        description=task.description,
        project_id=task.project_id,
        assignee_id=task.assignee_id,
        creator_id=creator_id,
        priority=task.priority,
        due_date=task.due_date
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task_update: dict):
    db_task = get_task(db, task_id)
    if db_task:
        for key, value in task_update.items():
            setattr(db_task, key, value)

        if 'status' in task_update and task_update['status'] == TaskStatus.COMPLETED:
            db_task.completed_at = datetime.utcnow()

        db.commit()
        db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int):
    db_task = get_task(db, task_id)
    if db_task:
        db.delete(db_task)
        db.commit()
    return db_task

def update_overdue_tasks(db: Session):

    overdue_tasks = db.query(Task).filter(
        Task.due_date < datetime.utcnow(),
        Task.status != TaskStatus.COMPLETED,
        Task.status != TaskStatus.OVERDUE
    ).all()

    for task in overdue_tasks:
        task.status = TaskStatus.OVERDUE

    db.commit()
    return overdue_tasks
