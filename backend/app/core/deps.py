"""
Dependencies для проверки прав доступа
"""
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_id
from app.db.session import get_db
from app.services.user_service import UserService
from app.models.user import User, UserRole


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> User:
    """Получение текущего пользователя из БД"""
    user_id_str = get_current_user_id(request)
    
    try:
        user_id = int(user_id_str)
    except ValueError:
        # Если не удалось конвертировать в int (например, "demo_user")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Требуется авторизация"
        )
    
    user = await UserService.get_user_by_id(db, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден"
        )
    
    return user


async def get_current_user_optional(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Получение текущего пользователя из БД (опционально, без исключения)"""
    try:
        user_id_str = get_current_user_id(request)
        user_id = int(user_id_str)
        user = await UserService.get_user_by_id(db, user_id)
        return user
    except:
        return None


class RoleChecker:
    """Проверка роли пользователя"""
    
    def __init__(self, allowed_roles: list[UserRole]):
        self.allowed_roles = allowed_roles
    
    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Доступ запрещен. Требуется роль: {', '.join([r.value for r in self.allowed_roles])}"
            )
        return current_user


# Готовые dependency для проверки ролей
require_admin = RoleChecker([UserRole.ADMIN])
require_manager = RoleChecker([UserRole.ADMIN, UserRole.MANAGER])


def check_hierarchy(current_user: User, target_user: User) -> bool:
    """
    Проверка иерархии: может ли current_user управлять target_user
    
    Правила:
    - Админ может управлять всеми гидами
    - Гид может управлять только своими клиентами
    """
    # Админ может управлять всеми
    if current_user.role == UserRole.ADMIN:
        return True
    
    # Проверяем прямую иерархию
    if target_user.parent_id == current_user.id:
        return True
    
    return False
