"""
Эндпоинты управления пользователями
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.security import get_current_user_id

router = APIRouter()


class UserProfile(BaseModel):
    """Профиль пользователя"""
    id: str
    phone: str
    email: str | None = None
    name: str | None = None
    role: str
    balance_rub: float = 0.0
    balance_usd: float = 0.0
    balance_thb: float = 0.0


@router.get("/me", response_model=UserProfile)
async def get_current_user(user_id: str = Depends(get_current_user_id)):
    """
    Получение профиля текущего пользователя
    
    TODO: Подключить реальную БД
    """
    # Временная заглушка
    return UserProfile(
        id=user_id,
        phone="+79999999999",
        email="user@example.com",
        name="Тестовый пользователь",
        role="manager",
        balance_rub=0.0,
        balance_usd=0.0,
        balance_thb=0.0
    )
