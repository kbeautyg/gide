"""
Эндпоинты для работы с профилями пользователей
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
from typing import Dict, Any

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.tour import Tour
from app.models.booking import Booking
from app.core.deps import get_current_user

router = APIRouter()


@router.get("/{user_id}")
async def get_user_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить профиль пользователя.
    Доступно:
    - Супер-админ: все профили
    - Админ: профили своей команды
    - Супер-менеджер: профили своей команды
    - Менеджер: профили своей команды
    - Сам пользователь: свой профиль
    """
    # Получаем пользователя
    stmt = select(User).where(User.id == user_id)
    user = (await db.execute(stmt)).scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Проверка прав доступа
    if current_user.role == UserRole.SUPER_ADMIN:
        # Супер-админ видит всех
        pass
    elif current_user.id == user_id:
        # Пользователь видит свой профиль
        pass
    elif current_user.role in [UserRole.ADMIN, UserRole.SUPER_MANAGER, UserRole.MANAGER]:
        # Проверяем, является ли user частью команды current_user
        if user.parent_id != current_user.id:
            # Проверяем более глубокую иерархию
            parent = user
            found = False
            depth = 0
            while parent and parent.parent_id and depth < 10:
                if parent.parent_id == current_user.id:
                    found = True
                    break
                parent_stmt = select(User).where(User.id == parent.parent_id)
                parent = (await db.execute(parent_stmt)).scalar_one_or_none()
                depth += 1
            
            if not found:
                raise HTTPException(status_code=403, detail="Недостаточно прав для просмотра этого профиля")
    else:
        raise HTTPException(status_code=403, detail="Недостаточно прав для просмотра профилей")
    
    # Получаем статистику
    # Количество созданных экскурсий (если гид/менеджер)
    tours_count = 0
    if user.role in [UserRole.MANAGER, UserRole.GUIDE]:
        tours_stmt = select(func.count()).select_from(Tour).where(Tour.guide_id == user.id)
        tours_count = (await db.execute(tours_stmt)).scalar_one()
    
    # Количество бронирований (если клиент)
    bookings_count = 0
    if user.role == UserRole.CLIENT:
        bookings_stmt = select(func.count()).select_from(Booking).where(Booking.client_id == user.id)
        bookings_count = (await db.execute(bookings_stmt)).scalar_one()
    
    # Количество подчиненных
    children_stmt = select(func.count()).select_from(User).where(User.parent_id == user.id)
    team_count = (await db.execute(children_stmt)).scalar_one()
    
    # Получаем родителя (кто создал)
    parent = None
    if user.parent_id:
        parent_stmt = select(User).where(User.id == user.parent_id)
        parent_user = (await db.execute(parent_stmt)).scalar_one_or_none()
        if parent_user:
            parent = {
                "id": parent_user.id,
                "name": parent_user.name,
                "phone": parent_user.phone,
                "role": parent_user.role.value
            }
    
    return {
        "id": user.id,
        "phone": user.phone,
        "email": user.email,
        "name": user.name,
        "role": user.role.value,
        "balance_rub": user.balance_rub,
        "balance_usd": user.balance_usd,
        "balance_thb": user.balance_thb,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        "parent": parent,
        "stats": {
            "tours_count": tours_count,
            "bookings_count": bookings_count,
            "team_count": team_count
        }
    }


@router.get("/{user_id}/statistics")
async def get_user_statistics(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить детальную статистику пользователя для графиков
    """
    # Проверка прав доступа (та же логика)
    stmt = select(User).where(User.id == user_id)
    user = (await db.execute(stmt)).scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Упрощенная проверка прав
    if current_user.role != UserRole.SUPER_ADMIN and current_user.id != user_id:
        if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_MANAGER, UserRole.MANAGER]:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    # Получаем статистику за последние 30 дней
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    # Бронирования по дням (для клиента)
    bookings_by_day = []
    if user.role == UserRole.CLIENT:
        stmt = select(
            func.date(Booking.created_at).label('date'),
            func.count().label('count')
        ).where(
            Booking.client_id == user.id,
            Booking.created_at >= thirty_days_ago
        ).group_by(func.date(Booking.created_at))
        
        result = await db.execute(stmt)
        bookings_by_day = [{"date": str(row.date), "count": row.count} for row in result]
    
    # Экскурсии по статусу (для менеджера/гида)
    tours_by_status = []
    if user.role in [UserRole.MANAGER, UserRole.GUIDE]:
        stmt = select(
            Tour.active,
            func.count().label('count')
        ).where(
            Tour.guide_id == user.id
        ).group_by(Tour.active)
        
        result = await db.execute(stmt)
        tours_by_status = [{"status": "active" if row.active else "inactive", "count": row.count} for row in result]
    
    # Команда по ролям (для менеджеров и выше)
    team_by_role = []
    if user.role in [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPER_MANAGER, UserRole.MANAGER]:
        stmt = select(
            User.role,
            func.count().label('count')
        ).where(
            User.parent_id == user.id
        ).group_by(User.role)
        
        result = await db.execute(stmt)
        team_by_role = [{"role": row.role.value, "count": row.count} for row in result]
    
    return {
        "bookings_by_day": bookings_by_day,
        "tours_by_status": tours_by_status,
        "team_by_role": team_by_role
    }


@router.put("/{user_id}/role")
async def assign_role(
    user_id: int,
    new_role: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Назначить роль пользователю.
    Правила:
    - Супер-админ → может назначить любую роль
    - Админ → может назначить super_manager или manager
    - Супер-менеджер → может назначить manager
    - Остальные → не могут назначать роли
    """
    # Проверка прав
    if current_user.role == UserRole.SUPER_ADMIN:
        # Может назначить любую роль
        allowed_roles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPER_MANAGER, UserRole.MANAGER, UserRole.GUIDE, UserRole.CLIENT]
    elif current_user.role == UserRole.ADMIN:
        # Может назначить super_manager или manager
        allowed_roles = [UserRole.SUPER_MANAGER, UserRole.MANAGER]
    elif current_user.role == UserRole.SUPER_MANAGER:
        # Может назначить manager
        allowed_roles = [UserRole.MANAGER]
    else:
        raise HTTPException(status_code=403, detail="Недостаточно прав для назначения ролей")
    
    # Проверяем, что новая роль разрешена
    try:
        new_role_enum = UserRole(new_role)
    except ValueError:
        raise HTTPException(status_code=400, detail="Неверная роль")
    
    if new_role_enum not in allowed_roles:
        raise HTTPException(status_code=403, detail=f"Вы не можете назначить роль {new_role}")
    
    # Получаем пользователя
    stmt = select(User).where(User.id == user_id)
    user = (await db.execute(stmt)).scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Проверяем, что это пользователь из команды (кроме супер-админа)
    if current_user.role != UserRole.SUPER_ADMIN:
        if user.parent_id != current_user.id:
            raise HTTPException(status_code=403, detail="Вы можете назначать роли только своей команде")
    
    # Обновляем роль
    user.role = new_role_enum
    user.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(user)
    
    return {
        "message": f"Роль пользователя {user.name or user.phone} успешно изменена на {new_role}",
        "user": {
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "role": user.role.value
        }
    }
