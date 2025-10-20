"""
Модель категории для управления рубриками и разделами экскурсий
"""
from sqlalchemy import Column, String, Integer, Boolean, Text, JSON, DateTime, Float
from datetime import datetime
from app.db.base import Base


class Category(Base):
    """Категория/Рубрика экскурсий (управляется админом)"""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Основная информация
    name = Column(String, nullable=False, unique=True, index=True)  # "Храмы и святыни"
    slug = Column(String, nullable=False, unique=True, index=True)  # "temples-shrines"
    description = Column(Text, nullable=True)  # Описание категории
    
    # Тип категории
    type = Column(String, nullable=False, index=True)  # "landmark", "theme", "format", "collection"
    
    # Иконка и изображение
    icon = Column(String, nullable=True)  # lucide-icon name или emoji
    image_url = Column(String, nullable=True)  # URL изображения категории
    
    # Фильтр и метаданные
    filters = Column(JSON, default=dict)  # {"location": "Бангкок", "min_rating": 4.5}
    metadata = Column(JSON, default=dict)  # Дополнительная информация
    
    # SEO
    seo_title = Column(String, nullable=True)
    seo_description = Column(Text, nullable=True)
    
    # Сортировка и отображение
    display_order = Column(Integer, default=0)  # Порядок отображения
    is_featured = Column(Boolean, default=False)  # Показывать на главной
    is_active = Column(Boolean, default=True)  # Активна ли категория
    
    # Статистика
    views_count = Column(Integer, default=0)
    clicks_count = Column(Integer, default=0)
    
    # Временные метки
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Category {self.name} ({self.type})>"


class Collection(Base):
    """Коллекция экскурсий (подборка)"""
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Основная информация
    title = Column(String, nullable=False)  # "Лучшие водные экскурсии"
    slug = Column(String, nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    
    # Изображение
    cover_image = Column(String, nullable=True)
    
    # Туры в коллекции (массив ID)
    tour_ids = Column(JSON, default=list)  # [1, 5, 12, 43]
    
    # Автоматическая коллекция (на основе фильтров)
    is_automatic = Column(Boolean, default=False)
    auto_filters = Column(JSON, default=dict)  # {"category": "Водные", "min_rating": 4.7}
    auto_limit = Column(Integer, nullable=True)  # Максимум туров в автоколлекции
    
    # Отображение
    display_order = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)  # На главной
    is_active = Column(Boolean, default=True)
    
    # SEO
    seo_title = Column(String, nullable=True)
    seo_description = Column(Text, nullable=True)
    
    # Статистика
    views_count = Column(Integer, default=0)
    clicks_count = Column(Integer, default=0)
    
    # Временные метки
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Collection {self.title}>"


