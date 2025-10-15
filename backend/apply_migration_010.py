"""
Скрипт для применения миграции 010 - добавление поля time в bookings
"""
import asyncio
from sqlalchemy import text
from app.db.session import async_session_maker


async def apply_migration():
    """Применяет миграцию для добавления поля time"""
    async with async_session_maker() as session:
        try:
            # Проверяем, есть ли уже колонка time
            result = await session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='bookings' AND column_name='time'
            """))
            
            if result.fetchone():
                print("✅ Колонка 'time' уже существует в таблице bookings")
                return
            
            # Добавляем колонку time
            await session.execute(text("""
                ALTER TABLE bookings 
                ADD COLUMN time VARCHAR DEFAULT '10:00'
            """))
            
            await session.commit()
            print("✅ Миграция 010 успешно применена!")
            print("   - Добавлено поле 'time' в таблицу bookings")
            
        except Exception as e:
            print(f"❌ Ошибка при применении миграции: {e}")
            await session.rollback()
            raise


if __name__ == "__main__":
    print("🚀 Применение миграции 010: добавление поля time в bookings")
    asyncio.run(apply_migration())

