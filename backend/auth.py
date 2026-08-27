import base64
import hashlib
import hmac
import json
import os
import time
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from database import get_db
from models import User

SECRET = os.getenv("AUTH_SECRET")
bearer = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 120_000)
    return f"{base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}"

def verify_password(password: str, stored: str | None) -> bool:
    if not stored or "$" not in stored:
        return False
    salt, expected = stored.split("$", 1)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), base64.urlsafe_b64decode(salt), 120_000)
    return hmac.compare_digest(base64.urlsafe_b64encode(digest).decode(), expected)

def _encode(payload: dict) -> str:
    data = base64.urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode()).decode().rstrip("=")
    signature = hmac.new(SECRET.encode(), data.encode(), hashlib.sha256).hexdigest()
    return f"{data}.{signature}"

def _decode(token: str) -> dict:
    data, signature = token.split(".", 1)
    expected = hmac.new(SECRET.encode(), data.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected):
        raise ValueError("Invalid token")
    return json.loads(base64.urlsafe_b64decode(data + "=" * (-len(data) % 4)))

def create_token(user: User) -> str:
    return _encode({"sub": user.id, "role": user.role, "exp": int(time.time()) + 86400})

def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    try:
        payload = _decode(credentials.credentials)
        if payload["exp"] < time.time():
            raise ValueError("Expired token")
        user = db.query(User).filter(User.id == payload["sub"]).first()
    except (ValueError, KeyError, TypeError, json.JSONDecodeError):
        user = None
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return user

def require_roles(*roles):
    def dependency(user: User = Depends(current_user)):
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user
    return dependency