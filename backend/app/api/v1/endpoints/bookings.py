"""
Эндпоинты для работы с бронированиями
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from datetime import datetime, date, timedelta
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.db.session import get_db
from app.models.booking import Booking, BookingStatus, PaymentStatus
from app.models.tour import Tour
from app.models.user import User, UserRole
from app.models.transaction import Transaction
from app.core.deps import get_current_user

router = APIRouter()


class BookingCreate(BaseModel):
    """Создание бронирования"""
    tour_id: int = Field(..., description="ID экскурсии")
    date: date = Field(..., description="Дата экскурсии")
    participants_count: int = Field(..., ge=1, description="Количество участников")
    client_name: str = Field(..., description="Имя клиента")
    client_phone: str = Field(..., description="Телефон клиента")
    client_email: Optional[str] = Field(None, description="Email клиента")


class BookingResponse(BaseModel):
    """Ответ с бронированием"""
    id: int
    tour_id: int
    tour_title: str
    tour_location: str
    guide_name: str
    client_id: int
    client_name: str
    client_phone: str
    client_email: Optional[str]
    date: date
    participants_count: int
    total_price: float
    status: str
    payment_status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class BookingList(BaseModel):
    """Список бронирований"""
    bookings: List[BookingResponse]
    total: int
    page: int
    per_page: int


@router.post("/test-payment", response_model=BookingResponse)
async def create_test_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Тестовая оплата экскурсии
    Создаёт бронирование, транзакцию и обновляет баланс гида
    """
    # Получаем экскурсию
    tour_query = select(Tour).where(Tour.id == booking_data.tour_id)
    tour = (await db.execute(tour_query)).scalar_one_or_none()
    
    if not tour:
        raise HTTPException(status_code=404, detail="Экскурсия не найдена")
    
    # Получаем гида
    guide_query = select(User).where(User.id == tour.guide_id)
    guide = (await db.execute(guide_query)).scalar_one_or_none()
    
    if not guide:
        raise HTTPException(status_code=404, detail="Гид не найден")
    
    # Вычисляем общую стоимость
    total_price = tour.price * booking_data.participants_count
    
    # Создаем бронирование
    booking = Booking(
        tour_id=tour.id,
        client_id=current_user.id,
        date=booking_data.date,
        participants_count=booking_data.participants_count,
        total_price=total_price,
        status=BookingStatus.CONFIRMED,
        payment_status=PaymentStatus.PAID,
        client_name=booking_data.client_name,
        client_phone=booking_data.client_phone,
        client_email=booking_data.client_email
    )
    
    db.add(booking)
    await db.flush()  # Получаем ID бронирования
    
    # Создаем транзакцию для гида
    transaction = Transaction(
        user_id=guide.id,
        type='booking_payment',
        amount_rub=total_price,
        amount_usd=0.0,
        amount_thb=0.0,
        description=f"Тестовая оплата: {tour.title}",
        booking_id=booking.id
    )
    
    db.add(transaction)
    
    # Обновляем баланс гида
    guide.balance_rub += total_price
    guide.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(booking)
    
    return BookingResponse(
        id=booking.id,
        tour_id=tour.id,
        tour_title=tour.title,
        tour_location=tour.location,
        guide_name=guide.name or guide.phone,
        client_id=current_user.id,
        client_name=booking.client_name,
        client_phone=booking.client_phone,
        client_email=booking.client_email,
        date=booking.date,
        participants_count=booking.participants_count,
        total_price=booking.total_price,
        status=booking.status.value,
        payment_status=booking.payment_status.value,
        created_at=booking.created_at
    )


@router.get("/", response_model=BookingList)
async def get_bookings(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить список бронирований
    - Менеджеры: бронирования их экскурсий
    - Клиенты: их бронирования
    - Админы: все бронирования
    """
    
    if current_user.role in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        # Админы видят все
        query = select(Booking)
    elif current_user.role in [UserRole.MANAGER, UserRole.GUIDE]:
        # Менеджеры видят бронирования своих экскурсий
        query = select(Booking).join(Tour).where(Tour.guide_id == current_user.id)
    else:
        # Клиенты видят свои бронирования
        query = select(Booking).where(Booking.client_id == current_user.id)
    
    query = query.order_by(Booking.created_at.desc())
    
    # Подсчет
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    # Пагинация
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    
    result = await db.execute(query)
    bookings = result.scalars().all()
    
    # Формируем ответ с полной информацией
    booking_responses = []
    for booking in bookings:
        tour_query = select(Tour).where(Tour.id == booking.tour_id)
        tour = (await db.execute(tour_query)).scalar_one_or_none()
        
        guide_query = select(User).where(User.id == tour.guide_id)
        guide = (await db.execute(guide_query)).scalar_one_or_none()
        
        booking_responses.append(BookingResponse(
            id=booking.id,
            tour_id=booking.tour_id,
            tour_title=tour.title if tour else "Неизвестная экскурсия",
            tour_location=tour.location if tour else "",
            guide_name=guide.name or guide.phone if guide else "Неизвестный гид",
            client_id=booking.client_id,
            client_name=booking.client_name,
            client_phone=booking.client_phone,
            client_email=booking.client_email,
            date=booking.date,
            participants_count=booking.participants_count,
            total_price=booking.total_price,
            status=booking.status.value,
            payment_status=booking.payment_status.value,
            created_at=booking.created_at
        ))
    
    return BookingList(
        bookings=booking_responses,
        total=total or 0,
        page=page,
        per_page=per_page
    )