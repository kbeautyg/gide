"""
Модель бронирования
"""
from sqlalchemy import Column, String, Integer, Float, Date, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.base import Base


class BookingStatus(str, enum.Enum):
    """Статусы бронирования"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class PaymentStatus(str, enum.Enum):
    """Статусы оплаты"""
    AWAITING_PAYMENT = "awaiting_payment"
    PAID = "paid"
    REFUNDED = "refunded"


class Booking(Base):
    """Модель бронирования"""
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Связь с экскурсией и клиентом
    tour_id = Column(Integer, ForeignKey("tours.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Детали бронирования
    date = Column(Date, nullable=False)
    # time = Column(String, nullable=True, default="10:00")  # Время экскурсии (HH:MM) - temporarily disabled until migration
    participants_count = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)
    
    # Статусы
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.PENDING)
    payment_status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.AWAITING_PAYMENT)
    
    # Контактная информация клиента
    client_name = Column(String, nullable=False)
    client_phone = Column(String, nullable=False)
    client_email = Column(String, nullable=True)
    telegram_username = Column(String, nullable=True)
    
    # Связь с заявкой
    request_id = Column(Integer, ForeignKey("requests.id"), nullable=True)
    
    # Временные метки
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tour = relationship("Tour", back_populates="bookings")
    client = relationship("User", back_populates="bookings", foreign_keys=[client_id])
    messages = relationship("Message", back_populates="booking", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Booking {self.id} for Tour {self.tour_id}>"
