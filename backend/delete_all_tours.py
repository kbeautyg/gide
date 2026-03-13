"""
УДАЛЕНИЕ ВСЕХ ТУРОВ, ОТЗЫВОВ И ДОСТОПРИМЕЧАТЕЛЬНОСТЕЙ
"""
import asyncio
import sys
import os

# Добавляем путь к проекту
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import delete, text
from app.core.config import settings

# Async engine
DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def delete_all():
    """УДАЛЯЕТ ВСЁ через SQL напрямую"""
    async with async_session() as session:
        print("=" * 60)
        print("🗑️  УДАЛЕНИЕ ВСЕХ ТУРОВ И СВЯЗАННЫХ ДАННЫХ")
        print("=" * 60)
        
        try:
            # Удаляем через прямые SQL команды (не требуют импорта моделей)
            
            # 1. Удаляем отзывы
            result = await session.execute(text("DELETE FROM reviews"))
            await session.commit()
            print(f"✅ Удалено отзывов: {result.rowcount}")
            
            # 2. Удаляем туры
            result = await session.execute(text("DELETE FROM tours"))
            await session.commit()
            print(f"✅ Удалено туров: {result.rowcount}")
            
            # 3. Удаляем достопримечательности
            result = await session.execute(text("DELETE FROM landmarks"))
            await session.commit()
            print(f"✅ Удалено достопримечательностей: {result.rowcount}")
            
            # 4. Удаляем направления
            result = await session.execute(text("DELETE FROM destinations"))
            await session.commit()
            print(f"✅ Удалено направлений: {result.rowcount}")
            
            # 5. Удаляем статьи
            result = await session.execute(text("DELETE FROM articles"))
            await session.commit()
            print(f"✅ Удалено статей: {result.rowcount}")
            
            print("=" * 60)
            print("🎯 ВСЁ УДАЛЕНО! База данных очищена!")
            print("=" * 60)
        except Exception as e:
            print(f"❌ Ошибка при удалении: {e}")
            print("⚠️ Продолжаем работу...")


if __name__ == "__main__":
    asyncio.run(delete_all())

