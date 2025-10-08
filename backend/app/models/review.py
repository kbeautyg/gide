"""
Модель отзыва
"""
from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Review(Base):
    """Модель отзыва на экскурсию"""
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Связь с экскурсией
    tour_id = Column(Integer, ForeignKey("tours.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Информация о пользователе
    user_name = Column(String, nullable=False)  # Имя
    user_photo = Column(String, nullable=True)  # URL фото
    experience_count = Column(Integer, default=1)  # Сколько экскурсий посетил
    
    # Отзыв
    rating = Column(Float, nullable=False, index=True)  # 1.0 - 5.0
    text = Column(Text, nullable=False)
    
    # Временные метки
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    tour = relationship("Tour", backref="tour_reviews")
    
    def __repr__(self):
        return f"<Review by {self.user_name} for Tour #{self.tour_id}>"

