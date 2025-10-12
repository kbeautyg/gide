"""
Пересчет рейтингов туров на основе реальных отзывов
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, func
from app.core.config import settings
from app.models.tour import Tour
from app.models.review import Review

DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def fix_ratings():
    """Пересчитывает рейтинги всех туров на основе реальных отзывов"""
    async with async_session() as session:
        print("=" * 80)
        print("  ПЕРЕСЧЕТ РЕЙТИНГОВ ТУРОВ")
        print("=" * 80)
        print()
        
        # Получаем все туры
        result = await session.execute(select(Tour))
        tours = result.scalars().all()
        
        print(f"📊 Найдено {len(tours)} туров для проверки\n")
        
        updated_count = 0
        no_reviews_count = 0
        
        for i, tour in enumerate(tours, 1):
            # Получаем все отзывы для этого тура
            reviews_result = await session.execute(
                select(Review).where(Review.tour_id == tour.id)
            )
            reviews = reviews_result.scalars().all()
            
            old_rating = tour.rating
            old_count = tour.reviews_count
            
            if reviews:
                # Пересчитываем средний рейтинг
                avg_rating = sum([r.rating for r in reviews]) / len(reviews)
                new_rating = round(avg_rating, 2)
                new_count = len(reviews)
                
                # Обновляем только если изменился
                if tour.rating != new_rating or tour.reviews_count != new_count:
                    tour.rating = new_rating
                    tour.reviews_count = new_count
                    updated_count += 1
                    print(f"[{i}] {tour.title[:50]}...")
                    print(f"    Рейтинг: {old_rating} → {new_rating}")
                    print(f"    Отзывов: {old_count} → {new_count}")
            else:
                # Нет отзывов - ставим начальный рейтинг
                if tour.rating != 0.0 or tour.reviews_count != 0:
                    tour.rating = 0.0
                    tour.reviews_count = 0
                    no_reviews_count += 1
                    print(f"[{i}] {tour.title[:50]}... (нет отзывов, сброшен рейтинг)")
        
        # Сохраняем изменения
        await session.commit()
        
        print()
        print("=" * 80)
        print(f"✅ ПЕРЕСЧЕТ ЗАВЕРШЕН!")
        print("=" * 80)
        print(f"  Обновлено туров: {updated_count}")
        print(f"  Туров без отзывов: {no_reviews_count}")
        print(f"  Всего проверено: {len(tours)}")
        print()


if __name__ == "__main__":
    asyncio.run(fix_ratings())

