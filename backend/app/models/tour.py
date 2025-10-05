"""
Модель экскурсии
"""
from sqlalchemy import Column, String, Float, Integer, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Tour(Base):
    """Модель экскурсии"""
    __tablename__ = "tours"

    id = Column(String, primary_key=True, index=True)
    
    # Гид/менеджер который создал экскурсию
    guide_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Основная информация
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)  # Цена в RUB
    duration = Column(Integer, nullable=False)  # Длительность в часах
    location = Column(String, nullable=False)  # Пхукет, Паттайя и т.д.
    category = Column(String, nullable=False)  # Культура, природа и т.д.
    
    # Фотографии (список URL)
    photos = Column(JSON, default=list)
    
    # Рейтинг и отзывы
    rating = Column(Float, default=0.0)
    reviews_count = Column(Integer, default=0)
    
    # Статус
    active = Column(Boolean, default=True)
    
    # Временные метки
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    guide = relationship("User", back_populates="tours")
    bookings = relationship("Booking", back_populates="tour")
    
    def __repr__(self):
        return f"<Tour {self.title} ({self.location})>"
