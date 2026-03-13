"""
Миграция: создание таблицы notifications
Если таблица существует с неправильными типами (UUID вместо INTEGER) — пересоздаём.
"""
import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv('DATABASE_URL', '').replace('postgresql://', 'postgresql+asyncpg://')

if not DATABASE_URL:
    print("⚠️ DATABASE_URL не задан, пропускаем миграцию notifications")
else:
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async def migrate():
        async with async_session() as session:
            # Проверяем, существует ли таблица
            check = await session.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'notifications'
                )
            """))
            exists = check.scalar()

            if exists:
                # Проверяем тип колонки user_id — если UUID, нужно пересоздать
                col_type_check = await session.execute(text("""
                    SELECT data_type FROM information_schema.columns
                    WHERE table_name = 'notifications' AND column_name = 'user_id'
                """))
                row = col_type_check.first()
                col_type = row[0] if row else None

                if col_type and col_type != 'integer':
                    print(f"⚠️ notifications.user_id имеет тип '{col_type}', нужен 'integer'. Пересоздаём таблицу...")
                    await session.execute(text("DROP TABLE notifications CASCADE"))
                    await session.commit()
                    print("🗑️ Старая таблица notifications удалена")
                else:
                    # Таблица есть и тип правильный — проверяем колонку link
                    col_check = await session.execute(text("""
                        SELECT EXISTS (
                            SELECT FROM information_schema.columns
                            WHERE table_name = 'notifications' AND column_name = 'link'
                        )
                    """))
                    has_link = col_check.scalar()
                    if not has_link:
                        print("📋 Добавляем колонку link в notifications...")
                        await session.execute(text(
                            "ALTER TABLE notifications ADD COLUMN link VARCHAR(500)"
                        ))
                        await session.commit()
                        print("✅ Колонка link добавлена")
                    else:
                        print("✅ Таблица notifications уже существует и корректна")
                    return

            # Создаём таблицу с INTEGER типами (как в моделях SQLAlchemy)
            print("📋 Создаём таблицу notifications...")
            await session.execute(text("""
                CREATE TABLE notifications (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    type VARCHAR(20) DEFAULT 'info',
                    link VARCHAR(500),
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """))
            await session.execute(text("CREATE INDEX IF NOT EXISTS ix_notifications_user_id ON notifications(user_id)"))
            await session.execute(text("CREATE INDEX IF NOT EXISTS ix_notifications_is_read ON notifications(is_read)"))
            await session.execute(text("CREATE INDEX IF NOT EXISTS ix_notifications_created_at ON notifications(created_at)"))
            await session.commit()
            print("✅ Таблица notifications создана успешно")

    asyncio.run(migrate())
