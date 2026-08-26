from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
import models
from models import User, Task, Comment, TaskPriority, TaskStatus, UserRole
from routes import auth, users, tasks, dashboard, external
from security import hash_password

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Task Management System API",
    description="Backend API with PostgreSQL persistence and JWT Auth",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route Registrations
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)
app.include_router(external.router)


@app.on_event("startup")
def init_mock_data():
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            # Seed users with default password 'password123'
            default_hashed_pwd = hash_password("password123")
            
            admin_user = User(
                name="Alice Vance",
                email="admin@company.io",
                password_hash=default_hashed_pwd,
                role=UserRole.ADMIN,
            )
            manager_user = User(
                name="Bob Sterling",
                email="manager@company.io",
                password_hash=default_hashed_pwd,
                role=UserRole.MANAGER,
            )
            member_user = User(
                name="Chloe Zhao",
                email="member@company.io",
                password_hash=default_hashed_pwd,
                role=UserRole.MEMBER,
            )

            db.add_all([admin_user, manager_user, member_user])
            db.commit()
            db.refresh(admin_user)
            db.refresh(manager_user)
            db.refresh(member_user)

            now = datetime.utcnow()
            task1 = Task(
                title="Implement OAuth2 Token Authentication",
                description="Secure API endpoints with standard OAuth2 Bearer token workflows.",
                priority=TaskPriority.URGENT,
                status=TaskStatus.IN_PROGRESS,
                due_date=now + timedelta(days=2),
                assignee_id=admin_user.id,
            )
            db.add(task1)
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"Startup initialization error: {e}")
    finally:
        db.close()


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}