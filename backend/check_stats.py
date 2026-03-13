"""Проверка статистики базы данных"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, func
from app.core.config import settings
from app.models.tour import Tour
from app.models.review import Review

DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def check_stats():
    async with async_session() as session:
        tours_count_result = await session.execute(select(func.count(Tour.id)))
        tours_count = tours_count_result.scalar()
        
        reviews_count_result = await session.execute(select(func.count(Review.id)))
        reviews_count = reviews_count_result.scalar()
        
        locations_result = await session.execute(
            select(Tour.location, func.count(Tour.id).label('count'))
            .where(Tour.active == True, Tour.is_public == True)
            .group_by(Tour.location)
            .order_by(func.count(Tour.id).desc())
        )
        
        print("\n" + "=" * 70)
        print("📊 СТАТИСТИКА БАЗЫ ДАННЫХ")
        print("=" * 70)
        print(f"\nВсего экскурсий: {tours_count}")
        print(f"Всего отзывов: {reviews_count}")
        print(f"\nТоп-20 направлений по количеству туров:\n")
        
        for i, (loc, count) in enumerate(locations_result.fetchall()[:20], 1):
            print(f"  {i:2d}. {loc:30s} — {count:3d} туров")
        
        print("\n" + "=" * 70)


if __name__ == "__main__":
    asyncio.run(check_stats())

