#!/usr/bin/env python3
"""
Полная очистка базы данных
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.db.base import Base

async def reset_database():
    """Полная очистка базы данных"""
    
    # Создаем подключение к БД
    DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    print("🗑️ Очищаем базу данных...")
    
    # Удаляем все таблицы
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    print("✅ Все таблицы удалены")
    
    # Создаем таблицы заново
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Таблицы созданы заново")
    
    await engine.dispose()
    print("🎉 База данных полностью сброшена!")

if __name__ == "__main__":
    asyncio.run(reset_database())