from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from repositories import TaskRepository
from schemas import DashboardMetrics
from auth import current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardMetrics)
def get_dashboard_metrics(db: Session = Depends(get_db), _user = Depends(current_user)):
    repo = TaskRepository(db)
    return repo.get_dashboard_metrics()