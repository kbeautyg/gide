"""
Эндпоинты для работы с экскурсиями
"""
from fastapi import APIRouter, Query, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.services.tour_service import TourService
from app.models.booking import Booking
from app.models.user import User
from app.core.deps import get_current_user

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
    is_public: bool = Field(default=False, description="Публикуется ли экскурсия в каталоге")
    created_at: datetime = Field(default_factory=datetime.now)
    bookings_count: int = Field(default=0, description="Количество бронирований")
    total_revenue: float = Field(default=0.0, description="Общий доход с экскурсии")


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
    is_public: bool = Field(default=False, description="Публиковать ли экскурсию в каталоге")


class TourList(BaseModel):
    """Список экскурсий"""
    tours: List[Tour]
    total: int
    page: int
    page_size: int


def build_tour_response(tour_db, bookings_count: int, total_revenue: float) -> Tour:
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
        reviews_count=tour_db.reviews_count,
        guide_name=tour_db.guide.name or "Гид",
        guide_id=tour_db.guide_id,
        active=tour_db.active,
        is_public=tour_db.is_public,
        created_at=tour_db.created_at,
        bookings_count=bookings_count,
        total_revenue=total_revenue,
    )


@router.get("/", response_model=TourList)
async def get_tours(
    db: AsyncSession = Depends(get_db),
    location: Optional[str] = Query(None, description="Фильтр по локации"),
    category: Optional[str] = Query(None, description="Фильтр по категории"),
    min_price: Optional[float] = Query(None, description="Минимальная цена"),
    max_price: Optional[float] = Query(None, description="Максимальная цена"),
    page: int = Query(1, ge=1, description="Номер страницы"),
    page_size: int = Query(12, ge=1, le=100, description="Размер страницы"),
):
    """
    Получение списка экскурсий с фильтрами
    
    Публичный эндпоинт - доступен без авторизации
    """
    # Получаем экскурсии из БД
    tours_db, total = await TourService.get_tours(
        db=db,
        location=location,
        category=category,
        min_price=min_price,
        max_price=max_price,
        page=page,
        page_size=page_size,
        only_public=True,
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
        
        tours_list.append(build_tour_response(tour_db, bookings_count, total_revenue))
    
    # Если экскурсий нет - возвращаем пустой список
    # (Удалены mock данные - пользователи создают экскурсии сами)
    
    return TourList(
        tours=tours_list,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/by-code/{share_code}", response_model=Tour)
async def get_tour_by_code(
    share_code: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Получение экскурсии по уникальному коду (для шаринга)
    
    Публичный эндпоинт без авторизации
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
    
    return build_tour_response(tour_db, bookings_count, total_revenue)


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
    
    return build_tour_response(tour_db, bookings_count, total_revenue)


@router.post("/", response_model=Tour)
async def create_tour(
    tour: TourCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
        is_public=tour.is_public,
    )
    
    return build_tour_response(new_tour_db, 0, 0.0)


@router.get("/my", response_model=TourList)
async def get_my_tours(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Получение экскурсий текущего гида (непубличный список)
    """
    tours_db, total = await TourService.get_tours(
        db=db,
        guide_id=current_user.id,
        page=1,
        page_size=100,
        only_public=False,
    )

    tours_list = []
    for tour_db in tours_db:
        bookings_result = await db.execute(
            select(
                func.count(Booking.id).label('count'),
                func.sum(Booking.total_price).label('revenue')
            ).where(Booking.tour_id == tour_db.id, Booking.payment_status == 'paid')
        )
        stats = bookings_result.first()
        bookings_count = stats.count if stats.count else 0
        total_revenue = float(stats.revenue) if stats.revenue else 0.0

        tours_list.append(build_tour_response(tour_db, bookings_count, total_revenue))

    return TourList(
        tours=tours_list,
        total=total,
        page=1,
        page_size=100,
    )
