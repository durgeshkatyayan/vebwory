from typing import List
from fastapi import Depends, HTTPException, status
from models import User, UserRole
from dependencies import get_current_user  # Your existing auth dependency


class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Operation requires one of the following roles: {[r.value for r in self.allowed_roles]}",
            )
        return current_user


# Pre-defined guard instances
require_admin_or_manager = RoleChecker([UserRole.ADMIN, UserRole.MANAGER])
require_admin = RoleChecker([UserRole.ADMIN])