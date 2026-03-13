"""
Модель сообщения чата
"""
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Message(Base):
    """Модель сообщения в чате (привязана к бронированию)"""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Чат привязан к конкретному бронированию
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, index=True)
    
    # Отправитель
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Содержимое
    content = Column(Text, nullable=False)
    
    # Статус
    is_read = Column(Boolean, default=False)
    
    # Время
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    booking = relationship("Booking", back_populates="messages")
    sender = relationship("User", back_populates="messages")

    def __repr__(self):
        return f"<Message {self.id} from {self.sender_id}>"
