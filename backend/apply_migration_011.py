"""
Скрипт для применения миграции 011 - добавление поля client_telegram в tours
"""
import asyncio
from sqlalchemy import text
from app.db.session import async_session_maker


async def apply_migration():
    """Применяет миграцию для добавления поля client_telegram"""
    async with async_session_maker() as session:
        try:
            # Проверяем, есть ли уже колонка client_telegram
            result = await session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='tours' AND column_name='client_telegram'
            """))
            
            if result.fetchone():
                print("✅ Колонка 'client_telegram' уже существует в таблице tours")
                return
            
            # Добавляем колонку client_telegram
            await session.execute(text("""
                ALTER TABLE tours 
                ADD COLUMN client_telegram VARCHAR
            """))
            
            await session.commit()
            print("✅ Миграция 011 успешно применена!")
            print("   - Добавлено поле 'client_telegram' в таблицу tours")
            
        except Exception as e:
            print(f"❌ Ошибка при применении миграции: {e}")
            await session.rollback()
            raise


if __name__ == "__main__":
    print("🚀 Применение миграции 011: добавление поля client_telegram в tours")
    asyncio.run(apply_migration())

