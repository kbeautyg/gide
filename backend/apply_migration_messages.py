"""
Миграция: создание таблицы messages (если не существует)
"""
import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv('DATABASE_URL', '').replace('postgresql://', 'postgresql+asyncpg://')

if not DATABASE_URL:
    print("⚠️ DATABASE_URL не задан, пропускаем миграцию messages")
else:
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async def migrate():
        async with async_session() as session:
            # Проверяем, существует ли таблица
            check = await session.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'messages'
                )
            """))
            exists = check.scalar()

            if exists:
                print("✅ Таблица messages уже существует")
                return

            print("📋 Создаём таблицу messages...")
            await session.execute(text("""
                CREATE TABLE messages (
                    id SERIAL PRIMARY KEY,
                    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
                    sender_id INTEGER NOT NULL REFERENCES users(id),
                    content TEXT NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """))
            await session.execute(text("CREATE INDEX ix_messages_booking_id ON messages(booking_id)"))
            await session.execute(text("CREATE INDEX ix_messages_id ON messages(id)"))
            await session.commit()
            print("✅ Таблица messages создана успешно")

    asyncio.run(migrate())
