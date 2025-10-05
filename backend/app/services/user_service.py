"""
Сервис для работы с пользователями
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import uuid

from app.models.user import User, UserRole
from app.core.security import get_password_hash, verify_password


class UserService:
    """Сервис для работы с пользователями"""
    
    @staticmethod
    async def get_user_by_phone(db: AsyncSession, phone: str) -> Optional[User]:
        """Получение пользователя по телефону"""
        result = await db.execute(
            select(User).where(User.phone == phone)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
        """Получение пользователя по ID"""
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_user(
        db: AsyncSession,
        phone: str,
        password: str,
        email: Optional[str] = None,
        name: Optional[str] = None,
        role: UserRole = UserRole.CLIENT,
        parent_id: Optional[int] = None,
    ) -> User:
        """Создание нового пользователя"""
        user = User(
            phone=phone,
            email=email,
            name=name,
            hashed_password=get_password_hash(password),
            role=role,
            parent_id=parent_id,
            balance_rub=0.0,
            balance_usd=0.0,
            balance_thb=0.0,
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        return user
    
    @staticmethod
    async def authenticate_user(
        db: AsyncSession,
        phone: str,
        password: str
    ) -> Optional[User]:
        """Аутентификация пользователя"""
        user = await UserService.get_user_by_phone(db, phone)
        
        if not user:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
        
        return user
    
    @staticmethod
    async def get_user_hierarchy(
        db: AsyncSession,
        user_id: int
    ) -> List[User]:
        """
        Получение всех подчиненных пользователей
        (для админа - его когорта, для супер-менеджера - его менеджеры)
        """
        result = await db.execute(
            select(User).where(User.parent_id == user_id)
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def update_user_balance(
        db: AsyncSession,
        user_id: int,
        currency: str,  # 'rub', 'usd', 'thb'
        amount: float,
    ) -> Optional[User]:
        """Обновление баланса пользователя"""
        user = await UserService.get_user_by_id(db, user_id)
        
        if not user:
            return None
        
        if currency == 'rub':
            user.balance_rub += amount
        elif currency == 'usd':
            user.balance_usd += amount
        elif currency == 'thb':
            user.balance_thb += amount
        
        await db.commit()
        await db.refresh(user)
        
        return user
    
    @staticmethod
    async def change_user_parent(
        db: AsyncSession,
        user_id: int,
        new_parent_id: int,
    ) -> Optional[User]:
        """
        Переназначение менеджера между админами
        (Для бага: перенести flower@nadi.com с Kiril на Farukh)
        """
        user = await UserService.get_user_by_id(db, user_id)
        
        if not user:
            return None
        
        user.parent_id = new_parent_id
        await db.commit()
        await db.refresh(user)
        
        return user
