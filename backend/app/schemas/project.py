from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class ProjectResponse(ProjectBase):
    id: int
    creator_id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserInfo(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None

    class Config:
        from_attributes = True

class ProjectMemberResponse(BaseModel):
    id: int
    project_id: int
    user_id: int
    role: str
    joined_at: datetime
    user: Optional[UserInfo] = None

    class Config:
        from_attributes = True

class ProjectWithMembers(ProjectResponse):
    members: List[ProjectMemberResponse] = []
