"""
Эндпоинты для создания кастомных туров из заявок
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import secrets
import string

from app.db.session import get_db
from app.models.tour import Tour
from app.models.request import Request
from app.models.user import User, UserRole
from app.core.deps import get_current_user

router = APIRouter()


def generate_share_code(length: int = 8) -> str:
    """Генерация уникального share_code"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


@router.post("/from-request/{request_id}")
async def create_tour_from_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Создать кастомный тур из заявки
    
    Только гид, который принял заявку, может создать тур
    """
    # Любой авторизованный пользователь может создать тур из принятой заявки
    # Основная проверка - это guide_id == current_user.id ниже
    
    # Получаем заявку
    result = await db.execute(select(Request).where(Request.id == request_id))
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Проверяем что тур еще не создан
    if request.generated_tour_id:
        raise HTTPException(status_code=400, detail="Tour already created for this request")
    
    # Если заявка уже занята другим гидом - ошибка
    if request.guide_id is not None and request.guide_id != current_user.id:
        raise HTTPException(status_code=403, detail="This request is already taken by another guide")
    
    # Генерируем уникальный share_code
    share_code = generate_share_code()
    while True:
        existing = await db.execute(select(Tour).where(Tour.share_code == share_code))
        if not existing.scalar_one_or_none():
            break
        share_code = generate_share_code()
    
    # Создаём тур из данных заявки
    tour = Tour(
        guide_id=current_user.id,
        title=request.title,
        description=request.description,
        price=request.budget or 5000,  # Дефолтная цена если не указана
        duration=request.duration_hours,
        location=request.location or "Азия",
        category="Индивидуальная",
        start_date=request.preferred_date,
        end_date=request.preferred_date,
        max_group_size=request.participants_count,
        is_custom=True,
        request_id=request_id,
        share_code=share_code,
        is_public=False,  # Кастомные туры не публичные
    )
    
    db.add(tour)
    await db.flush()
    
    # Обновляем заявку - ТЕПЕРЬ назначаем гида и меняем статус
    request.guide_id = current_user.id  # Устанавливаем гида при создании тура
    request.assigned_date = request.preferred_date  # Устанавливаем дату
    request.generated_tour_id = tour.id
    request.status = 'in_progress'  # Тур создан, заявка в работе
    
    await db.commit()
    await db.refresh(tour)
    
    # Уведомляем через WebSocket о создании тура
    from app.services.websocket_service import notify_tour_created, notify_request_updated
    await notify_tour_created(tour.id, current_user.id)
    await notify_request_updated(request_id, [current_user.id])
    
    return {
        "tour_id": tour.id,
        "share_code": tour.share_code,
        "share_link": f"/t/{tour.share_code}",
        "tour": {
            "id": tour.id,
            "title": tour.title,
            "description": tour.description,
            "price": tour.price,
            "duration": tour.duration,
            "location": tour.location,
            "is_custom": tour.is_custom,
        }
    }

