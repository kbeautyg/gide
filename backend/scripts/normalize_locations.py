import asyncio
from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.tour import Tour

async def normalize_locations():
    database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        print("Starting location normalization...")
        
        # 1. Normalize "Корея" -> "Южная Корея"
        stmt = select(Tour).where(
            Tour.location.ilike('%Корея%'),
            Tour.location.not_ilike('%Южная Корея%'),
            Tour.source == 'tripster'
        )
        result = await session.execute(stmt)
        tours = result.scalars().all()
        
        count = 0
        for tour in tours:
            old_loc = tour.location
            new_loc = old_loc.replace("Корея", "Южная Корея")
            tour.location = new_loc
            count += 1
            
        print(f"Fixed {count} 'Korea' -> 'South Korea' locations")
        
        # 2. Fix "Турция" if needed (seems OK but check for duplicates)
        
        await session.commit()
        print("Done.")

if __name__ == "__main__":
    asyncio.run(normalize_locations())

