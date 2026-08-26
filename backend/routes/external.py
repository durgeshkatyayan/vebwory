from typing import List
from fastapi import APIRouter, Depends
from schemas import ExternalUserResponse
from services import ExternalAPIService
from auth import current_user

router = APIRouter(prefix="/api/external", tags=["External Integrations"])


@router.get("/users", response_model=List[ExternalUserResponse])
async def get_external_users(_user = Depends(current_user)):
    return await ExternalAPIService.fetch_external_users()