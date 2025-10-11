"""
Эндпоинты для работы с заявками клиентов
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from datetime import datetime

from app.db.session import get_db
from app.models.request import Request
from app.models.user import User, UserRole
from app.schemas.request import (
    RequestCreate,
    RequestUpdate,
    RequestTake,
    Request as RequestSchema,
    RequestList,
    RequestAvailableList
)
from app.core.deps import get_current_user

router = APIRouter()


@router.post("/", response_model=RequestSchema)
async def create_request(
    request_data: RequestCreate,
    db: AsyncSession = Depends(get_db)
):
    """Создать заявку на экскурсию (доступно всем, даже неавторизованным)"""
    
    # Для неавторизованных пользователей используем client_id = 1 (супер-админ)
    # В реальном проекте можно создать отдельную таблицу для анонимных заявок
    db_request = Request(
        client_id=1,  # Супер-админ как владелец анонимных заявок
        title=request_data.title,
        description=request_data.description,
        preferred_date=request_data.preferred_date,
        participants_count=request_data.participants_count,
        budget=request_data.budget,
        location=request_data.location,
        duration_hours=request_data.duration_hours,
        status='pending'
    )
    
    db.add(db_request)
    await db.commit()
    await db.refresh(db_request)
    
    return db_request


@router.get("/", response_model=RequestList)
async def get_requests(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить список заявок"""
    # Проверяем права доступа
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPER_MANAGER, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Недостаточно прав для просмотра заявок")
    
    query = select(Request)
    
    # Фильтр по статусу
    if status:
        query = query.where(Request.status == status)
    
    # Если не супер-админ, показываем только заявки назначенные им или их команде
    if current_user.role != UserRole.SUPER_ADMIN:
        if current_user.role == UserRole.ADMIN:
            # Админ видит заявки назначенные ему или его команде
            query = query.where(
                or_(
                    Request.assigned_to == current_user.id,
                    Request.assigned_to.in_(
                        select(User.id).where(User.parent_id == current_user.id)
                    )
                )
            )
        elif current_user.role == UserRole.SUPER_MANAGER:
            # Супер-менеджер видит заявки назначенные ему или его команде
            query = query.where(
                or_(
                    Request.assigned_to == current_user.id,
                    Request.assigned_to.in_(
                        select(User.id).where(User.parent_id == current_user.id)
                    )
                )
            )
        elif current_user.role == UserRole.MANAGER:
            # Менеджер видит только заявки назначенные ему
            query = query.where(Request.assigned_to == current_user.id)
    
    # Подсчет общего количества
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Пагинация
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    
    result = await db.execute(query)
    requests = result.scalars().all()
    
    return RequestList(
        requests=requests,
        total=total,
        page=page,
        per_page=per_page
    )


