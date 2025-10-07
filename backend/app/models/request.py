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
    
    # Статус заявки
    status = Column(String, nullable=True, default='pending')  # pending, in_progress, completed, cancelled
    
    # Кому назначена заявка
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Временные метки
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    client = relationship("User", foreign_keys=[client_id], back_populates="requests")
    assigned_user = relationship("User", foreign_keys=[assigned_to])
    
    def __repr__(self):
        return f"<Request {self.title} by {self.client_id}>"
