"""Проверка публичных туров"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, func
from app.core.config import settings
from app.models.tour import Tour

DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def check():
    async with async_session() as session:
        total = await session.execute(select(func.count(Tour.id)))
        public = await session.execute(select(func.count(Tour.id)).where(Tour.is_public == True))
        active = await session.execute(select(func.count(Tour.id)).where(Tour.active == True))
        both = await session.execute(select(func.count(Tour.id)).where(Tour.active == True, Tour.is_public == True))
        
        print(f'\n📊 ПРОВЕРКА ТУРОВ:\n')
        print(f'Всего туров: {total.scalar()}')
        print(f'is_public=True: {public.scalar()}')
        print(f'active=True: {active.scalar()}')
        print(f'active=True AND is_public=True: {both.scalar()}\n')
        
        # Проверим первые 5 туров
        result = await session.execute(select(Tour).limit(5))
        tours = result.scalars().all()
        
        print('Первые 5 туров:')
        for tour in tours:
            print(f'  ID {tour.id}: {tour.title[:50]}...')
            print(f'    active={tour.active}, is_public={tour.is_public}')
            print(f'    photos: {len(tour.photos or [])} шт')
            print()


if __name__ == "__main__":
    asyncio.run(check())

