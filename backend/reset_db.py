"""
Полный сброс БД - удаление только НАШИХ таблиц и пересоздание
ВНИМАНИЕ: Удаляет таблицы users, tours, bookings!
Безопасно: НЕ трогает таблицы других сервисов
"""
import asyncio
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from app.db.base import Base
from app.models import User, Tour, Booking

# Async engine
DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=True)


async def reset_db():
    """Сброс и пересоздание всех таблиц"""
    
    print("⚠️ ВНИМАНИЕ: Это удалит таблицы: users, tours, bookings")
    
    async with engine.begin() as conn:
        # Удаляем ТОЛЬКО наши таблицы (явно по именам)
        print("🗑️ Удаляем наши таблицы...")
        await conn.execute(sa.text("DROP TABLE IF EXISTS bookings CASCADE"))
        await conn.execute(sa.text("DROP TABLE IF EXISTS tours CASCADE"))
        await conn.execute(sa.text("DROP TABLE IF EXISTS users CASCADE"))
        
        # Удаляем наши enum типы
        await conn.execute(sa.text("DROP TYPE IF EXISTS userrole CASCADE"))
        await conn.execute(sa.text("DROP TYPE IF EXISTS bookingstatus CASCADE"))
        await conn.execute(sa.text("DROP TYPE IF EXISTS paymentstatus CASCADE"))
        
        # Создаем таблицы заново через наши модели
        print("🔧 Создаем новые таблицы...")
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ База данных пересоздана!")
    print("📋 Созданы таблицы: users, tours, bookings")


if __name__ == "__main__":
    print("🔄 Сброс базы данных...")
    asyncio.run(reset_db())
    print("✅ Готово!")
