"""
Модель пользователя
"""
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.base import Base


class UserRole(str, enum.Enum):
    """Роли пользователей"""
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    SUPER_MANAGER = "super_manager"
    MANAGER = "manager"
    GUIDE = "guide"
    CLIENT = "client"
    EXCHANGER = "exchanger"


class User(Base):
    """Модель пользователя"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    phone = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=True, index=True)
    name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.CLIENT)
    
    # Иерархия - родительский пользователь (админ/супер-менеджер)
    parent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Балансы
    balance_rub = Column(Float, default=0.0)
    balance_usd = Column(Float, default=0.0)
    balance_thb = Column(Float, default=0.0)
    
    # Временные метки
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    parent = relationship("User", remote_side=[id], backref="children")
    tours = relationship("Tour", back_populates="guide")
    bookings = relationship("Booking", back_populates="client", foreign_keys="Booking.client_id")
    requests = relationship("Request", back_populates="client", foreign_keys="Request.client_id")
    assigned_requests = relationship("Request", back_populates="assigned_user", foreign_keys="Request.assigned_to")
    
    def __repr__(self):
        return f"<User {self.phone} ({self.role})>"
