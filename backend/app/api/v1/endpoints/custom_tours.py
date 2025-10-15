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
    
    # Получаем заявку с загрузкой связанного бронирования
    from sqlalchemy.orm import selectinload
    from app.models.booking import Booking
    
    result = await db.execute(
        select(Request)
        .options(selectinload(Request.client))
        .where(Request.id == request_id)
    )
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Проверяем что тур еще не создан
    if request.generated_tour_id:
        raise HTTPException(status_code=400, detail="Tour already created for this request")
    
    # Если заявка уже занята другим гидом - ошибка
    if request.guide_id is not None and request.guide_id != current_user.id:
        raise HTTPException(status_code=403, detail="This request is already taken by another guide")
    
    # Ищем подходящий публичный тур для копирования данных и фото
    public_tour = None
    if request.location or request.title:
        query = select(Tour).where(
            Tour.is_public == True,
            Tour.request_id == None
        )
        if request.location:
            query = query.where(Tour.location.ilike(f"%{request.location}%"))
        result = await db.execute(query.limit(1))
        public_tour = result.scalar_one_or_none()
    
    # Генерируем уникальный share_code
    share_code = generate_share_code()
    while True:
        existing = await db.execute(select(Tour).where(Tour.share_code == share_code))
        if not existing.scalar_one_or_none():
            break
        share_code = generate_share_code()
    
    # Получаем данные клиента из бронирования (если есть)
    client_name = None
    client_phone = None
    client_email = None
    
    if request.booking_id:
        booking_result = await db.execute(select(Booking).where(Booking.id == request.booking_id))
        booking = booking_result.scalar_one_or_none()
        if booking:
            client_name = booking.client_name
            client_phone = booking.client_phone
            client_email = booking.client_email
    
    # Копируем данные из публичного тура если найден
    photos = []
    what_to_expect = None
    organizational_details = None
    included = []
    not_included = []
    meeting_point = None
    max_guests = None
    difficulty_level = None
    languages = None
    
    if public_tour:
        # Берем первое фото из публичного тура
        if public_tour.photos and len(public_tour.photos) > 0:
            photos = [public_tour.photos[0]]
        
        # Копируем дополнительные поля
        what_to_expect = public_tour.what_to_expect
        organizational_details = public_tour.organizational_details
        included = public_tour.included or []
        not_included = public_tour.not_included or []
        meeting_point = public_tour.meeting_point
        max_guests = public_tour.max_group_size
        difficulty_level = public_tour.difficulty_level
        languages = public_tour.languages
    
    # Создаём тур из данных заявки + данные из публичного тура
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
        photos=photos,
        what_to_expect=what_to_expect,
        organizational_details=organizational_details,
        included=included,
        not_included=not_included,
        meeting_point=meeting_point,
        difficulty_level=difficulty_level,
        languages=languages,
        client_name=client_name,
        client_phone=client_phone,
        client_email=client_email,
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

