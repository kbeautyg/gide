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
    """Сброс БД - удаление таблиц и версии Alembic"""
    
    print("⚠️ ВНИМАНИЕ: Это удалит таблицы: users, tours, bookings, requests, alembic_version")
    
    async with engine.begin() as conn:
        # Удаляем ТОЛЬКО наши таблицы (явно по именам)
        print("🗑️ Удаляем наши таблицы...")
        await conn.execute(sa.text("DROP TABLE IF EXISTS bookings CASCADE"))
        await conn.execute(sa.text("DROP TABLE IF EXISTS requests CASCADE"))
        await conn.execute(sa.text("DROP TABLE IF EXISTS tours CASCADE"))
        await conn.execute(sa.text("DROP TABLE IF EXISTS users CASCADE"))
        await conn.execute(sa.text("DROP TABLE IF EXISTS alembic_version CASCADE"))
        
        # Удаляем наши enum типы
        await conn.execute(sa.text("DROP TYPE IF EXISTS userrole CASCADE"))
        await conn.execute(sa.text("DROP TYPE IF EXISTS bookingstatus CASCADE"))
        await conn.execute(sa.text("DROP TYPE IF EXISTS paymentstatus CASCADE"))
    
    print("✅ База данных очищена!")
    print("📋 Удалены таблицы: users, tours, bookings, requests, alembic_version")
    print("💡 Теперь Alembic создаст таблицы заново через миграции")


if __name__ == "__main__":
    print("🔄 Сброс базы данных...")
    asyncio.run(reset_db())
    print("✅ Готово!")
