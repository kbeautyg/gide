"""
Эндпоинты для работы с транзакциями
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import Transaction as TransactionSchema, TransactionList
from app.core.deps import get_current_user

router = APIRouter()


@router.get("/", response_model=TransactionList)
async def get_transactions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить список транзакций текущего пользователя"""
    
    # Формируем запрос
    query = select(Transaction).where(Transaction.user_id == current_user.id).order_by(Transaction.created_at.desc())
    
    # Подсчет общего количества
    count_query = select(func.count()).select_from(Transaction).where(Transaction.user_id == current_user.id)
    total = await db.scalar(count_query)
    
    # Пагинация
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    
    result = await db.execute(query)
    transactions = result.scalars().all()
    
    return TransactionList(
        transactions=transactions,
        total=total or 0,
        page=page,
        per_page=per_page
    )


@router.get("/{transaction_id}", response_model=TransactionSchema)
async def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить детали транзакции"""
    query = select(Transaction).where(Transaction.id == transaction_id)
    result = await db.execute(query)
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Транзакция не найдена")
    
    # Проверяем права
    if transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа к этой транзакции")
    
    return transaction
