"""
Эндпоинты для уведомлений
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, update, func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification

router = APIRouter()


# --- Pydantic Models ---

class NotificationSchema(BaseModel):
    id: int
    title: str
    message: str
    type: str
    link: Optional[str]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationsResponse(BaseModel):
    notifications: List[NotificationSchema]
    unread_count: int


# --- Helper: создание уведомления (вызывается из других модулей) ---

async def create_notification(
    db: AsyncSession,
    user_id: int,
    title: str,
    message: str,
    type: str = "info",
    link: Optional[str] = None,
):
    """
    Создать уведомление для пользователя.
    Вызывается из bookings, tours и других модулей.
    
    Использует SAVEPOINT чтобы ошибка при вставке уведомления
    НЕ ломала основную транзакцию (бронирование и т.д.).
    """
    try:
        async with db.begin_nested():
            notification = Notification(
                user_id=user_id,
                title=title,
                message=message,
                type=type,
                link=link,
                is_read=False,
                created_at=datetime.utcnow(),
            )
            db.add(notification)
            # begin_nested() сделает flush при выходе из контекста
        return notification
    except Exception as e:
        print(f"⚠️ Notification insert failed (savepoint rolled back): {e}")
        return None


# --- Endpoints ---

@router.get("/", response_model=NotificationsResponse)
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
):
    """
    Получить уведомления текущего пользователя (последние N)
    """
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(desc(Notification.created_at))
        .limit(limit)
    )
    notifications = result.scalars().all()

    # Считаем непрочитанные
    unread_result = await db.execute(
        select(func.count(Notification.id))
        .where(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
    )
    unread_count = unread_result.scalar() or 0

    return NotificationsResponse(
        notifications=[
            NotificationSchema(
                id=n.id,
                title=n.title,
                message=n.message,
                type=n.type or "info",
                link=n.link,
                is_read=n.is_read,
                created_at=n.created_at,
            )
            for n in notifications
        ],
        unread_count=unread_count,
    )


@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Отметить уведомление как прочитанное"""
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
    )
    notification = result.scalar_one_or_none()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    await db.commit()

    return {"success": True}


@router.post("/read-all")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Отметить все уведомления как прочитанные"""
    await db.execute(
        update(Notification)
        .where(
            Notification.user_id == current_user.id,
            Notification.is_read == False,
        )
        .values(is_read=True)
    )
    await db.commit()

    return {"success": True}
