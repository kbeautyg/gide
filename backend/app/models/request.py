"""
Модель заявки клиента на экскурсию
"""
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, Text, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Request(Base):
    """Модель заявки клиента на экскурсию"""
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Клиент который создал заявку
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Основная информация
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    preferred_date = Column(Date, nullable=True)
    participants_count = Column(Integer, nullable=False)
    budget = Column(Float, nullable=True)
    location = Column(String, nullable=True)
    
    # Длительность экскурсии (1-8 часов)
    duration_hours = Column(Integer, nullable=False, default=2)
    
    # Статус заявки
    status = Column(String, nullable=True, default='pending')  # pending, assigned, in_progress, completed, cancelled
    
    # Гид, который взял заявку
    guide_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Дата назначения гидом
    assigned_date = Column(Date, nullable=True, index=True)
    
    # Кому назначена заявка (устаревшее, используется guide_id)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Временные метки
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    client = relationship("User", foreign_keys=[client_id], back_populates="requests")
    guide = relationship("User", foreign_keys=[guide_id])
    assigned_user = relationship("User", foreign_keys=[assigned_to])
    
    def __repr__(self):
        return f"<Request {self.title} ({self.duration_hours}h) by client#{self.client_id}>"
    
    @property
    def is_available(self):
        """Доступна ли заявка для взятия"""
        return self.guide_id is None and self.status == 'pending'
    
    @property
    def is_short(self):
        """Короткая экскурсия (до 2ч)"""
        return self.duration_hours <= 2
    
    @property
    def is_long(self):
        """Длинная экскурсия (5+ часов)"""
        return self.duration_hours >= 5
