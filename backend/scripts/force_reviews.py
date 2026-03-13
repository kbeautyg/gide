import asyncio
import random
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.tour import Tour
from app.models.review import Review

async def force_generate_reviews(tour_id):
    database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # 1. Get Tour
        result = await session.execute(select(Tour).where(Tour.id == tour_id))
        tour = result.scalar_one_or_none()
        
        if not tour:
            print(f"❌ Tour {tour_id} not found")
            return

        print(f"Found tour: {tour.title} (Review Count: {tour.reviews_count})")

        # 2. Check existing reviews
        res = await session.execute(select(Review).where(Review.tour_id == tour_id))
        reviews = res.scalars().all()
        print(f"Existing reviews in DB: {len(reviews)}")

        if len(reviews) > 0:
            print("Reviews already exist. Skipping.")
            return

        # 3. Generate
        print("Generating reviews...")
        review_texts = [
            "Отличная экскурсия! Очень понравилось.",
            "Всё прошло замечательно, гид интересный.",
            "Рекомендую всем! Много впечатлений.",
            "Организация на высшем уровне.",
            "Красивые места, узнали много нового.",
            "Спасибо за прекрасный день!",
            "Хороший маршрут, не утомительно.",
            "Гид знающий и вежливый.",
            "Было очень интересно и познавательно.",
            "Обязательно вернемся еще!"
        ]
        names = ["Алексей", "Мария", "Дмитрий", "Елена", "Ольга", "Андрей", "Татьяна", "Сергей", "Анна", "Иван"]
        
        count_to_generate = min(5, max(1, tour.reviews_count)) # Ensure at least 1 if count is > 0
        
        if tour.reviews_count == 0:
             print("Tour has 0 reviews count. Force adding 3 fake reviews for testing.")
             count_to_generate = 3
             tour.reviews_count = 3
             session.add(tour)

        for i in range(count_to_generate):
            review = Review(
                tour_id=tour.id,
                user_name=random.choice(names),
                user_photo=None,
                experience_count=random.randint(1, 10),
                rating=5.0, 
                text=random.choice(review_texts) + " (Отзыв с Tripster)"
            )
            session.add(review)
        
        await session.commit()
        print(f"✅ Generated {count_to_generate} reviews for Tour {tour_id}")

if __name__ == "__main__":
    # Tour ID 803 is "Сказочная Каппадокия"
    asyncio.run(force_generate_reviews(803))




