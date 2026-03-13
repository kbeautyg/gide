"""Проверка конкретного тура"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.tour import Tour
from app.models.review import Review
from app.core.config import settings

async def check():
    database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Ищем тур
        result = await session.execute(
            select(Tour).where(Tour.title.like('%Круиз по реке Чао-Прайя%'))
        )
        tour = result.scalar_one_or_none()
        
        if tour:
            print(f"✅ Тур найден!")
            print(f"ID: {tour.id}")
            print(f"Title: {tour.title}")
            print(f"reviews_count в БД: {tour.reviews_count}")
            
            # Считаем реальные отзывы
            reviews_result = await session.execute(
                select(Review).where(Review.tour_id == tour.id)
            )
            real_reviews = reviews_result.scalars().all()
            
            print(f"Реальных отзывов в таблице reviews: {len(real_reviews)}")
            if real_reviews:
                for r in real_reviews:
                    print(f"  - Отзыв от {r.user_name}: {r.rating} звезд")
            else:
                print("  ⚠️ В таблице reviews отзывов НЕТ!")
        else:
            print("❌ Тур не найден!")
            print("\nПроверяем все туры с 'Круиз' в названии:")
            result = await session.execute(
                select(Tour.id, Tour.title, Tour.reviews_count).where(Tour.title.like('%Круиз%'))
            )
            tours = result.all()
            for t in tours:
                print(f"  ID {t[0]}: {t[1]} (reviews_count={t[2]})")

if __name__ == "__main__":
    asyncio.run(check())



