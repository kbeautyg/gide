"""
Модель расписания гида (учёт 8-часового рабочего дня)
"""
from sqlalchemy import Column, Integer, ForeignKey, Date, DateTime, UniqueConstraint
from datetime import datetime
from app.db.base import Base


class GuideSchedule(Base):
    """Таблица учёта занятости гида по дням"""
    __tablename__ = "guide_schedules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Связь с гидом
    guide_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Дата
    date = Column(Date, nullable=False, index=True)
    
    # Количество занятых часов (0-8)
    booked_hours = Column(Integer, nullable=False, default=0)
    
    # Временные метки
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Уникальность: один гид может иметь только одну запись на дату
    __table_args__ = (
        UniqueConstraint('guide_id', 'date', name='uix_guide_date'),
    )
    
    def __repr__(self):
        return f"<GuideSchedule guide_id={self.guide_id} date={self.date} booked={self.booked_hours}/8h>"
    
    @property
    def available_hours(self):
        """Свободные часы на дату"""
        return 8 - self.booked_hours
    
    @property
    def is_fully_booked(self):
        """Полностью занят ли день"""
        return self.booked_hours >= 8
    
    @property
    def utilization_percentage(self):
        """Процент занятости дня"""
        return (self.booked_hours / 8) * 100

