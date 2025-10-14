"""
Модель экскурсии
"""
from sqlalchemy import Column, String, Float, Integer, Boolean, ForeignKey, DateTime, Text, JSON, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Tour(Base):
    """Модель экскурсии"""
    __tablename__ = "tours"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Гид/менеджер который создал экскурсию
    guide_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Уникальный код для шаринга (короткая ссылка)
    share_code = Column(String(8), unique=True, index=True, nullable=True)
    
    # Кастомная экскурсия (создана из заявки)
    is_custom = Column(Boolean, default=False)
    request_id = Column(Integer, ForeignKey("requests.id"), nullable=True)
    
    # Основная информация
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)  # Цена в RUB
    duration = Column(Integer, nullable=False)  # Длительность в часах
    location = Column(String, nullable=False)  # Пхукет, Паттайя и т.д.
    category = Column(String, nullable=False)  # Культура, природа и т.д.
    
    # Даты проведения экскурсии
    start_date = Column(Date, nullable=True)  # С какой даты
    end_date = Column(Date, nullable=True)   # По какую дату
    
    # Фотографии (список URL)
    photos = Column(JSON, default=list)
    
    # Рейтинг и отзывы
    rating = Column(Float, default=0.0)
    reviews_count = Column(Integer, default=0)
    
    # Контентные блоки (Tripster-стиль)
    what_to_expect = Column(Text, nullable=True)  # "Что вас ожидает"
    organizational_details = Column(Text, nullable=True)  # "Организационные детали"
    included = Column(JSON, default=list)  # Список включённого
    not_included = Column(JSON, default=list)  # Что НЕ включено
    meeting_point = Column(String, nullable=True)  # Место встречи
    languages = Column(JSON, default=list)  # ["русский", "английский"]
    max_group_size = Column(Integer, nullable=True)  # Макс. размер группы
    min_age = Column(Integer, nullable=True)  # Минимальный возраст
    difficulty_level = Column(String, nullable=True)  # "Лёгкая", "Средняя", "Сложная"
    
    # Достопримечательности и теги
    landmarks = Column(JSON, default=list)  # ["Серпантин", "Храм", "Водопад"]
    tags = Column(JSON, default=list)  # ["Для семей", "Фотосессия", "Гастро"]
    themes = Column(JSON, default=list)  # ["Винные", "Казбеги", "Кахетия"]
    formats = Column(JSON, default=list)  # ["Индивидуальные туры", "Треккинг"]
    
    # SEO и контент
    seo_title = Column(String, nullable=True)
    seo_description = Column(Text, nullable=True)
    long_description = Column(Text, nullable=True)  # Длинный редакционный текст
    
    # Статистика и промо
    total_bookings = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    has_discount = Column(Boolean, default=False)
    is_new = Column(Boolean, default=False)
    discount_percentage = Column(Integer, nullable=True)  # Процент скидки
    original_price = Column(Float, nullable=True)  # Старая цена
    
    # Статус
    active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=False, index=True)
    is_archived = Column(Boolean, default=False, index=True)  # Архивный тур (оплачен и скрыт из "Мои экскурсии")
    
    # Данные клиента (для кастомных туров)
    client_name = Column(String, nullable=True)
    client_phone = Column(String, nullable=True)
    client_email = Column(String, nullable=True)
    
    # Временные метки
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    guide = relationship("User", back_populates="tours")
    bookings = relationship("Booking", back_populates="tour")
    
    def __repr__(self):
        return f"<Tour {self.title} ({self.location})>"
