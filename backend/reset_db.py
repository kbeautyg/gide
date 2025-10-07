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
    """Сброс БД - полное удаление всех наших объектов"""
    
    print("⚠️ ВНИМАНИЕ: Полный сброс БД!")
    
    async with engine.begin() as conn:
        # Шаг 1: Удаляем таблицы в правильном порядке (зависимые первыми)
        print("🗑️ Удаляем таблицы...")
        await conn.execute(sa.text("DROP TABLE IF EXISTS bookings CASCADE"))
        await conn.execute(sa.text("DROP TABLE IF EXISTS requests CASCADE"))
        await conn.execute(sa.text("DROP TABLE IF EXISTS tours CASCADE"))
        await conn.execute(sa.text("DROP TABLE IF EXISTS users CASCADE"))
        await conn.execute(sa.text("DROP TABLE IF EXISTS alembic_version CASCADE"))
        
        # Шаг 2: Агрессивное удаление ENUM типов с CASCADE
        print("🗑️ Удаляем ENUM типы...")
        # Сначала пробуем DROP TYPE
        await conn.execute(sa.text("DROP TYPE IF EXISTS userrole CASCADE"))
        await conn.execute(sa.text("DROP TYPE IF EXISTS bookingstatus CASCADE"))
        await conn.execute(sa.text("DROP TYPE IF EXISTS paymentstatus CASCADE"))
        
        # Шаг 3: Принудительное удаление через pg_type (на случай если CASCADE не сработал)
        await conn.execute(sa.text("""
            DO $$ 
            BEGIN
                IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN
                    DROP TYPE userrole CASCADE;
                END IF;
                IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bookingstatus') THEN
                    DROP TYPE bookingstatus CASCADE;
                END IF;
                IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paymentstatus') THEN
                    DROP TYPE paymentstatus CASCADE;
                END IF;
            END $$;
        """))
    
    print("✅ База данных полностью очищена!")
    print("💡 Alembic создаст всё заново")


if __name__ == "__main__":
    print("🔄 Сброс базы данных...")
    asyncio.run(reset_db())
    print("✅ Готово!")