@router.get("/my", response_model=RequestList)
async def get_my_requests(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить мои заявки (для клиентов)"""
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(status_code=403, detail="Только клиенты могут просматривать свои заявки")
    
    query = select(Request).where(Request.client_id == current_user.id)
    
    # Подсчет общего количества
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Пагинация
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    
    result = await db.execute(query)
    requests = result.scalars().all()
    
    return RequestList(
        requests=requests,
        total=total,
        page=page,
        per_page=per_page
    )


@router.get("/available")
async def get_available_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получить список непринятых заявок (для всех авторизованных)"""
    # Доступно для всех авторизованных пользователей
    
    # Заявки без назначенного гида
    query = select(Request).where(
        Request.guide_id.is_(None),
        Request.status == 'pending'
    ).order_by(Request.created_at.desc())
    
    result = await db.execute(query)
    requests_list = result.scalars().all()
    
    # Преобразуем в словари вручную для обхода проблем с сериализацией
    requests_dicts = []
    for req in requests_list:
        requests_dicts.append({
            "id": req.id,
            "client_id": req.client_id,
            "title": req.title,
            "description": req.description,
            "preferred_date": req.preferred_date.isoformat() if req.preferred_date else None,
            "participants_count": req.participants_count,
            "budget": req.budget,
            "location": req.location,
            "duration_hours": req.duration_hours,
            "telegram_username": req.telegram_username,
            "status": req.status,
            "guide_id": req.guide_id,
            "assigned_date": req.assigned_date.isoformat() if req.assigned_date else None,
            "assigned_to": req.assigned_to,
            "booking_id": req.booking_id,
            "generated_tour_id": req.generated_tour_id,
            "created_at": req.created_at.isoformat() if req.created_at else None,
            "updated_at": req.updated_at.isoformat() if req.updated_at else None,
        })
    
    return {"requests": requests_dicts, "total": len(requests_dicts)}


@router.get("/my-schedule")
async def get_my_schedule(
    start_date: str,
    end_date: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получить расписание гида с заявками и турами"""
    from app.services.schedule_service import ScheduleService
    from app.models.tour import Tour
    from datetime import datetime
    
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()
    
    schedules = await ScheduleService.get_schedule_range(db, current_user.id, start, end)
    
    # Получаем заявки текущего гида с assigned_date в диапазоне
    requests_result = await db.execute(
        select(Request).where(
            Request.guide_id == current_user.id,
            Request.assigned_date.isnot(None),
            Request.assigned_date >= start,
            Request.assigned_date <= end
        )
    )
    requests_list = requests_result.scalars().all()
    
    # Преобразуем в словари
    requests = []
    for req in requests_list:
        requests.append({
            "id": req.id,
            "title": req.title,
            "description": req.description,
            "assigned_date": req.assigned_date.isoformat() if req.assigned_date else None,
            "preferred_date": req.preferred_date.isoformat() if req.preferred_date else None,
            "duration_hours": req.duration_hours,
            "participants_count": req.participants_count,
            "budget": req.budget,
            "location": req.location,
            "status": req.status,
            "telegram_username": req.telegram_username,
            "generated_tour_id": req.generated_tour_id,
        })
    
    # Загружаем туры гида в заданном диапазоне дат
    tours_result = await db.execute(
        select(Tour).where(
            Tour.guide_id == current_user.id,
            Tour.active == True,
            or_(
                and_(Tour.start_date >= start, Tour.start_date <= end),
                and_(Tour.end_date >= start, Tour.end_date <= end),
                and_(Tour.start_date <= start, Tour.end_date >= end)
            )
        )
    )
    tours = tours_result.scalars().all()
    
    # Преобразуем туры в словари
    tours_dicts = []
    for tour in tours:
        tours_dicts.append({
            "id": tour.id,
            "title": tour.title,
            "description": tour.description,
            "start_date": tour.start_date.isoformat() if tour.start_date else None,
            "end_date": tour.end_date.isoformat() if tour.end_date else None,
            "duration": tour.duration,
            "price": tour.price,
            "location": tour.location,
            "category": tour.category,
            "is_custom": tour.is_custom,
            "share_code": tour.share_code,
        })
    
    return {
        "schedules": [
            {
                "date": str(s.date),
                "booked_hours": s.booked_hours,
                "available_hours": s.available_hours
            } for s in schedules
        ],
        "requests": requests,
        "tours": tours_dicts
    }


@router.get("/{request_id}", response_model=RequestSchema)
async def get_request_by_id(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить заявку по ID"""
    stmt = select(Request).where(Request.id == request_id)
    result = await db.execute(stmt)
    request = result.scalar_one_or_none()

    if not request:
        raise HTTPException(status_code=404, detail="Заявка не найдена")

    # Проверяем права
    if current_user.role == UserRole.CLIENT and request.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Недостаточно прав")

    return request


@router.put("/{request_id}", response_model=RequestSchema)
async def update_request(
    request_id: int,
    request_data: RequestUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Обновить заявку"""
    stmt = select(Request).where(Request.id == request_id)
    result = await db.execute(stmt)
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    
    # Проверяем права
    if current_user.role == UserRole.CLIENT:
        if request.client_id != current_user.id:
            raise HTTPException(status_code=403, detail="Можно редактировать только свои заявки")
    elif current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPER_MANAGER, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Недостаточно прав для редактирования заявок")
    
    # Обновляем поля
    for field, value in request_data.dict(exclude_unset=True).items():
        setattr(request, field, value)
    
    request.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(request)
    
    return request


@router.delete("/{request_id}")
async def delete_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Удалить заявку"""
    stmt = select(Request).where(Request.id == request_id)
    result = await db.execute(stmt)
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    
    # Проверяем права
    if current_user.role == UserRole.CLIENT:
        if request.client_id != current_user.id:
            raise HTTPException(status_code=403, detail="Можно удалять только свои заявки")
    elif current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Недостаточно прав для удаления заявок")
    
    await db.delete(request)
    await db.commit()
    
    return {"message": "Заявка удалена"}


@router.post("/{request_id}/take")
async def take_request(
    request_id: int,
    data: RequestTake,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Взять заявку на дату"""
    from app.services.schedule_service import ScheduleService
    from datetime import datetime
    
    # Доступно для всех авторизованных (любая роль может быть гидом)
    
    # Находим заявку
    query = select(Request).where(Request.id == request_id)
    result = await db.execute(query)
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    
    if request.guide_id is not None:
        raise HTTPException(status_code=400, detail="Заявка уже взята другим гидом")
    
    # Парсим дату
    assigned_date = data.assigned_date
    
    # Проверяем доступность гида на эту дату
    available = await ScheduleService.check_availability(
        db, current_user.id, assigned_date, request.duration_hours
    )
    
    if not available:
        schedule = await ScheduleService.get_or_create_schedule(db, current_user.id, assigned_date)
        raise HTTPException(
            status_code=400,
            detail=f"Недостаточно времени на {assigned_date}. Занято: {schedule.booked_hours}/8ч, требуется: {request.duration_hours}ч"
        )
    
    # Бронируем время
    await ScheduleService.book_hours(db, current_user.id, assigned_date, request.duration_hours)
    
    # Назначаем заявку гиду
    request.guide_id = current_user.id
    request.assigned_date = assigned_date
    request.status = 'assigned'
    
    await db.commit()
    await db.refresh(request)
    
    return request


@router.post("/{request_id}/accept", response_model=RequestSchema)
async def accept_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Гид принимает заявку
    
    Назначает guide_id, assigned_date, статус остаётся 'pending' до создания тура
    """
    # Проверяем что пользователь - гид
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only guides can accept requests")
    
    # Получаем заявку
    result = await db.execute(select(Request).where(Request.id == request_id))
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.guide_id is not None:
        raise HTTPException(status_code=400, detail="Request is already taken by another guide")
    
    # Назначаем гида и дату, статус остаётся pending
    request.guide_id = current_user.id
    request.assigned_date = request.preferred_date  # Используем preferred_date
    # Статус остаётся 'pending' - изменится на 'in_progress' при создании тура
    
    await db.commit()
    await db.refresh(request)
    
    return request


@router.put("/{request_id}/reschedule")
async def reschedule_request(
    request_id: str,
    data: dict,  # {"new_date": "2025-10-22"}
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Перенести заявку на другую дату"""
    from app.services.schedule_service import ScheduleService
    from datetime import datetime
    
    # Находим заявку
    query = select(Request).where(Request.id == int(request_id))
    result = await db.execute(query)
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    
    if request.guide_id != current_user.id:
        raise HTTPException(status_code=403, detail="Можно переносить только свои заявки")
    
    old_date = request.assigned_date
    new_date = datetime.strptime(data.get("new_date"), "%Y-%m-%d").date()
    
    # Проверяем новую дату
    available = await ScheduleService.check_availability(
        db, current_user.id, new_date, request.duration_hours
    )
    
    if not available:
        schedule = await ScheduleService.get_or_create_schedule(db, current_user.id, new_date)
        raise HTTPException(
            status_code=400,
            detail=f"Недостаточно времени на {new_date}. Занято: {schedule.booked_hours}/8ч"
        )
    
    # Освобождаем старое время
    if old_date:
        await ScheduleService.free_hours(db, current_user.id, old_date, request.duration_hours)
    
    # Бронируем новое время
    await ScheduleService.book_hours(db, current_user.id, new_date, request.duration_hours)
    
    # Обновляем дату заявки
    request.assigned_date = new_date
    
    await db.commit()
    await db.refresh(request)
    
    return request


@router.put("/{request_id}/cancel")
async def cancel_request(
    request_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отменить заявку и освободить часы"""
    from app.services.schedule_service import ScheduleService
    
    # Находим заявку
    query = select(Request).where(Request.id == int(request_id))
    result = await db.execute(query)
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    
    if request.guide_id != current_user.id:
        raise HTTPException(status_code=403, detail="Можно отменять только свои заявки")
    
    # Освобождаем часы если заявка была на дату
    if request.assigned_date and request.guide_id:
        await ScheduleService.free_hours(
            db, 
            request.guide_id, 
            request.assigned_date, 
            request.duration_hours
        )
    
    # Обновляем статус и убираем гида
    request.status = 'cancelled'
    request.guide_id = None
    request.assigned_date = None
    
    await db.commit()
    await db.refresh(request)
    
    return {"message": f"Заявка отменена, освобождено {request.duration_hours}ч", "request": request}
