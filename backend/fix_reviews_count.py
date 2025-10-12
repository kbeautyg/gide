"""
Скрипт для обнуления поля reviews_count у всех туров
Теперь мы всегда считаем реальное количество отзывов из таблицы reviews
"""
import asyncio
from sqlalchemy import update
from app.db.session import AsyncSessionLocal
from app.models.tour import Tour


async def fix_reviews_count():
    """Обнуляем reviews_count у всех туров"""
    async with AsyncSessionLocal() as session:
        # Обнуляем reviews_count у всех туров
        await session.execute(
            update(Tour).values(reviews_count=0)
        )
        await session.commit()
        print("✅ Поле reviews_count обнулено у всех туров")
        print("Теперь API будет всегда возвращать реальное количество из таблицы reviews")


if __name__ == "__main__":
    asyncio.run(fix_reviews_count())

