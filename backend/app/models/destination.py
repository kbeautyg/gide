"""
Модель направления (города/локации)
"""
from sqlalchemy import Column, String, Integer, Text, DateTime
from datetime import datetime
from app.db.base import Base


class Destination(Base):
    """Модель направления"""
    __tablename__ = "destinations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Основная информация
    name = Column(String, nullable=False, index=True)  # Тбилиси
    country = Column(String, nullable=False, index=True)  # Грузия
    slug = Column(String, nullable=False, unique=True, index=True)  # tbilisi
    
    # Медиа и описание
    photo_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    seo_text = Column(Text, nullable=True)  # Длинный SEO-текст
    
    # Статистика
    tours_count = Column(Integer, default=0)
    
    # Временные метки
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<Destination {self.name}, {self.country}>"

