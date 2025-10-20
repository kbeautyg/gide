"""
Эндпоинты для работы с экскурсиями
"""
from fastapi import APIRouter, Query, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.services.tour_service import TourService
from app.services.recommendation_service import RecommendationService
from app.models.booking import Booking
from app.core.deps import get_current_user, get_current_user_optional
from app.models.user import User, UserRole

router = APIRouter()


class Tour(BaseModel):
    """Модель экскурсии"""
    id: int
    share_code: Optional[str] = Field(None, description="Уникальный код для шаринга")
    title: str = Field(..., description="Название экскурсии")
    description: str = Field(..., description="Описание")
    price: float = Field(..., description="Цена в RUB")
    duration: int = Field(..., description="Длительность в часах")
    location: str = Field(..., description="Локация (Пхукет, Паттайя, и т.д.)")
    category: str = Field(..., description="Категория (культура, природа, пляж)")
    photos: List[str] = Field(default_factory=list, description="Ссылки на фото")
    rating: float = Field(default=0.0, description="Рейтинг (0-5)")
    reviews_count: int = Field(default=0, description="Количество отзывов")
    guide_name: str = Field(..., description="Имя гида")
    guide_id: int = Field(..., description="ID гида")
    active: bool = Field(default=True, description="Активна ли экскурсия")
    created_at: datetime = Field(default_factory=datetime.now)
    bookings_count: int = Field(default=0, description="Количество бронирований")
    total_revenue: float = Field(default=0.0, description="Общий доход с экскурсии")
    is_public: bool = Field(default=False, description="Опубликована ли экскурсия в каталоге")
    
    # Даты и статус
    start_date: Optional[str] = Field(None, description="Дата начала экскурсии")
    end_date: Optional[str] = Field(None, description="Дата окончания экскурсии")
    is_custom: Optional[bool] = Field(default=False, description="Кастомная экскурсия из заявки")
    is_archived: Optional[bool] = Field(default=False, description="Архивная экскурсия (оплачена)")
    
    # Данные клиента (для кастомных туров)
    client_name: Optional[str] = Field(None, description="Имя клиента")
    client_phone: Optional[str] = Field(None, description="Телефон клиента")
    client_email: Optional[str] = Field(None, description="Email клиента")
    client_telegram: Optional[str] = Field(None, description="Telegram username клиента")
    
    # Контентные блоки
    what_to_expect: Optional[str] = Field(None, description="Что вас ожидает")
    organizational_details: Optional[str] = Field(None, description="Организационные детали")
    included: Optional[List[str]] = Field(default_factory=list, description="Что включено")
    not_included: Optional[List[str]] = Field(default_factory=list, description="Что НЕ включено")
    meeting_point: Optional[str] = Field(None, description="Точка встречи")
    
    # Параметры
    languages: Optional[List[str]] = Field(default_factory=list, description="Языки")
    max_group_size: Optional[int] = Field(None, description="Макс. размер группы")
    min_age: Optional[int] = Field(None, description="Минимальный возраст")
    difficulty_level: Optional[str] = Field(None, description="Сложность")
    
    # Метаданные
    landmarks: Optional[List[str]] = Field(default_factory=list, description="Достопримечательности")
    tags: Optional[List[str]] = Field(default_factory=list, description="Теги")
    themes: Optional[List[str]] = Field(default_factory=list, description="Темы")
    formats: Optional[List[str]] = Field(default_factory=list, description="Форматы")
    
    # SEO
    seo_title: Optional[str] = Field(None, description="SEO заголовок")
    seo_description: Optional[str] = Field(None, description="SEO описание")
    long_description: Optional[str] = Field(None, description="Подробное описание")


class TourCreate(BaseModel):
    """Создание экскурсии"""
    title: str
    description: str
    price: float
    duration: int
    location: str
    category: str
    photos: List[str] = []
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class TourList(BaseModel):
    """Список экскурсий"""
    tours: List[Tour]
    total: int
    page: int
    page_size: int


