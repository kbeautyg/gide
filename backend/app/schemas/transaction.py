"""
Схемы для транзакций
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TransactionBase(BaseModel):
    """Базовая схема транзакции"""
    type: str
    amount_rub: float
    amount_usd: float = 0.0
    amount_thb: float = 0.0
    description: Optional[str] = None
    booking_id: Optional[int] = None


class TransactionCreate(TransactionBase):
    """Создание транзакции"""
    user_id: int


class Transaction(TransactionBase):
    """Транзакция"""
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class TransactionList(BaseModel):
    """Список транзакций"""
    transactions: list[Transaction]
    total: int
    page: int
    per_page: int
