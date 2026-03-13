"""
Скрипт для обнуления reviews_count в базе данных.
После запуска API будет всегда считать реальное количество отзывов из таблицы reviews.
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, update
from app.models.tour import Tour
from app.models.review import Review
from app.core.config import settings

# Создаём движок
# Преобразуем postgres:// в postgresql+asyncpg://
database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(database_url, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def fix_reviews_count():
    """
    Пересчитывает reviews_count для всех туров на основе реальных данных из таблицы reviews
    """
    async with async_session() as session:
        print("🔍 Получаю все туры...")
        
        # Получаем все туры
        result = await session.execute(select(Tour))
        tours = result.scalars().all()
        
        print(f"📦 Найдено {len(tours)} туров")
        print("🔄 Пересчитываю reviews_count...\n")
        
        fixed_count = 0
        for tour in tours:
            # Считаем реальное количество отзывов
            reviews_result = await session.execute(
                select(Review).where(Review.tour_id == tour.id)
            )
            real_reviews = reviews_result.scalars().all()
            real_count = len(real_reviews)
            
            if tour.reviews_count != real_count:
                print(f"🔧 Тур ID {tour.id}: было {tour.reviews_count} → стало {real_count}")
                tour.reviews_count = real_count
                fixed_count += 1
        
        await session.commit()
        
        print(f"\n✅ Исправлено {fixed_count} туров")
        print(f"✅ Все туры теперь имеют корректный reviews_count")
        

if __name__ == "__main__":
    asyncio.run(fix_reviews_count())