@router.get("/", response_model=TourList)
async def get_tours(
    db: AsyncSession = Depends(get_db),
    location: Optional[str] = Query(None, description="Фильтр по локации (город или страна)"),
    category: Optional[str] = Query(None, description="Фильтр по категории"),
    min_price: Optional[float] = Query(None, description="Минимальная цена"),
    max_price: Optional[float] = Query(None, description="Максимальная цена"),
    date_start: Optional[str] = Query(None, description="Дата начала (yyyy-MM-dd)"),
    date_end: Optional[str] = Query(None, description="Дата окончания (yyyy-MM-dd)"),
    guests: Optional[int] = Query(None, description="Количество гостей"),
    duration_min: Optional[int] = Query(None, description="Минимальная длительность (часы)"),
    duration_max: Optional[int] = Query(None, description="Максимальная длительность (часы)"),
    rating_min: Optional[float] = Query(None, description="Минимальный рейтинг"),
    type: Optional[str] = Query(None, description="Тип: tours или experiences"),
    search: Optional[str] = Query(None, description="Полнотекстовый поиск"),
    themes: Optional[str] = Query(None, description="Фильтр по темам (через запятую)"),
    tags: Optional[str] = Query(None, description="Фильтр по тегам (через запятую)"),
    landmarks: Optional[str] = Query(None, description="Фильтр по достопримечательностям (через запятую)"),
    page: int = Query(1, ge=1, description="Номер страницы"),
    page_size: int = Query(12, ge=1, le=100, description="Размер страницы"),
    include_private: bool = Query(False, description="Включать ли приватные экскурсии (только по токену гида)"),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Получение списка экскурсий с фильтрами
    
    Публичный эндпоинт - доступен без авторизации
    Поддерживает полный набор параметров для поиска по типу Airbnb
    """
    # Проверяем авторизацию для приватных экскурсий
    if include_private and not current_user:
        raise HTTPException(status_code=401, detail="Необходима авторизация для просмотра приватных экскурсий")
    
    # Получаем экскурсии из БД
    guide_id = current_user.id if current_user else None

    tours_db, total = await TourService.get_tours(
        db=db,
        location=location,
        category=category,
        min_price=min_price,
        max_price=max_price,
        date_start=date_start,
        date_end=date_end,
        guests=guests,
        duration_min=duration_min,
        duration_max=duration_max,
        rating_min=rating_min,
        tour_type=type,
        search=search,
        themes=themes,
        tags=tags,
        landmarks=landmarks,
        page=page,
        page_size=page_size,
        include_private=include_private,
        guide_id=guide_id,
    )
    
    # Преобразуем в Pydantic модели с статистикой
    tours_list = []
    for tour_db in tours_db:
        # Получаем статистику для каждой экскурсии
        bookings_result = await db.execute(
            select(
                func.count(Booking.id).label('count'),
                func.sum(Booking.total_price).label('revenue')
            ).where(Booking.tour_id == tour_db.id, Booking.payment_status == 'paid')
        )
        stats = bookings_result.first()
        bookings_count = stats.count if stats.count else 0
        total_revenue = float(stats.revenue) if stats.revenue else 0.0
        
        # Считаем РЕАЛЬНОЕ количество отзывов из БД
        from app.models.review import Review
        reviews_count_result = await db.execute(
            select(func.count(Review.id)).where(Review.tour_id == tour_db.id)
        )
        real_reviews_count = reviews_count_result.scalar() or 0
        
        tours_list.append(Tour(
            id=tour_db.id,
            share_code=tour_db.share_code,
            title=tour_db.title,
            description=tour_db.description,
            price=tour_db.price,
            duration=tour_db.duration,
            location=tour_db.location,
            category=tour_db.category,
            photos=tour_db.photos or [],
            rating=tour_db.rating,
            reviews_count=real_reviews_count,  # РЕАЛЬНОЕ количество из БД!
            guide_name=tour_db.guide.name or "Гид",
            guide_id=tour_db.guide_id,
            active=tour_db.active,
            created_at=tour_db.created_at,
            bookings_count=bookings_count,
            total_revenue=total_revenue,
            is_public=tour_db.is_public,
            # Даты
            start_date=str(tour_db.start_date) if tour_db.start_date else None,
            end_date=str(tour_db.end_date) if tour_db.end_date else None,
            # Данные клиента (для кастомных туров)
            client_name=tour_db.client_name,
            client_phone=tour_db.client_phone,
            client_email=tour_db.client_email,
            client_telegram=getattr(tour_db, 'client_telegram', None),  # Fallback for old DB
            is_custom=tour_db.is_custom,
            is_archived=tour_db.is_archived,
            # Контентные блоки
            what_to_expect=tour_db.what_to_expect,
            organizational_details=tour_db.organizational_details,
            included=tour_db.included or [],
            not_included=tour_db.not_included or [],
            meeting_point=tour_db.meeting_point,
            # Параметры
            languages=tour_db.languages or [],
            max_group_size=tour_db.max_group_size,
            min_age=tour_db.min_age,
            difficulty_level=tour_db.difficulty_level,
            # Метаданные
            landmarks=tour_db.landmarks or [],
            tags=tour_db.tags or [],
            themes=tour_db.themes or [],
            formats=tour_db.formats or [],
            # SEO
            seo_title=tour_db.seo_title,
            seo_description=tour_db.seo_description,
            long_description=tour_db.long_description,
        ))
    
    # Если экскурсий нет - возвращаем пустой список
    # (Удалены mock данные - пользователи создают экскурсии сами)
    
    return TourList(
        tours=tours_list,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/by-code/{share_code}")
async def get_tour_by_code(
    share_code: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Получение экскурсии по уникальному коду (для шаринга)
    
    Публичный эндпоинт без авторизации
    Возвращает тур + данные из связанной заявки для предзаполнения формы
    """
    tour_db = await TourService.get_tour_by_share_code(db, share_code)
    
    if not tour_db:
        raise HTTPException(status_code=404, detail="Экскурсия не найдена")
    
    # Получаем статистику по бронированиям
    bookings_result = await db.execute(
        select(
            func.count(Booking.id).label('count'),
            func.sum(Booking.total_price).label('revenue')
        ).where(Booking.tour_id == tour_db.id, Booking.payment_status == 'paid')
    )
    stats = bookings_result.first()
    bookings_count = stats.count if stats.count else 0
    total_revenue = float(stats.revenue) if stats.revenue else 0.0
    
    # Считаем РЕАЛЬНОЕ количество отзывов из БД
    from app.models.review import Review
    reviews_count_result = await db.execute(
        select(func.count(Review.id)).where(Review.tour_id == tour_db.id)
    )
    real_reviews_count = reviews_count_result.scalar() or 0
    
    # Получаем данные клиента из связанной заявки или бронирования
    client_data = None
    
    # Если тур создан из Request - берём данные из ОРИГИНАЛЬНОГО Booking (который создал заявку)
    if tour_db.request_id:
        try:
            from app.models.request import Request
            
            request_result = await db.execute(
                select(Request)
                .where(Request.id == tour_db.request_id)
            )
            request = request_result.scalar_one_or_none()
            
            if request and request.booking_id:
                # Получаем оригинальное бронирование, которое создало заявку
                original_booking_result = await db.execute(
                    select(Booking)
                    .where(Booking.id == request.booking_id)
                )
                original_booking = original_booking_result.scalar_one_or_none()
                
                if original_booking:
                    client_data = {
                        "client_name": original_booking.client_name,
                        "client_phone": original_booking.client_phone,
                        "client_email": original_booking.client_email,
                        "telegram_username": original_booking.telegram_username,
                        "participants_count": original_booking.participants_count,
                        "preferred_date": str(original_booking.date) if original_booking.date else None,
                        "assigned_date": str(tour_db.start_date) if tour_db.start_date else None,
                    }
        except Exception as e:
            print(f"Warning: Could not fetch client data from original booking: {e}")
            pass
    
    # Если данных нет (тур не из заявки) - ищем последнее бронирование для этого тура
    if not client_data:
        booking_result = await db.execute(
            select(Booking)
            .where(Booking.tour_id == tour_db.id)
            .order_by(Booking.created_at.desc())
            .limit(1)
        )
        last_booking = booking_result.scalar_one_or_none()
        
        if last_booking:
            client_data = {
                "client_name": last_booking.client_name,
                "client_phone": last_booking.client_phone,
                "client_email": last_booking.client_email,
                "telegram_username": last_booking.telegram_username,
                "participants_count": last_booking.participants_count,
                "preferred_date": str(last_booking.date) if last_booking.date else None,
                "assigned_date": str(tour_db.start_date) if tour_db.start_date else None,
            }
    
    tour_data = Tour(
        id=tour_db.id,
        share_code=tour_db.share_code,
        title=tour_db.title,
        description=tour_db.description,
        price=tour_db.price,
        duration=tour_db.duration,
        location=tour_db.location,
        category=tour_db.category,
        photos=tour_db.photos or [],
        rating=tour_db.rating,
        reviews_count=real_reviews_count,
        guide_name=tour_db.guide.name or "Гид",
        guide_id=tour_db.guide_id,
        active=tour_db.active,
        created_at=tour_db.created_at,
        bookings_count=bookings_count,
        total_revenue=total_revenue,
        is_public=tour_db.is_public,
        # Контентные блоки
        what_to_expect=tour_db.what_to_expect,
        organizational_details=tour_db.organizational_details,
        included=tour_db.included or [],
        not_included=tour_db.not_included or [],
        meeting_point=tour_db.meeting_point,
        # Параметры
        languages=tour_db.languages or [],
        max_group_size=tour_db.max_group_size,
        min_age=tour_db.min_age,
        difficulty_level=tour_db.difficulty_level,
        # Метаданные
        landmarks=tour_db.landmarks or [],
        tags=tour_db.tags or [],
        themes=tour_db.themes or [],
        formats=tour_db.formats or [],
        # SEO
        seo_title=tour_db.seo_title,
        seo_description=tour_db.seo_description,
        long_description=tour_db.long_description,
        start_date=tour_db.start_date,
        end_date=tour_db.end_date,
        total_bookings=tour_db.total_bookings or 0,
    )
    
    return {
        "tour": tour_data.dict(),
        "client_data": client_data,  # Данные клиента из заявки для предзаполнения
    }


@router.get("/{tour_id}", response_model=Tour)
async def get_tour(
    tour_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Получение детальной информации об экскурсии
    
    Публичный эндпоинт
    """
    tour_db = await TourService.get_tour_by_id(db, tour_id)
    
    if not tour_db:
        raise HTTPException(status_code=404, detail="Экскурсия не найдена")
    
    # Получаем статистику по бронированиям
    bookings_result = await db.execute(
        select(
            func.count(Booking.id).label('count'),
            func.sum(Booking.total_price).label('revenue')
        ).where(Booking.tour_id == tour_db.id, Booking.payment_status == 'paid')
    )
    stats = bookings_result.first()
    bookings_count = stats.count if stats.count else 0
    total_revenue = float(stats.revenue) if stats.revenue else 0.0
    
    # Считаем РЕАЛЬНОЕ количество отзывов из БД
    from app.models.review import Review
    reviews_count_result = await db.execute(
        select(func.count(Review.id)).where(Review.tour_id == tour_db.id)
    )
    real_reviews_count = reviews_count_result.scalar() or 0
    
    return Tour(
        id=tour_db.id,
        share_code=tour_db.share_code,
        title=tour_db.title,
        description=tour_db.description,
        price=tour_db.price,
        duration=tour_db.duration,
        location=tour_db.location,
        category=tour_db.category,
        photos=tour_db.photos or [],
        rating=tour_db.rating,
        reviews_count=real_reviews_count,  # РЕАЛЬНОЕ количество из БД!
        guide_name=tour_db.guide.name or "Гид",
        guide_id=tour_db.guide_id,
        active=tour_db.active,
        created_at=tour_db.created_at,
        bookings_count=bookings_count,
        total_revenue=total_revenue,
        is_public=tour_db.is_public,
        # Контентные блоки
        what_to_expect=tour_db.what_to_expect,
        organizational_details=tour_db.organizational_details,
        included=tour_db.included or [],
        not_included=tour_db.not_included or [],
        meeting_point=tour_db.meeting_point,
        # Параметры
        languages=tour_db.languages or [],
        max_group_size=tour_db.max_group_size,
        min_age=tour_db.min_age,
        difficulty_level=tour_db.difficulty_level,
        # Метаданные
        landmarks=tour_db.landmarks or [],
        tags=tour_db.tags or [],
        themes=tour_db.themes or [],
        formats=tour_db.formats or [],
        # SEO
        seo_title=tour_db.seo_title,
        seo_description=tour_db.seo_description,
        long_description=tour_db.long_description,
    )


@router.post("/", response_model=Tour)
async def create_tour(
    tour: TourCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Создание новой экскурсии
    
    Доступно: Менеджеры (гиды)
    TODO: Добавить проверку прав
    """
    new_tour_db = await TourService.create_tour(
        db=db,
        guide_id=current_user.id,
        title=tour.title,
        description=tour.description,
        price=tour.price,
        duration=tour.duration,
        location=tour.location,
        category=tour.category,
        photos=tour.photos,
        start_date=tour.start_date,
        end_date=tour.end_date,
    )
    
    # Для новой экскурсии отзывов пока нет
    return Tour(
        id=new_tour_db.id,
        share_code=new_tour_db.share_code,
        title=new_tour_db.title,
        description=new_tour_db.description,
        price=new_tour_db.price,
        duration=new_tour_db.duration,
        location=new_tour_db.location,
        category=new_tour_db.category,
        photos=new_tour_db.photos or [],
        rating=new_tour_db.rating,
        reviews_count=0,  # Новая экскурсия - отзывов нет
        guide_name="Текущий гид",
        guide_id=new_tour_db.guide_id,
        bookings_count=0,
        total_revenue=0.0,
        active=new_tour_db.active,
        created_at=new_tour_db.created_at,
        is_public=new_tour_db.is_public,
    )


@router.put("/{tour_id}", response_model=Tour)
async def update_tour(
    tour_id: int,
    tour_data: TourCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Обновить экскурсию"""
    # Получаем тур
    tour = await TourService.get_tour_by_id(db, tour_id)
    
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    
    # Проверяем права
    if tour.guide_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="You can only edit your own tours")
    
    # Обновляем поля
    updated_tour = await TourService.update_tour(
        db=db,
        tour_id=tour_id,
        title=tour_data.title,
        description=tour_data.description,
        price=tour_data.price,
        duration=tour_data.duration,
        location=tour_data.location,
        category=tour_data.category,
        photos=tour_data.photos,
        start_date=tour_data.start_date,
        end_date=tour_data.end_date,
    )
    
    if not updated_tour:
        raise HTTPException(status_code=500, detail="Failed to update tour")
    
    # Считаем РЕАЛЬНОЕ количество отзывов из БД
    from app.models.review import Review
    reviews_count_result = await db.execute(
        select(func.count(Review.id)).where(Review.tour_id == updated_tour.id)
    )
    real_reviews_count = reviews_count_result.scalar() or 0
    
    return Tour(
        id=updated_tour.id,
        share_code=updated_tour.share_code,
        title=updated_tour.title,
        description=updated_tour.description,
        price=updated_tour.price,
        duration=updated_tour.duration,
        location=updated_tour.location,
        category=updated_tour.category,
        photos=updated_tour.photos or [],
        rating=updated_tour.rating,
        reviews_count=real_reviews_count,  # РЕАЛЬНОЕ количество из БД!
        guide_name=updated_tour.guide.name if updated_tour.guide else "Гид",
        guide_id=updated_tour.guide_id,
        bookings_count=0,
        total_revenue=0.0,
        active=updated_tour.active,
        created_at=updated_tour.created_at,
        is_public=updated_tour.is_public,
    )


@router.put("/{tour_id}/dates")
async def update_tour_dates(
    tour_id: int,
    dates: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Обновить даты экскурсии"""
    tour = await TourService.get_tour_by_id(db, tour_id)
    
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    
    if tour.guide_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="You can only edit your own tours")
    
    updated_tour = await TourService.update_tour(
        db=db,
        tour_id=tour_id,
        start_date=dates.get('start_date'),
        end_date=dates.get('end_date'),
    )
    
    return {"success": True, "start_date": str(updated_tour.start_date), "end_date": str(updated_tour.end_date)}


@router.put("/{tour_id}/reschedule")
async def reschedule_tour_with_request(
    tour_id: int,
    data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Перенести тур на новую дату с синхронизацией заявки и расписания
    
    Требуется подтверждение согласования с клиентом.
    Обновляет:
    - Даты тура (start_date, end_date)
    - Дату связанной заявки (assigned_date)
    - Расписание гида (освобождает старые даты, бронирует новые)
    - Отправляет WebSocket уведомления
    
    Параметры:
    - new_start_date: новая дата начала (YYYY-MM-DD)
    - client_confirmed: подтверждение согласования с клиентом (boolean)
    """
    from datetime import datetime, date
    from app.models.request import Request
    from app.services.schedule_service import ScheduleService
    from app.services.websocket_service import notify_tour_updated, notify_request_updated
    
    # 1. Проверка подтверждения клиента
    if not data.get('client_confirmed'):
        raise HTTPException(status_code=400, detail="Client confirmation required")
    
    # 2. Получить тур
    tour = await TourService.get_tour_by_id(db, tour_id)
    
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    
    if tour.guide_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="You can only reschedule your own tours")
    
    # 3. Парсим новую дату
    new_date_str = data.get('new_start_date')
    if not new_date_str:
        raise HTTPException(status_code=400, detail="new_start_date is required")
    
    try:
        if isinstance(new_date_str, str):
            new_date = datetime.strptime(new_date_str, "%Y-%m-%d").date()
        elif isinstance(new_date_str, date):
            new_date = new_date_str
        else:
            raise ValueError("Invalid date format")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    old_date = tour.start_date
    
    # 4. Проверка доступности новой даты
    available = await ScheduleService.check_availability(
        db, current_user.id, new_date, tour.duration
    )
    
    if not available:
        schedule = await ScheduleService.get_or_create_schedule(db, current_user.id, new_date)
        raise HTTPException(
            status_code=400,
            detail=f"Недостаточно времени на {new_date}. Занято: {schedule.booked_hours}/8ч"
        )
    
    # 5. Обновить schedule (освободить старую дату, занять новую)
    if old_date:
        await ScheduleService.free_hours(db, current_user.id, old_date, tour.duration)
    
    await ScheduleService.book_hours(db, current_user.id, new_date, tour.duration)
    
    # 6. Обновить даты тура
    tour.start_date = new_date
    tour.end_date = new_date  # Для однодневных туров
    
    # 7. Обновить связанную заявку (если есть)
    if tour.request_id:
        result = await db.execute(select(Request).where(Request.id == tour.request_id))
        request = result.scalar_one_or_none()
        
        if request:
            request.assigned_date = new_date
            await notify_request_updated(tour.request_id, [current_user.id])
    
    await db.commit()
    await db.refresh(tour)
    
    # 8. WebSocket уведомления
    await notify_tour_updated(tour_id, current_user.id)
    
    return {
        "success": True,
        "tour": {
            "id": tour.id,
            "start_date": str(tour.start_date),
            "end_date": str(tour.end_date),
        },
        "message": f"Тур успешно перенесён на {new_date.strftime('%d.%m.%Y')}"
    }


@router.delete("/{tour_id}")
async def delete_tour(
    tour_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Удалить экскурсию (мягкое удаление)"""
    tour = await TourService.get_tour_by_id(db, tour_id)
    
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    
    if tour.guide_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="You can only delete your own tours")
    
    success = await TourService.delete_tour(db, tour_id)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete tour")
    
    return {"success": True, "message": "Tour deleted successfully"}


@router.get("/{tour_id}/recommendations")
async def get_tour_recommendations(
    tour_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Получение похожих экскурсий (рекомендации)
    
    Возвращает туры с той же категорией или локацией,
    отсортированные по популярности
    """
    similar_tours = await TourService.get_similar_tours(db, tour_id, limit=6)
    
    tours_list = []
    for tour_db in similar_tours:
        # Получаем статистику
        bookings_result = await db.execute(
            select(
                func.count(Booking.id).label('count'),
                func.sum(Booking.total_price).label('revenue')
            ).where(Booking.tour_id == tour_db.id, Booking.payment_status == 'paid')
        )
        stats = bookings_result.first()
        bookings_count = stats.count if stats.count else 0
        total_revenue = float(stats.revenue) if stats.revenue else 0.0
        
        # Считаем РЕАЛЬНОЕ количество отзывов из БД
        from app.models.review import Review
        reviews_count_result = await db.execute(
            select(func.count(Review.id)).where(Review.tour_id == tour_db.id)
        )
        real_reviews_count = reviews_count_result.scalar() or 0
        
        tours_list.append(Tour(
            id=tour_db.id,
            share_code=tour_db.share_code,
            title=tour_db.title,
            description=tour_db.description,
            price=tour_db.price,
            duration=tour_db.duration,
            location=tour_db.location,
            category=tour_db.category,
            photos=tour_db.photos or [],
            rating=tour_db.rating,
            reviews_count=real_reviews_count,  # РЕАЛЬНОЕ количество из БД!
            guide_name=tour_db.guide.name or "Гид",
            guide_id=tour_db.guide_id,
            active=tour_db.active,
            created_at=tour_db.created_at,
            bookings_count=bookings_count,
            total_revenue=total_revenue,
            is_public=tour_db.is_public,
            # Контентные блоки
            what_to_expect=tour_db.what_to_expect,
            organizational_details=tour_db.organizational_details,
            included=tour_db.included or [],
            not_included=tour_db.not_included or [],
            meeting_point=tour_db.meeting_point,
            # Параметры
            languages=tour_db.languages or [],
            max_group_size=tour_db.max_group_size,
            min_age=tour_db.min_age,
            difficulty_level=tour_db.difficulty_level,
            # Метаданные
            landmarks=tour_db.landmarks or [],
            tags=tour_db.tags or [],
            themes=tour_db.themes or [],
            formats=tour_db.formats or [],
            # SEO
            seo_title=tour_db.seo_title,
            seo_description=tour_db.seo_description,
            long_description=tour_db.long_description,
        ))
    
    return {"tours": tours_list, "total": len(tours_list)}


@router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Получить список категорий с количеством туров"""
    tours = await TourService.get_all_tours(db)
    
    # Подсчёт по быстрым фильтрам
    all_count = len([t for t in tours if t.is_public])
    discount_count = len([t for t in tours if t.is_public and t.has_discount])
    new_count = len([t for t in tours if t.is_public and t.is_new])
    
    # Подсчёт по темам
    themes_count = {}
    for tour in tours:
        if tour.is_public and tour.themes:
            for theme in tour.themes:
                themes_count[theme] = themes_count.get(theme, 0) + 1
    
    # Подсчёт по форматам
    formats_count = {}
    for tour in tours:
        if tour.is_public and tour.formats:
            for format_type in tour.formats:
                formats_count[format_type] = formats_count.get(format_type, 0) + 1
    
    return {
        "quick_filters": {
            "all": all_count,
            "with_discount": discount_count,
            "new": new_count
        },
        "themes": themes_count,
        "formats": formats_count
    }


@router.get("/smart-recommendations")
async def get_smart_recommendations(
    tour_id: Optional[int] = Query(None, description="ID тура для похожих рекомендаций"),
    user_id: Optional[int] = Query(None, description="ID пользователя для персонализации"),
    location: Optional[str] = Query(None, description="Локация для популярных туров"),
    limit: int = Query(6, description="Количество рекомендаций"),
    db: AsyncSession = Depends(get_db)
):
    """
    Умные рекомендации на основе ML-алгоритмов
    
    - Если указан tour_id: похожие туры на основе контентной схожести
    - Если указан user_id: персонализированные рекомендации
    - Если указана location: популярные туры в локации
    - Иначе: глобально популярные туры
    """
    tours = await RecommendationService.get_smart_recommendations(
        db,
        tour_id=tour_id,
        user_id=user_id,
        location=location,
        limit=limit
    )
    
    return {"tours": tours, "total": len(tours), "algorithm": "smart_recommendations"}


@router.get("/collaborative-recommendations/{tour_id}")
async def get_collaborative_recommendations(
    tour_id: int,
    limit: int = Query(6, description="Количество рекомендаций"),
    db: AsyncSession = Depends(get_db)
):
    """
    Рекомендации на основе совместной фильтрации
    "Пользователи, которые заказывали этот тур, также заказывали..."
    """
    tours = await RecommendationService.get_collaborative_recommendations(
        db,
        tour_id=tour_id,
        limit=limit
    )
    
    return {
        "tours": tours,
        "total": len(tours),
        "algorithm": "collaborative_filtering",
        "message": "Пользователи, которые заказывали этот тур, также заказывали..."
    }


@router.get("/dynamic-navigation")
async def get_dynamic_navigation(db: AsyncSession = Depends(get_db)):
    """
    Динамическая навигация на основе реальных данных туров
    Автоматически создает категории из landmarks, tags, themes
    """
    navigation_data = await RecommendationService.get_dynamic_categories_from_tours(db)
    
    return {
        "success": True,
        "data": navigation_data,
        "message": "Динамическая навигация сгенерирована на основе реальных данных"
    }
