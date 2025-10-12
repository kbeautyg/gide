"""Проверка API отзывов"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.tour import Tour
from app.models.review import Review
from app.core.config import settings

async def test():
    database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Ищем тур с круизом (ID 7)
        result = await session.execute(
            select(Tour).where(Tour.id == 7)
        )
        tour = result.scalar_one_or_none()
        
        if not tour:
            print("❌ Тур не найден")
            return
            
        print(f"✅ Тур найден: {tour.title} (ID: {tour.id})")
        
        # Получаем отзывы
        reviews_result = await session.execute(
            select(Review).where(Review.tour_id == tour.id)
        )
        reviews = reviews_result.scalars().all()
        
        print(f"\n📊 Отзывов в БД: {len(reviews)}")
        
        if reviews:
            print("\n📝 Список отзывов:")
            for i, review in enumerate(reviews, 1):
                print(f"{i}. {review.user_name}: {review.rating} ⭐")
                print(f"   Текст: {review.text[:100]}...")
                print(f"   Дата: {review.created_at}")
        else:
            print("⚠️ Отзывов НЕТ!")

if __name__ == "__main__":
    asyncio.run(test())

