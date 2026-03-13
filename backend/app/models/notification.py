"""
Модель уведомлений
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Notification(Base):
    """Уведомление для пользователя"""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(20), default="info")  # info, success, warning
    link = Column(String(500), nullable=True)   # Ссылка для перехода при клике
    
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationship
    user = relationship("User", backref="notifications")

    def __repr__(self):
        return f"<Notification {self.id} for User {self.user_id}: {self.title}>"
