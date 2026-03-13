"""
Модель статьи журнала
"""
from sqlalchemy import Column, String, Integer, Text, DateTime
from datetime import datetime
from app.db.base import Base


class Article(Base):
    """Модель статьи для журнала"""
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Основная информация
    title = Column(String, nullable=False)
    slug = Column(String, nullable=False, unique=True, index=True)  # URL-friendly
    
    # Контент
    preview_text = Column(Text, nullable=True)  # Краткое описание
    content = Column(Text, nullable=False)  # Полный текст статьи
    photo_url = Column(String, nullable=True)  # Главное фото
    
    # Метаданные
    read_time = Column(Integer, default=5)  # Время чтения в минутах
    country_tag = Column(String, nullable=True, index=True)  # Грузия, Турция
    
    # Статистика
    views_count = Column(Integer, default=0)
    
    # Временные метки
    published_at = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Article {self.title}>"

