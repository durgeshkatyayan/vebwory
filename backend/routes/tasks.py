import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from database import get_db
from models import TaskStatus, TaskPriority
from repositories import TaskRepository
from schemas import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskDetailResponse,
    PaginatedTasksResponse,
    CommentCreate,
    CommentResponse,
)
from auth import current_user, require_roles

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("", response_model=PaginatedTasksResponse)
def get_tasks(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term in title or description"),
    status: Optional[TaskStatus] = Query(None, description="Filter by status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by priority"),
    assignee_id: Optional[int] = Query(None, description="Filter by assignee user ID"),
    db: Session = Depends(get_db),
    _user = Depends(current_user),
):
    repo = TaskRepository(db)
    items, total = repo.get_paginated(
        page=page,
        page_size=page_size,
        search=search,
        status=status,
        priority=priority,
        assignee_id=assignee_id,
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return PaginatedTasksResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_data: TaskCreate, db: Session = Depends(get_db), _user = Depends(require_roles("admin", "manager"))):
    repo = TaskRepository(db)
    return repo.create(task_data)


@router.get("/{task_id}", response_model=TaskDetailResponse)
def get_task_by_id(task_id: int, db: Session = Depends(get_db), _user = Depends(current_user)):
    repo = TaskRepository(db)
    task = repo.get_by_id(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found",
        )
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_data: TaskUpdate, db: Session = Depends(get_db), _user = Depends(require_roles("admin", "manager", "member"))):
    repo = TaskRepository(db)
    updated_task = repo.update(task_id, task_data)
    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found",
        )
    return updated_task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db), _user = Depends(require_roles("admin"))):
    repo = TaskRepository(db)
    deleted = repo.delete(task_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found",
        )
    return None


@router.post("/{task_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_task_comment(task_id: int, comment_data: CommentCreate, db: Session = Depends(get_db), _user = Depends(current_user)):
    repo = TaskRepository(db)
    task = repo.get_by_id(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found",
        )
    return repo.add_comment(task_id, comment_data)