"""
Полный сброс БД - удаление всех таблиц и пересоздание
ВНИМАНИЕ: Удаляет ВСЕ данные!
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from app.db.base import Base
from app.models import User, Tour, Booking

# Async engine
DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=True)


async def reset_db():
    """Сброс и пересоздание всех таблиц"""
    
    print("⚠️ ВНИМАНИЕ: Это удалит ВСЕ данные из БД!")
    
    async with engine.begin() as conn:
        # Удаляем все таблицы
        print("🗑️ Удаляем старые таблицы...")
        await conn.run_sync(Base.metadata.drop_all)
        
        # Создаем таблицы заново
        print("🔧 Создаем новые таблицы...")
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ База данных пересоздана!")


if __name__ == "__main__":
    print("🔄 Сброс базы данных...")
    asyncio.run(reset_db())
    print("✅ Готово!")
