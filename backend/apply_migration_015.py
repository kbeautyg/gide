"""
Миграция 015: Установить is_public=True для всех туров
"""
import asyncio
import os
import sys

# Добавляем путь к приложению
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.db.session import async_session


async def apply_migration():
    """Устанавливает is_public=True для всех туров"""
    async with async_session() as session:
        try:
            # Проверяем текущее состояние
            result = await session.execute(text("SELECT COUNT(*) FROM tours WHERE is_public = FALSE OR is_public IS NULL"))
            count_before = result.scalar()
            
            if count_before == 0:
                print("✅ Миграция 015: Все туры уже публичные, пропускаем")
                return
            
            print(f"🔄 Миграция 015: Обновляем {count_before} туров...")
            
            # Обновляем все туры
            await session.execute(text("UPDATE tours SET is_public = TRUE WHERE is_public = FALSE OR is_public IS NULL"))
            await session.commit()
            
            # Проверяем результат
            result = await session.execute(text("SELECT COUNT(*) FROM tours WHERE is_public = TRUE"))
            count_after = result.scalar()
            
            print(f"✅ Миграция 015: Успешно! Теперь {count_after} туров публичные")
            
        except Exception as e:
            print(f"⚠️ Миграция 015: Ошибка - {e}")
            await session.rollback()


if __name__ == "__main__":
    asyncio.run(apply_migration())

