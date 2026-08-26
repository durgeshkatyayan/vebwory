from typing import List
import httpx
from fastapi import HTTPException, status
from schemas import ExternalUserResponse


class ExternalAPIService:
    EXTERNAL_API_URL = "https://jsonplaceholder.typicode.com/users"

    @classmethod
    async def fetch_external_users(cls) -> List[ExternalUserResponse]:
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(cls.EXTERNAL_API_URL)
                response.raise_for_status()
                data = response.json()
                return [ExternalUserResponse(**user) for user in data]
            except httpx.TimeoutException:
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail="External User Directory Service timed out",
                )
            except httpx.HTTPStatusError as e:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"External service returned error status {e.response.status_code}",
                )
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"An error occurred while connecting to external service: {str(e)}",
                )