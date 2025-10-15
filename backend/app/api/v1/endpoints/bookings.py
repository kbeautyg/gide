"""
Эндпоинты для работы с бронированиями
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from datetime import datetime, timedelta, date as date_type
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.db.session import get_db
from app.models.booking import Booking as BookingModel, BookingStatus, PaymentStatus
from app.models.tour import Tour
from app.models.user import User
from app.models.request import Request as RequestModel
from app.core.deps import get_current_user

router = APIRouter()


class BookingCreate(BaseModel):
    """Создание бронирования"""
    tour_id: int = Field(..., description="ID экскурсии")
    date: date_type = Field(..., description="Дата экскурсии")
    time: Optional[str] = Field("10:00", description="Время экскурсии (HH:MM)")
    participants_count: int = Field(..., ge=1, description="Количество участников")
    client_name: str = Field(..., description="Имя клиента")
    client_phone: str = Field(..., description="Телефон клиента")
    client_email: Optional[str] = Field(None, description="Email клиента")
    telegram_username: Optional[str] = Field(None, description="Telegram username")


class OfflinePaymentRequest(BaseModel):
    """Офлайн оплата (гид вручную отмечает)"""
    tour_id: int
    client_name: str
    client_phone: str
    client_email: Optional[str] = None
    participants_count: int = Field(default=1, ge=1)
    date: Optional[date_type] = None  # Если не указана, используется сегодня
    time: Optional[str] = Field("10:00", description="Время экскурсии (HH:MM)")


class Booking(BaseModel):
    """Модель бронирования"""
    id: int
    tour_id: int
    client_id: int
    client_name: str
    client_phone: str
    client_email: Optional[str]
    telegram_username: Optional[str] = None
    date: date_type
    time: Optional[str] = "10:00"
    participants_count: int
    total_price: float
    status: str
    payment_status: str
    created_at: datetime


class BookingList(BaseModel):
    """Список бронирований"""
    bookings: List[Booking]
    total: int


class RevenueStats(BaseModel):
    """Статистика доходов"""
    date: str
    revenue: float


@router.post("/offline-payment", response_model=Booking)
async def mark_as_paid(
    payment: OfflinePaymentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Офлайн оплата - гид отмечает что клиент оплатил
    
    Создаёт бронирование со статусом 'paid' и обновляет баланс гида
    """
    # Получаем экскурсию
    tour_result = await db.execute(select(Tour).where(Tour.id == payment.tour_id))
    tour = tour_result.scalar_one_or_none()
    
    if not tour:
        raise HTTPException(status_code=404, detail="Экскурсия не найдена")
    
    # Проверяем что текущий пользователь - владелец экскурсии
    if tour.guide_id != current_user.id:
        raise HTTPException(status_code=403, detail="Вы можете отмечать оплаты только своих экскурсий")
    
    # Рассчитываем общую стоимость
    total_price = tour.price * payment.participants_count
    
    # Создаём бронирование (оплачено офлайн)
    booking = BookingModel(
        tour_id=payment.tour_id,
        client_id=current_user.id,  # Гид создаёт от своего имени
        date=payment.date or date_type.today(),
        time=payment.time or "10:00",
        participants_count=payment.participants_count,
        total_price=total_price,
        status=BookingStatus.CONFIRMED,
        payment_status=PaymentStatus.PAID,
        client_name=payment.client_name,
        client_phone=payment.client_phone,
        client_email=payment.client_email,
    )
    
    db.add(booking)
    
    # Архивируем тур (убираем из "Мои экскурсии" после оплаты)
    tour.is_archived = True
    
    # Если тур создан из заявки - помечаем заявку как завершённую
    if tour.request_id:
        request_result = await db.execute(select(RequestModel).where(RequestModel.id == tour.request_id))
        request = request_result.scalar_one_or_none()
        if request:
            request.status = 'completed'
    
    # Обновляем баланс гида
    current_user.balance_rub += total_price
    
    await db.commit()
    await db.refresh(booking)
    
    return Booking(
        id=booking.id,
        tour_id=booking.tour_id,
        client_id=booking.client_id,
        client_name=booking.client_name,
        client_phone=booking.client_phone,
        client_email=booking.client_email,
        telegram_username=booking.telegram_username,
        date=booking.date,
        time=booking.time,
        participants_count=booking.participants_count,
        total_price=booking.total_price,
        status=booking.status.value,
        payment_status=booking.payment_status.value,
        created_at=booking.created_at,
    )


