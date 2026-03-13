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
from app.models.user import User, GuideStatus, UserRole

router = APIRouter()


class UserProfile(BaseModel):
    """Профиль пользователя"""
    id: str
    phone: str
    email: Optional[str] = None
    name: Optional[str] = None
    role: str
    guide_status: Optional[str] = "none"
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
                guide_status="none",
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
            guide_status=getattr(user, "guide_status", "none").value if hasattr(user, "guide_status") and hasattr(getattr(user, "guide_status"), "value") else str(getattr(user, "guide_status", "none")),
            balance_rub=user.balance_rub,
            balance_usd=user.balance_usd,
            balance_thb=user.balance_thb
        )
    except Exception as e:
        print(f"❌ Ошибка get_current_user: {e}")
        # Fallback
        import uuid
        user_id = str(uuid.uuid4())
        return UserProfile(
            id=user_id,
            phone="+79999999999",
            email="demo@thaiguide.pro",
            name="Демо пользователь",
            role="manager",
            guide_status="none",
            balance_rub=0.0,
            balance_usd=0.0,
            balance_thb=0.0
        )


@router.post("/apply-guide")
async def apply_guide(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Подача заявки на получение статуса гида
    """
    user_id = get_current_user_id(request)
    
    try:
        user_id_int = int(user_id)
        user = await UserService.get_user_by_id(db, user_id_int)
    except ValueError:
        raise HTTPException(status_code=400, detail="Некорректный ID пользователя")
        
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
        
    if user.role == UserRole.MANAGER or user.role == UserRole.ADMIN:
        return {"message": "Вы уже являетесь гидом или администратором", "status": "approved"}
        
    if user.guide_status == GuideStatus.PENDING:
        return {"message": "Заявка уже на рассмотрении", "status": "pending"}
        
    if user.guide_status == GuideStatus.APPROVED:
         return {"message": "Заявка уже одобрена", "status": "approved"}
    
    # Обновляем статус
    user.guide_status = GuideStatus.PENDING
    await db.commit()
    await db.refresh(user)
    
    return {"message": "Заявка отправлена", "status": "pending"}
