"""
Эндпоинты управления пользователями
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
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
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Получение профиля текущего пользователя
    """
    try:
        user_id = get_current_user_id(request)
        
        # Пытаемся получить пользователя из БД
        try:
            user_id_int = int(user_id)
            user = await UserService.get_user_by_id(db, user_id_int)
        except ValueError:
            # ID is UUID string from fallback
            user = None
        
        if not user:
            # Fallback для демо-режима
            return UserProfile(
                id=user_id,
                phone="+79999999999",
                email="demo@thaiguide.pro",
                name="Демо пользователь",
                role="manager",
                balance_rub=0.0,
                balance_usd=0.0,
                balance_thb=0.0
            )
        
        return UserProfile(
            id=str(user.id),
            phone=user.phone,
            email=user.email,
            name=user.name,
            role=user.role.value,
            balance_rub=user.balance_rub,
            balance_usd=user.balance_usd,
            balance_thb=user.balance_thb
        )
    except Exception as e:
        print(f"❌ Ошибка get_current_user: {e}")
        # Fallback
        return UserProfile(
            id=user_id,
            phone="+79999999999",
            email="demo@thaiguide.pro",
            name="Демо пользователь",
            role="manager",
            balance_rub=0.0,
            balance_usd=0.0,
            balance_thb=0.0
        )