@router.get("/revenue-stats", response_model=List[RevenueStats])
async def get_revenue_stats(
    days: int = 14,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Статистика доходов по дням за последние N дней
    
    Используется для графика доходов в дашборде
    """
    # Получаем бронирования текущего гида за последние N дней
    start_date = datetime.now() - timedelta(days=days)
    
    # Получаем ID всех экскурсий текущего гида
    tours_result = await db.execute(
        select(Tour.id).where(Tour.guide_id == current_user.id)
    )
    tour_ids = [row[0] for row in tours_result.all()]
    
    if not tour_ids:
        # Нет экскурсий - возвращаем нули
        return [
            RevenueStats(date=(datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d'), revenue=0.0)
            for i in range(days-1, -1, -1)
        ]
    
    # Группируем бронирования по дням
    stmt = select(
        func.date(BookingModel.created_at).label('date'),
        func.sum(BookingModel.total_price).label('revenue')
    ).where(
        and_(
            BookingModel.tour_id.in_(tour_ids),
            BookingModel.payment_status == PaymentStatus.PAID,
            BookingModel.created_at >= start_date
        )
    ).group_by(func.date(BookingModel.created_at))
    
    result = await db.execute(stmt)
    stats_dict = {str(row.date): float(row.revenue) for row in result.all()}
    
    # Формируем ответ за все дни (заполняя нулями пропуски)
    revenue_stats = []
    for i in range(days-1, -1, -1):
        day = datetime.now() - timedelta(days=i)
        day_str = day.strftime('%Y-%m-%d')
        revenue_stats.append(
            RevenueStats(
                date=day_str,
                revenue=stats_dict.get(day_str, 0.0)
            )
        )
    
    return revenue_stats


@router.get("/", response_model=BookingList)
async def get_bookings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Получение списка бронирований текущего гида
    """
    # Получаем ID всех экскурсий текущего гида
    tours_result = await db.execute(
        select(Tour.id).where(Tour.guide_id == current_user.id)
    )
    tour_ids = [row[0] for row in tours_result.all()]
    
    if not tour_ids:
        return BookingList(bookings=[], total=0)
    
    # Получаем бронирования с джоином к турам для получения названия
    stmt = (
        select(BookingModel, Tour.title)
        .join(Tour, BookingModel.tour_id == Tour.id)
        .where(BookingModel.tour_id.in_(tour_ids))
        .order_by(BookingModel.created_at.desc())
    )
    result = await db.execute(stmt)
    bookings_with_tours = result.all()
    
    bookings_list = [
        {
            "id": b.id,
            "tour_id": b.tour_id,
            "tour_title": tour_title,
            "client_id": b.client_id,
            "client_name": b.client_name,
            "client_phone": b.client_phone,
            "client_email": b.client_email,
            "telegram_username": b.telegram_username,
            "date": b.date,
            "time": b.time,
            "participants_count": b.participants_count,
            "total_price": b.total_price,
            "status": b.status.value,
            "payment_status": b.payment_status.value,
            "created_at": b.created_at,
        }
        for b, tour_title in bookings_with_tours
    ]
    
    return BookingList(bookings=bookings_list, total=len(bookings_list))


@router.post("/", response_model=Booking)
async def create_booking(
    booking_data: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Создать бронирование (публичный endpoint)
    
    Автоматически создаёт Request для гида тура
    """
    # Получаем тур
    tour_result = await db.execute(select(Tour).where(Tour.id == booking_data.tour_id))
    tour = tour_result.scalar_one_or_none()
    
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    
    # Рассчитываем цену
    total_price = tour.price * booking_data.participants_count
    
    # Создаём бронирование
    booking = BookingModel(
        tour_id=booking_data.tour_id,
        client_id=current_user.id if current_user else None,
        date=booking_data.date,
        time=booking_data.time or "10:00",
        participants_count=booking_data.participants_count,
        total_price=total_price,
        client_name=booking_data.client_name,
        client_phone=booking_data.client_phone,
        client_email=booking_data.client_email,
        telegram_username=booking_data.telegram_username,
        status=BookingStatus.PENDING,
        payment_status=PaymentStatus.AWAITING_PAYMENT,
    )
    
    db.add(booking)
    await db.flush()  # Получить ID бронирования
    
    # Создаём заявку для гида (БЕЗ client_* полей до применения миграции 008)
    # Данные клиента хранятся в Booking, откуда их берёт endpoint /tours/by-code
    request = RequestModel(
        client_id=current_user.id if current_user else 1,
        title=tour.title,
        description=tour.description,
        preferred_date=booking_data.date,
        participants_count=booking_data.participants_count,
        budget=total_price,
        location=tour.location,
        duration_hours=tour.duration,
        telegram_username=booking_data.telegram_username,
        status='pending',
        booking_id=booking.id,
    )
    
    db.add(request)
    
    # Связываем бронирование с заявкой
    await db.flush()  # Получаем ID request
    booking.request_id = request.id
    
    await db.commit()
    await db.refresh(booking)
    
    return Booking(
        id=booking.id,
        tour_id=booking.tour_id,
        client_id=booking.client_id,
        client_name=booking.client_name,
        client_phone=booking.client_phone,
        client_email=booking.client_email,
        telegram_username=booking.telegram_username,
        date=booking.date,
        time=booking.time,
        participants_count=booking.participants_count,
        total_price=booking.total_price,
        status=booking.status.value,
        payment_status=booking.payment_status.value,
        created_at=booking.created_at,
    )