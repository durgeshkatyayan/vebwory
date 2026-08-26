from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import AuthResponse, LoginRequest, UserCreate, UserResponse
from auth import create_token, current_user, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email is already registered")
    # Public registration can never grant elevated permissions.
    user = User(name=data.name, email=data.email, role="member", password_hash=hash_password(data.password))
    db.add(user); db.commit(); db.refresh(user)
    return {"token": create_token(user), "user": user}

@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"token": create_token(user), "user": user}

@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(current_user)):
    return user