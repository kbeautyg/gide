import asyncio
import os
import sys
from sqlalchemy import text

# Добавляем путь к приложению
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import async_session

async def apply_migration():
    """Добавляет username в таблицу users"""
    print("🔄 Начинаем миграцию username...")
    
    async with async_session() as session:
        try:
            # 1. Проверяем существование колонки
            print("🔍 Проверяем колонку username...")
            result = await session.execute(text(
                "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='username'"
            ))
            if result.scalar():
                print("✅ Колонка username уже существует. Миграция не требуется.")
                return

            # 2. Добавляем колонку
            print("🔄 Добавляем колонку username...")
            try:
                await session.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR UNIQUE"))
                # Note: Index creation might need separate error handling if index exists, but checking column usually enough
                await session.execute(text("CREATE INDEX IF NOT EXISTS ix_users_username ON users (username)"))
                await session.commit()
                print("✅ Колонка username успешно добавлена")
            except Exception as e:
                print(f"❌ Ошибка при добавлении колонки: {e}")
                await session.rollback()
                sys.exit(1)

        except Exception as e:
            print(f"❌ Общая ошибка миграции: {e}")
            await session.rollback()
            sys.exit(1)

if __name__ == "__main__":
    try:
        asyncio.run(apply_migration())
    except Exception as e:
        print(f"💥 Фатальная ошибка скрипта: {e}")
        sys.exit(1)
