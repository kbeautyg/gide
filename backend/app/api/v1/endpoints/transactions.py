"""
Эндпоинты для работы с транзакциями
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime

from app.db.session import get_db
from app.models.transaction import Transaction, TransactionType
from app.models.user import User
from app.core.deps import get_current_user

router = APIRouter()


class TransactionResponse:
    """Ответ с транзакцией"""
    id: int
    type: str
    amount_rub: float
    amount_usd: float
    amount_thb: float
    description: Optional[str]
    booking_id: Optional[int]
    created_at: str

    def __init__(self, transaction: Transaction):
        self.id = transaction.id
        self.type = transaction.type.value
        self.amount_rub = transaction.amount_rub
        self.amount_usd = transaction.amount_usd
        self.amount_thb = transaction.amount_thb
        self.description = transaction.description
        self.booking_id = transaction.booking_id
        self.created_at = transaction.created_at.isoformat()


@router.get("/", response_model=List[TransactionResponse])
async def get_transactions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить транзакции пользователя"""
    stmt = select(Transaction).where(Transaction.user_id == current_user.id).order_by(desc(Transaction.created_at))
    result = await db.execute(stmt)
    transactions = result.scalars().all()
    
    return [TransactionResponse(t) for t in transactions]
