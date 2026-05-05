from fastapi import APIRouter
from app.api.api_v1.auth import router as auth_router
from app.api.api_v1.users import router as users_router
from app.api.api_v1.projects import router as projects_router
from app.api.api_v1.tasks import router as tasks_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(projects_router, prefix="/projects", tags=["projects"])
api_router.include_router(tasks_router, prefix="/tasks", tags=["tasks"])
