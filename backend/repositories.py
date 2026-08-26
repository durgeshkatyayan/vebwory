from datetime import datetime
from typing import Optional, Tuple, List
from sqlalchemy import or_, func
from sqlalchemy.orm import Session, joinedload
from models import Task, Comment, User, TaskStatus, TaskPriority
from schemas import TaskCreate, TaskUpdate, CommentCreate


class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, task_id: int) -> Optional[Task]:
        return (
            self.db.query(Task)
            .options(
                joinedload(Task.assignee),
                joinedload(Task.comments).joinedload(Comment.author)
            )
            .filter(Task.id == task_id)
            .first()
        )

    def get_paginated(
        self,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        status: Optional[TaskStatus] = None,
        priority: Optional[TaskPriority] = None,
        assignee_id: Optional[int] = None,
    ) -> Tuple[List[Task], int]:
        query = self.db.query(Task).options(joinedload(Task.assignee))

        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                or_(
                    Task.title.ilike(search_filter),
                    Task.description.ilike(search_filter),
                )
            )

        if status:
            query = query.filter(Task.status == status)

        if priority:
            query = query.filter(Task.priority == priority)

        if assignee_id:
            query = query.filter(Task.assignee_id == assignee_id)

        total = query.count()
        tasks = (
            query.order_by(Task.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        return tasks, total

    def create(self, task_data: TaskCreate) -> Task:
        task = Task(**task_data.model_dump())
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return self.get_by_id(task.id)

    def update(self, task_id: int, task_data: TaskUpdate) -> Optional[Task]:
        task = self.db.query(Task).filter(Task.id == task_id).first()
        if not task:
            return None

        update_dict = task_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(task, key, value)

        task.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(task)
        return self.get_by_id(task_id)

    def delete(self, task_id: int) -> bool:
        task = self.db.query(Task).filter(Task.id == task_id).first()
        if not task:
            return False
        self.db.delete(task)
        self.db.commit()
        return True

    def add_comment(self, task_id: int, comment_data: CommentCreate) -> Comment:
        comment = Comment(
            task_id=task_id,
            author_id=comment_data.author_id,
            content=comment_data.content,
        )
        self.db.add(comment)
        self.db.commit()
        self.db.refresh(comment)
        return (
            self.db.query(Comment)
            .options(joinedload(Comment.author))
            .filter(Comment.id == comment.id)
            .first()
        )

    def get_dashboard_metrics(self) -> dict:
        now = datetime.utcnow()
        total = self.db.query(func.count(Task.id)).scalar() or 0
        pending = self.db.query(func.count(Task.id)).filter(Task.status == TaskStatus.PENDING).scalar() or 0
        in_progress = self.db.query(func.count(Task.id)).filter(Task.status == TaskStatus.IN_PROGRESS).scalar() or 0
        completed = self.db.query(func.count(Task.id)).filter(Task.status == TaskStatus.COMPLETED).scalar() or 0
        blocked = self.db.query(func.count(Task.id)).filter(Task.status == TaskStatus.BLOCKED).scalar() or 0
        overdue = (
            self.db.query(func.count(Task.id))
            .filter(Task.due_date < now, Task.status != TaskStatus.COMPLETED)
            .scalar()
            or 0
        )

        return {
            "total_tasks": total,
            "pending_tasks": pending,
            "in_progress_tasks": in_progress,
            "completed_tasks": completed,
            "blocked_tasks": blocked,
            "overdue_tasks": overdue,
        }