"""
Скрипт для ПОЛНОЙ ОЧИСТКИ старых данных и загрузки новых азиатских туров
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import delete
from app.core.config import settings
from app.models.tour import Tour
from app.models.review import Review
from app.models.destination import Destination
from app.models.landmark import Landmark
from app.models.article import Article

# Async engine
DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def clear_all_data():
    """Удаляет ВСЕ туры, отзывы, направления и статьи"""
    async with async_session() as session:
        print("🗑️  Начинаем полную очистку старых данных...")
        
        # Удаляем отзывы
        result = await session.execute(delete(Review))
        print(f"✅ Удалено {result.rowcount} отзывов")
        
        # Удаляем туры
        result = await session.execute(delete(Tour))
        print(f"✅ Удалено {result.rowcount} туров")
        
        # Удаляем достопримечательности
        result = await session.execute(delete(Landmark))
        print(f"✅ Удалено {result.rowcount} достопримечательностей")
        
        # Удаляем направления
        result = await session.execute(delete(Destination))
        print(f"✅ Удалено {result.rowcount} направлений")
        
        # Удаляем статьи
        result = await session.execute(delete(Article))
        print(f"✅ Удалено {result.rowcount} статей")
        
        await session.commit()
        print("🎯 База данных полностью очищена!")


async def main():
    """Главная функция"""
    print("=" * 60)
    print("ПОЛНАЯ ОЧИСТКА И ПЕРЕСОЗДАНИЕ БАЗЫ ДАННЫХ")
    print("=" * 60)
    
    # Шаг 1: Очистка
    await clear_all_data()
    
    # Шаг 2: Загрузка новых данных
    print("\n" + "=" * 60)
    print("ЗАГРУЗКА 140 АЗИАТСКИХ ТУРОВ")
    print("=" * 60)
    from seed_data import seed_data
    await seed_data()
    
    print("\n" + "=" * 60)
    print("✅ ГОТОВО! База данных обновлена азиатскими турами")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())

