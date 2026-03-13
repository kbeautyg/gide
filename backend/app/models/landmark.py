"""
Модель достопримечательности
"""
from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Landmark(Base):
    """Модель достопримечательности"""
    __tablename__ = "landmarks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Связь с направлением
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Основная информация
    name = Column(String, nullable=False)  # Серпантин, Храм Метехи
    photo_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    
    # Статистика
    tours_count = Column(Integer, default=0)
    
    # Временные метки
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<Landmark {self.name}>"

