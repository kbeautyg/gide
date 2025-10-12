"""
Эндпоинты для админов и супер-админа
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.user_service import UserService
from app.models.user import User, UserRole
from app.core.deps import require_admin, get_current_user, check_hierarchy

router = APIRouter()


class CreateUserRequest(BaseModel):
    """Запрос на создание пользователя"""
    phone: str = Field(..., description="Номер телефона")
    email: Optional[str] = Field(None, description="Email")
    password: str = Field(..., description="Пароль")
    name: Optional[str] = Field(None, description="Имя")
    role: str = Field(..., description="Роль (manager, client)")


class UserResponse(BaseModel):
    """Ответ с данными пользователя"""
    id: int
    phone: str
    email: Optional[str]
    name: Optional[str]
    role: str
    parent_id: Optional[int]
    balance_rub: float
    balance_usd: float
    balance_thb: float


class ChangeParentRequest(BaseModel):
    """Запрос на смену родителя (переназначение менеджера)"""
    user_id: int = Field(..., description="ID пользователя для переназначения")
    new_parent_id: int = Field(..., description="ID нового родителя")


@router.post("/users", response_model=UserResponse)
async def create_user(
    request: CreateUserRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Создание нового пользователя
    
    Доступно: Только ADMIN
    
    Админ может создавать: гидов (MANAGER) и клиентов (CLIENT)
    """
    # Проверяем права на создание этой роли
    role = UserRole(request.role)
    
    if role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нельзя создавать других админов через API"
        )
    
    # Очищаем телефон от всех символов кроме цифр
    phone_clean = ''.join(filter(str.isdigit, request.phone))
    print(f"📞 Создание пользователя: {request.phone} -> очищено: {phone_clean}")
    
    # Проверяем существует ли пользователь
    existing_user = await UserService.get_user_by_phone(db, phone_clean)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким телефоном уже существует"
        )
    
    # Создаем пользователя с parent_id = current_user.id (админ создаёт гидов)
    # Преобразуем пустые строки в None для необязательных полей
    user = await UserService.create_user(
        db=db,
        phone=phone_clean,
        password=request.password,
        email=request.email if request.email and request.email.strip() else None,
        name=request.name if request.name and request.name.strip() else None,
        role=role,
        parent_id=current_user.id if role == UserRole.MANAGER else None,
    )
    
    return UserResponse(
        id=user.id,
        phone=user.phone,
        email=user.email,
        name=user.name,
        role=user.role.value,
        parent_id=user.parent_id,
        balance_rub=user.balance_rub,
        balance_usd=user.balance_usd,
        balance_thb=user.balance_thb,
    )


@router.get("/users/all", response_model=List[UserResponse])
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Получение ВСЕХ пользователей системы
    
    Доступно: Только ADMIN
    """
    from sqlalchemy import select
    
    # Получаем всех пользователей
    stmt = select(User)
    result = await db.execute(stmt)
    all_users = result.scalars().all()
    
    return [
        UserResponse(
            id=u.id,
            phone=u.phone,
            email=u.email,
            name=u.name,
            role=u.role.value,
            parent_id=u.parent_id,
            balance_rub=u.balance_rub,
            balance_usd=u.balance_usd,
            balance_thb=u.balance_thb,
        )
        for u in all_users
    ]


@router.get("/users/my-team", response_model=List[UserResponse])
async def get_my_team(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Получение списка подчиненных пользователей
    
    Доступно: ADMIN (все гиды), MANAGER (свои клиенты)
    """
    # Получаем всех подчиненных
    team = await UserService.get_user_hierarchy(db, current_user.id)
    
    return [
        UserResponse(
            id=u.id,
            phone=u.phone,
            email=u.email,
            name=u.name,
            role=u.role.value,
            parent_id=u.parent_id,
            balance_rub=u.balance_rub,
            balance_usd=u.balance_usd,
            balance_thb=u.balance_thb,
        )
        for u in team
    ]


