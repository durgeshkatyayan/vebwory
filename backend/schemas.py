from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field
from typing import Literal
from models import TaskPriority, TaskStatus


class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    role: Literal["admin", "manager", "member"] = "member"


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    token: str
    user: UserResponse


class CommentBase(BaseModel):
    content: str = Field(..., min_length=1)


class CommentCreate(CommentBase):
    author_id: int


class CommentResponse(CommentBase):
    id: int
    task_id: int
    author_id: int
    created_at: datetime
    author: UserResponse

    class Config:
        from_attributes = True


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    status: TaskStatus = TaskStatus.PENDING
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None


class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime
    assignee: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class TaskDetailResponse(TaskResponse):
    comments: List[CommentResponse] = []


class PaginatedTasksResponse(BaseModel):
    items: List[TaskResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class DashboardMetrics(BaseModel):
    total_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    blocked_tasks: int
    overdue_tasks: int


class ExternalUserGeo(BaseModel):
    lat: str
    lng: str


class ExternalUserAddress(BaseModel):
    street: str
    suite: str
    city: str
    zipcode: str
    geo: Optional[ExternalUserGeo] = None


class ExternalUserCompany(BaseModel):
    name: str
    catchPhrase: str
    bs: str


class ExternalUserResponse(BaseModel):
    id: int
    name: str
    username: str
    email: str
    phone: str
    website: str
    address: Optional[ExternalUserAddress] = None
    company: Optional[ExternalUserCompany] = None