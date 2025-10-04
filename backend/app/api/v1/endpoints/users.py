from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.db.base import get_db
from app.models.user import User
from app.schemas.user import User as UserSchema

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
async def get_users(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Получить список пользователей"""
    result = await db.execute(
        select(User).offset(skip).limit(limit)
    )
    users = result.scalars().all()
    
    role_map = {0: "admin", 1: "manager", 2: "client"}
    
    return [
        {
            "id": user.id,
            "email": user.email,
            "phone": user.phone,
            "full_name": user.full_name,
            "role": role_map.get(user.role, "client"),
            "active": user.active,
            "parent_id": user.parent_id,
            "created_at": user.created_at,
        }
        for user in users
    ]
