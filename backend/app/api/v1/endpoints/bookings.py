"""
Эндпоинты для работы с бронированиями
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.booking import Booking as BookingModel, BookingStatus, PaymentStatus
from app.models.tour import Tour
from app.models.user import User
from app.models.transaction import Transaction, TransactionType
from app.core.deps import get_current_user

router = APIRouter()


class BookingCreate(BaseModel):
    """Создание бронирования"""
    tour_id: int = Field(..., description="ID экскурсии")
    date: str = Field(..., description="Дата экскурсии (YYYY-MM-DD)")
    participants_count: int = Field(..., ge=1, description="Количество участников")
    client_name: str = Field(..., description="Имя клиента")
    client_phone: str = Field(..., description="Телефон клиента")
    client_email: Optional[str] = Field(None, description="Email клиента")


class BookingResponse(BaseModel):
    """Ответ с бронированием"""
    id: int
    tour_id: int
    client_id: int
    tour_title: str
    client_name: str
    client_phone: str
    client_email: Optional[str]
    date: str
    participants_count: int
    total_price: float
    status: str
    payment_status: str
    created_at: str


@router.post("/", response_model=BookingResponse)
async def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Создание нового бронирования
    """
    # Получаем экскурсию
    tour_stmt = select(Tour).where(Tour.id == booking_data.tour_id)
    tour = (await db.execute(tour_stmt)).scalar_one_or_none()
    
    if not tour:
        raise HTTPException(status_code=404, detail="Экскурсия не найдена")
    
    # Рассчитываем стоимость
    total_price = tour.price * booking_data.participants_count
    
    # Создаем бронирование
    booking = BookingModel(
        tour_id=booking_data.tour_id,
        client_id=current_user.id,
        date=datetime.strptime(booking_data.date, '%Y-%m-%d').date(),
        participants_count=booking_data.participants_count,
        total_price=total_price,
        status=BookingStatus.PENDING,
        payment_status=PaymentStatus.AWAITING_PAYMENT,
        client_name=booking_data.client_name,
        client_phone=booking_data.client_phone,
        client_email=booking_data.client_email,
    )
    
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    
    # Обновляем баланс гида при тестовой оплате
    guide_stmt = select(User).where(User.id == tour.guide_id)
    guide = (await db.execute(guide_stmt)).scalar_one_or_none()
    
    if guide:
        # Обновляем баланс в рублях
        guide.balance_rub += total_price
        guide.updated_at = datetime.now()
        
        # Создаем транзакцию
        transaction = Transaction(
            user_id=guide.id,
            type=TransactionType.BOOKING_PAYMENT,
            amount_rub=total_price,
            description=f"Оплата за экскурсию: {tour.title}",
            booking_id=booking.id
        )
        db.add(transaction)
        
        await db.commit()
    
    return BookingResponse(
        id=booking.id,
        tour_id=booking.tour_id,
        client_id=booking.client_id,
        tour_title=tour.title,
        client_name=booking.client_name,
        client_phone=booking.client_phone,
        client_email=booking.client_email,
        date=booking.date.isoformat(),
        participants_count=booking.participants_count,
        total_price=booking.total_price,
        status=booking.status.value,
        payment_status=booking.payment_status.value,
        created_at=booking.created_at.isoformat() if booking.created_at else datetime.utcnow().isoformat()
    )


@router.get("/", response_model=List[BookingResponse])
async def get_bookings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить все бронирования пользователя"""
    stmt = select(BookingModel).where(BookingModel.client_id == current_user.id)
    result = await db.execute(stmt)
    bookings = result.scalars().all()
    
    # Получаем туры для названий
    tour_ids = [b.tour_id for b in bookings]
    tours_stmt = select(Tour).where(Tour.id.in_(tour_ids))
    tours_result = await db.execute(tours_stmt)
    tours_dict = {t.id: t for t in tours_result.scalars().all()}
    
    return [
        BookingResponse(
            id=b.id,
            tour_id=b.tour_id,
            client_id=b.client_id,
            tour_title=tours_dict.get(b.tour_id).title if tours_dict.get(b.tour_id) else "Unknown",
            client_name=b.client_name,
            client_phone=b.client_phone,
            client_email=b.client_email,
            date=b.date.isoformat(),
            participants_count=b.participants_count,
            total_price=b.total_price,
            status=b.status.value,
            payment_status=b.payment_status.value,
            created_at=b.created_at.isoformat() if b.created_at else datetime.utcnow().isoformat()
        )
        for b in bookings
    ]


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить информацию о бронировании"""
    stmt = select(BookingModel).where(BookingModel.id == booking_id)
    booking = (await db.execute(stmt)).scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Бронирование не найдено")
    
    # Проверка прав
    if booking.client_id != current_user.id and current_user.role.value not in ['super_admin', 'admin', 'super_manager', 'manager']:
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    # Получаем тур
    tour_stmt = select(Tour).where(Tour.id == booking.tour_id)
    tour = (await db.execute(tour_stmt)).scalar_one_or_none()
    
    return BookingResponse(
        id=booking.id,
        tour_id=booking.tour_id,
        client_id=booking.client_id,
        tour_title=tour.title if tour else "Unknown",
        client_name=booking.client_name,
        client_phone=booking.client_phone,
        client_email=booking.client_email,
        date=booking.date.isoformat(),
        participants_count=booking.participants_count,
        total_price=booking.total_price,
        status=booking.status.value,
        payment_status=booking.payment_status.value,
        created_at=booking.created_at.isoformat() if booking.created_at else datetime.utcnow().isoformat()
    )