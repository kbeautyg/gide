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
    ADMIN = "admin"           # Администратор (управление контентом)
    MANAGER = "manager"       # Гид (создаёт экскурсии)
    CLIENT = "client"         # Клиент (бронирует экскурсии)


class GuideStatus(str, enum.Enum):
    """Статус заявки на гида"""
    NONE = "none"             # Не подавал заявку
    PENDING = "pending"       # На рассмотрении
    APPROVED = "approved"     # Одобрено
    REJECTED = "rejected"     # Отклонено

    def __str__(self):
        return self.value


class User(Base):
    """Модель пользователя"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    phone = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=True, index=True)
    email = Column(String, unique=True, nullable=True, index=True)
    name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.CLIENT)
    
    # Статус заявки на гида
    guide_status = Column(SQLEnum(GuideStatus, values_callable=lambda obj: [e.value for e in obj]), nullable=False, default=GuideStatus.NONE)
    
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
    messages = relationship("Message", back_populates="sender")
    
    def __repr__(self):
        return f"<User {self.phone} ({self.role})>"
