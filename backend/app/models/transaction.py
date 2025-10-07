"""
Модель транзакции
"""
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.base import Base


class TransactionType(str, enum.Enum):
    """Типы транзакций"""
    BOOKING_PAYMENT = "booking_payment"
    WITHDRAWAL = "withdrawal"
    REFUND = "refund"
    ADMIN_ADJUSTMENT = "admin_adjustment"


class Transaction(Base):
    """Модель транзакции"""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Пользователь
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Тип транзакции
    type = Column(SQLEnum(TransactionType), nullable=False)
    
    # Сумма
    amount_rub = Column(Float, nullable=False)
    amount_usd = Column(Float, default=0.0)
    amount_thb = Column(Float, default=0.0)
    
    # Описание
    description = Column(String, nullable=True)
    
    # Связанное бронирование (если есть)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    
    # Временные метки
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="transactions")
    booking = relationship("Booking", back_populates="transactions")
    
    def __repr__(self):
        return f"<Transaction {self.type} {self.amount_rub} RUB>"
