"""
База данных - Base класс для моделей
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Базовый класс для всех моделей"""
    pass


# Импортируем все модели для корректной работы Alembic
from app.models.user import User
from app.models.tour import Tour
from app.models.booking import Booking
from app.models.request import Request
from app.models.transaction import Transaction
