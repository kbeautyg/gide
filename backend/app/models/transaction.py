"""
Модель транзакции
"""
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base import Base


class Transaction(Base):
    """Транзакции пользователей"""
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # booking_payment, withdrawal, exchange, refund
    amount_rub = Column(Float, nullable=False)
    amount_usd = Column(Float, default=0.0)
    amount_thb = Column(Float, default=0.0)
    description = Column(Text)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="transactions")
    booking = relationship("Booking", back_populates="transaction")