@router.post("/users/change-parent")
async def change_user_parent(
    request: ChangeParentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Переназначение гида к другому родителю
    
    Доступно: Только ADMIN
    """
    # Получаем пользователя и нового родителя
    user = await UserService.get_user_by_id(db, request.user_id)
    new_parent = await UserService.get_user_by_id(db, request.new_parent_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    if not new_parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Новый родитель не найден"
        )
    
    # Переназначаем
    updated_user = await UserService.change_user_parent(
        db=db,
        user_id=request.user_id,
        new_parent_id=request.new_parent_id
    )
    
    return {
        "message": f"Пользователь {user.phone} переназначен к {new_parent.phone}",
        "user_id": updated_user.id,
        "new_parent_id": updated_user.parent_id
    }


# === УПРАВЛЕНИЕ ТУРАМИ ===

@router.get("/tours")
async def get_all_tours(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
    page: int = 1,
    page_size: int = 50
):
    """
    Получить все туры (включая приватные)
    
    Доступно: ADMIN, SUPER_ADMIN
    """
    from sqlalchemy import select, func
    from app.models.tour import Tour
    
    # Общее количество
    count_query = select(func.count()).select_from(Tour)
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Туры с пагинацией
    offset = (page - 1) * page_size
    query = select(Tour).offset(offset).limit(page_size).order_by(Tour.created_at.desc())
    result = await db.execute(query)
    tours = result.scalars().all()
    
    return {
        "tours": tours,
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.get("/tours/{tour_id}")
async def get_tour_details(
    tour_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Полная информация о туре для редактирования
    
    Доступно: ADMIN, SUPER_ADMIN
    """
    from sqlalchemy import select
    from app.models.tour import Tour
    
    query = select(Tour).where(Tour.id == tour_id)
    result = await db.execute(query)
    tour = result.scalar_one_or_none()
    
    if not tour:
        raise HTTPException(status_code=404, detail="Тур не найден")
    
    # Возвращаем все поля тура
    return {
        "id": tour.id,
        "guide_id": tour.guide_id,
        "share_code": tour.share_code,
        "title": tour.title,
        "description": tour.description,
        "price": tour.price,
        "duration": tour.duration,
        "location": tour.location,
        "category": tour.category,
        "start_date": tour.start_date.isoformat() if tour.start_date else None,
        "end_date": tour.end_date.isoformat() if tour.end_date else None,
        "photos": tour.photos or [],
        "rating": tour.rating,
        "reviews_count": tour.reviews_count,
        "what_to_expect": tour.what_to_expect,
        "organizational_details": tour.organizational_details,
        "included": tour.included or [],
        "not_included": tour.not_included or [],
        "meeting_point": tour.meeting_point,
        "languages": tour.languages or [],
        "max_group_size": tour.max_group_size,
        "min_age": tour.min_age,
        "difficulty_level": tour.difficulty_level,
        "landmarks": tour.landmarks or [],
        "tags": tour.tags or [],
        "themes": tour.themes or [],
        "formats": tour.formats or [],
        "seo_title": tour.seo_title,
        "seo_description": tour.seo_description,
        "long_description": tour.long_description,
        "total_bookings": tour.total_bookings,
        "views_count": tour.views_count,
        "has_discount": tour.has_discount,
        "is_new": tour.is_new,
        "discount_percentage": tour.discount_percentage,
        "original_price": tour.original_price,
        "active": tour.active,
        "is_public": tour.is_public,
        "created_at": tour.created_at.isoformat() if tour.created_at else None,
        "updated_at": tour.updated_at.isoformat() if tour.updated_at else None,
    }


class TourUpdateRequest(BaseModel):
    """Запрос на обновление тура"""
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration: Optional[int] = None
    location: Optional[str] = None
    category: Optional[str] = None
    active: Optional[bool] = None
    is_public: Optional[bool] = None


class TourFullUpdateRequest(BaseModel):
    """Запрос на полное обновление всех полей тура"""
    # Базовые поля
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration: Optional[int] = None
    location: Optional[str] = None
    category: Optional[str] = None
    photos: Optional[List[str]] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    
    # Контентные блоки
    what_to_expect: Optional[str] = None
    organizational_details: Optional[str] = None
    included: Optional[List[str]] = None
    not_included: Optional[List[str]] = None
    meeting_point: Optional[str] = None
    
    # Параметры
    languages: Optional[List[str]] = None
    max_group_size: Optional[int] = None
    min_age: Optional[int] = None
    difficulty_level: Optional[str] = None
    
    # SEO и теги
    landmarks: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    themes: Optional[List[str]] = None
    formats: Optional[List[str]] = None
    long_description: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    
    # Статус
    active: Optional[bool] = None
    is_public: Optional[bool] = None


@router.put("/tours/{tour_id}")
async def update_tour(
    tour_id: int,
    tour_data: TourUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Редактировать тур
    
    Доступно: ADMIN, SUPER_ADMIN
    """
    from sqlalchemy import select
    from app.models.tour import Tour
    
    query = select(Tour).where(Tour.id == tour_id)
    result = await db.execute(query)
    tour = result.scalar_one_or_none()
    
    if not tour:
        raise HTTPException(status_code=404, detail="Тур не найден")
    
    # Обновляем только переданные поля
    update_data = tour_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tour, field, value)
    
    await db.commit()
    await db.refresh(tour)
    
    return {"message": "Тур обновлён", "tour": tour}


@router.put("/tours/{tour_id}/full-update")
async def full_update_tour(
    tour_id: int,
    tour_data: TourFullUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Полное обновление всех полей тура
    
    Доступно: ADMIN, SUPER_ADMIN
    Обновляет только переданные поля (partial update)
    """
    from sqlalchemy import select
    from app.models.tour import Tour
    from datetime import datetime
    
    query = select(Tour).where(Tour.id == tour_id)
    result = await db.execute(query)
    tour = result.scalar_one_or_none()
    
    if not tour:
        raise HTTPException(status_code=404, detail="Тур не найден")
    
    # Обновляем только переданные поля
    update_data = tour_data.dict(exclude_unset=True)
    
    # Конвертируем даты если они строки
    if 'start_date' in update_data and update_data['start_date']:
        try:
            update_data['start_date'] = datetime.fromisoformat(update_data['start_date'].replace('Z', '+00:00')).date()
        except:
            pass
    
    if 'end_date' in update_data and update_data['end_date']:
        try:
            update_data['end_date'] = datetime.fromisoformat(update_data['end_date'].replace('Z', '+00:00')).date()
        except:
            pass
    
    for field, value in update_data.items():
        setattr(tour, field, value)
    
    await db.commit()
    await db.refresh(tour)
    
    return {"message": "Тур полностью обновлён", "tour": tour}


@router.delete("/tours/{tour_id}")
async def delete_tour(
    tour_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Удалить тур
    
    Доступно: ADMIN, SUPER_ADMIN
    """
    from sqlalchemy import select
    from app.models.tour import Tour
    
    query = select(Tour).where(Tour.id == tour_id)
    result = await db.execute(query)
    tour = result.scalar_one_or_none()
    
    if not tour:
        raise HTTPException(status_code=404, detail="Тур не найден")
    
    await db.delete(tour)
    await db.commit()
    
    return {"message": "Тур удалён", "tour_id": tour_id}


# === УПРАВЛЕНИЕ ГИДАМИ ===

@router.get("/guides")
async def get_all_guides(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Список всех гидов
    
    Доступно: Только ADMIN
    """
    from sqlalchemy import select
    
    query = select(User).where(User.role == UserRole.MANAGER)
    result = await db.execute(query)
    guides = result.scalars().all()
    
    return {"guides": guides, "total": len(guides)}


@router.put("/guides/{guide_id}/approve")
async def approve_guide(
    guide_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Одобрить гида (активировать)
    
    Доступно: Только ADMIN
    """
    user = await UserService.get_user_by_id(db, guide_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="Гид не найден")
    
    if user.role != UserRole.MANAGER:
        raise HTTPException(status_code=400, detail="Это не гид")
    
    # Здесь можно добавить поле approved в модель User
    # Пока просто возвращаем OK
    return {"message": f"Гид {user.name or user.phone} одобрен", "guide_id": guide_id}


@router.put("/guides/{guide_id}/block")
async def block_guide(
    guide_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Заблокировать гида
    
    Доступно: Только ADMIN
    """
    user = await UserService.get_user_by_id(db, guide_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="Гид не найден")
    
    if user.role != UserRole.MANAGER:
        raise HTTPException(status_code=400, detail="Это не гид")
    
    # Здесь можно добавить поле blocked в модель User
    # Пока просто возвращаем OK
    return {"message": f"Гид {user.name or user.phone} заблокирован", "guide_id": guide_id}


# === СТАТИСТИКА ===

@router.get("/stats")
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Общая статистика для админ-панели
    
    Доступно: ADMIN, SUPER_ADMIN
    """
    from sqlalchemy import select, func
    from app.models.tour import Tour
    from app.models.booking import Booking
    
    # Количество туров
    total_tours_query = select(func.count()).select_from(Tour)
    total_tours_result = await db.execute(total_tours_query)
    total_tours = total_tours_result.scalar() or 0
    
    # Количество гидов
    total_guides_query = select(func.count()).select_from(User).where(
        User.role == UserRole.MANAGER
    )
    total_guides_result = await db.execute(total_guides_query)
    total_guides = total_guides_result.scalar() or 0
    
    # Количество бронирований
    total_bookings_query = select(func.count()).select_from(Booking)
    total_bookings_result = await db.execute(total_bookings_query)
    total_bookings = total_bookings_result.scalar() or 0
    
    # Общая выручка
    total_revenue_query = select(func.sum(Booking.total_price)).select_from(Booking).where(
        Booking.payment_status == "paid"
    )
    total_revenue_result = await db.execute(total_revenue_query)
    total_revenue = total_revenue_result.scalar() or 0.0
    
    return {
        "total_tours": total_tours,
        "total_guides": total_guides,
        "total_bookings": total_bookings,
        "total_revenue": total_revenue,
        "active_tours": total_tours,  # Можно добавить фильтр по active=True
        "pending_tours": 0  # Можно добавить pending_approval статус
    }