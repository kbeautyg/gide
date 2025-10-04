"""
Эндпоинты для работы с экскурсиями
"""
from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

router = APIRouter()


class Tour(BaseModel):
    """Модель экскурсии"""
    id: str
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
    guide_id: str = Field(..., description="ID гида")
    active: bool = Field(default=True, description="Активна ли экскурсия")
    created_at: datetime = Field(default_factory=datetime.now)


class TourCreate(BaseModel):
    """Создание экскурсии"""
    title: str
    description: str
    price: float
    duration: int
    location: str
    category: str
    photos: List[str] = []


class TourList(BaseModel):
    """Список экскурсий"""
    tours: List[Tour]
    total: int
    page: int
    page_size: int


@router.get("/", response_model=TourList)
async def get_tours(
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
    TODO: Подключить реальную БД
    """
    # Временные тестовые данные
    mock_tours = [
        Tour(
            id="tour_1",
            title="Обзорная экскурсия по Пхукету",
            description="Познакомьтесь с главными достопримечательностями острова! Посетите Большого Будду, храм Ват Чалонг, и насладитесь панорамными видами с мыса Промтеп.",
            price=2500.0,
            duration=6,
            location="Пхукет",
            category="Культура и история",
            photos=[
                "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800",
                "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800"
            ],
            rating=4.8,
            reviews_count=127,
            guide_name="Александр",
            guide_id="guide_1",
        ),
        Tour(
            id="tour_2",
            title="Острова Пхи-Пхи на скоростной лодке",
            description="Незабываемое путешествие на знаменитые острова Пхи-Пхи! Снорклинг в кристально чистых водах, пляж Майя Бэй, обед на острове.",
            price=3200.0,
            duration=8,
            location="Пхукет",
            category="Природа и пляжи",
            photos=[
                "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
                "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"
            ],
            rating=4.9,
            reviews_count=203,
            guide_name="Мария",
            guide_id="guide_2",
        ),
        Tour(
            id="tour_3",
            title="Джунгли и водопады Краби",
            description="Приключение в джунглях провинции Краби! Треккинг к водопадам, купание в изумрудном озере, посещение горячих источников.",
            price=2800.0,
            duration=7,
            location="Краби",
            category="Приключения",
            photos=[
                "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800"
            ],
            rating=4.7,
            reviews_count=89,
            guide_name="Дмитрий",
            guide_id="guide_3",
        ),
    ]
    
    # Применяем фильтры (упрощенная версия)
    filtered_tours = mock_tours
    
    if location:
        filtered_tours = [t for t in filtered_tours if t.location.lower() == location.lower()]
    
    if category:
        filtered_tours = [t for t in filtered_tours if category.lower() in t.category.lower()]
    
    if min_price:
        filtered_tours = [t for t in filtered_tours if t.price >= min_price]
    
    if max_price:
        filtered_tours = [t for t in filtered_tours if t.price <= max_price]
    
    # Пагинация
    start = (page - 1) * page_size
    end = start + page_size
    paginated_tours = filtered_tours[start:end]
    
    return TourList(
        tours=paginated_tours,
        total=len(filtered_tours),
        page=page,
        page_size=page_size
    )


@router.get("/{tour_id}", response_model=Tour)
async def get_tour(tour_id: str):
    """
    Получение детальной информации об экскурсии
    
    Публичный эндпоинт
    TODO: Подключить реальную БД
    """
    # Временная заглушка
    return Tour(
        id=tour_id,
        title="Обзорная экскурсия по Пхукету",
        description="Познакомьтесь с главными достопримечательностями острова!",
        price=2500.0,
        duration=6,
        location="Пхукет",
        category="Культура и история",
        photos=[
            "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800"
        ],
        rating=4.8,
        reviews_count=127,
        guide_name="Александр",
        guide_id="guide_1",
    )


@router.post("/", response_model=Tour)
async def create_tour(tour: TourCreate):
    """
    Создание новой экскурсии
    
    Доступно: Менеджеры (гиды)
    TODO: Подключить реальную БД и проверку прав
    """
    # Временная заглушка
    new_tour = Tour(
        id="new_tour_id",
        title=tour.title,
        description=tour.description,
        price=tour.price,
        duration=tour.duration,
        location=tour.location,
        category=tour.category,
        photos=tour.photos,
        guide_name="Текущий гид",
        guide_id="current_guide_id",
    )
    
    return new_tour
