"""
Автоматическая инициализация данных для production
ОТКЛЮЧЕНО - туры теперь загружаются через Tour Rewriter
"""
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, func
from app.core.config import settings
from app.models.tour import Tour
from app.models.user import User, UserRole

DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_data():
    """
    ОТКЛЮЧЕНО - автоматическая инициализация туров отключена.
    Туры теперь загружаются через Tour Rewriter с ChatGPT рерайтом.
    """
    async with async_session() as session:
        # Проверяем есть ли туры
        tours_count_result = await session.execute(select(func.count(Tour.id)))
        tours_count = tours_count_result.scalar()
        
        print(f"📊 В базе {tours_count} туров.")
        print("ℹ️  Автоинициализация туров ОТКЛЮЧЕНА.")
        print("ℹ️  Используйте Tour Rewriter для загрузки туров с ChatGPT рерайтом.")


if __name__ == "__main__":
    asyncio.run(init_data())

