"""
УДАЛЕНИЕ ВСЕХ ТУРОВ, ОТЗЫВОВ И ДОСТОПРИМЕЧАТЕЛЬНОСТЕЙ
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
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def delete_all():
    """УДАЛЯЕТ ВСЁ"""
    async with async_session() as session:
        print("=" * 60)
        print("🗑️  УДАЛЕНИЕ ВСЕХ ТУРОВ И СВЯЗАННЫХ ДАННЫХ")
        print("=" * 60)
        
        # 1. Удаляем отзывы
        result = await session.execute(delete(Review))
        await session.commit()
        print(f"✅ Удалено {result.rowcount} отзывов")
        
        # 2. Удаляем туры
        result = await session.execute(delete(Tour))
        await session.commit()
        print(f"✅ Удалено {result.rowcount} туров")
        
        # 3. Удаляем достопримечательности
        result = await session.execute(delete(Landmark))
        await session.commit()
        print(f"✅ Удалено {result.rowcount} достопримечательностей")
        
        # 4. Удаляем направления
        result = await session.execute(delete(Destination))
        await session.commit()
        print(f"✅ Удалено {result.rowcount} направлений")
        
        # 5. Удаляем статьи
        result = await session.execute(delete(Article))
        await session.commit()
        print(f"✅ Удалено {result.rowcount} статей")
        
        print("=" * 60)
        print("🎯 ВСЁ УДАЛЕНО! База данных очищена!")
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(delete_all())

