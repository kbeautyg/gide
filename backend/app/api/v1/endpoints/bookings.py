"""
Эндпоинты для работы с бронированиями
"""
from fastapi import APIRouter
from pydantic import BaseModel, Field
from datetime import datetime, date

router = APIRouter()


class BookingCreate(BaseModel):
    """Создание бронирования"""
    tour_id: str = Field(..., description="ID экскурсии")
    date: date = Field(..., description="Дата экскурсии")
    participants_count: int = Field(..., ge=1, description="Количество участников")
    client_name: str = Field(..., description="Имя клиента")
    client_phone: str = Field(..., description="Телефон клиента")
    client_email: str | None = Field(None, description="Email клиента")


class Booking(BaseModel):
    """Модель бронирования"""
    id: str
    tour_id: str
    tour_title: str
    client_name: str
    client_phone: str
    date: date
    participants_count: int
    total_price: float
    status: str = Field(..., description="в ожидании, подтверждено, отменено")
    payment_status: str = Field(..., description="ожидание оплаты, оплачено, возврат")
    created_at: datetime


@router.post("/", response_model=Booking)
async def create_booking(booking: BookingCreate):
    """
    Создание нового бронирования
    
    Публичный эндпоинт (может использоваться без авторизации)
    TODO: Подключить реальную БД
    """
    # Временная заглушка
    # В реальности: проверка доступности, расчет цены, создание в БД
    
    return Booking(
        id="booking_123",
        tour_id=booking.tour_id,
        tour_title="Обзорная экскурсия по Пхукету",
        client_name=booking.client_name,
        client_phone=booking.client_phone,
        date=booking.date,
        participants_count=booking.participants_count,
        total_price=2500.0 * booking.participants_count,
        status="в ожидании",
        payment_status="ожидание оплаты",
        created_at=datetime.now()
    )


@router.get("/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str):
    """
    Получение информации о бронировании
    
    TODO: Подключить реальную БД
    """
    # Временная заглушка
    return Booking(
        id=booking_id,
        tour_id="tour_1",
        tour_title="Обзорная экскурсия по Пхукету",
        client_name="Иван Иванов",
        client_phone="+79999999999",
        date=date.today(),
        participants_count=2,
        total_price=5000.0,
        status="подтверждено",
        payment_status="оплачено",
        created_at=datetime.now()
    )
