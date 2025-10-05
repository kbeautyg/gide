"""
Эндпоинты управления пользователями
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_id
from app.db.session import get_db
from app.services.user_service import UserService

router = APIRouter()


class UserProfile(BaseModel):
    """Профиль пользователя"""
    id: str
    phone: str
    email: Optional[str] = None
    name: Optional[str] = None
    role: str
    balance_rub: float = 0.0
    balance_usd: float = 0.0
    balance_thb: float = 0.0


@router.get("/me", response_model=UserProfile)
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Получение профиля текущего пользователя
    """
    user = await UserService.get_user_by_id(db, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    return UserProfile(
        id=user.id,
        phone=user.phone,
        email=user.email,
        name=user.name,
        role=user.role.value,
        balance_rub=user.balance_rub,
        balance_usd=user.balance_usd,
        balance_thb=user.balance_thb
    )
