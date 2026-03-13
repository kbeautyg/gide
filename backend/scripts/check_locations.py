import asyncio
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.tour import Tour

async def check_locations():
    database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # 1. Get all active tours locations
        result = await session.execute(
            select(Tour.location, func.count(Tour.id))
            .where(Tour.active == True)
            .group_by(Tour.location)
        )
        locations = result.all()
        
        print(f"=== Active Tours Locations ({len(locations)}) ===")
        country_counts = {}
        total_tours = 0
        
        for loc, count in locations:
            total_tours += count
            # Parse Country
            parts = loc.split(', ')
            if len(parts) >= 2:
                country = parts[-1].strip()
                country_counts[country] = country_counts.get(country, 0) + count
            else:
                print(f"Weird location format: '{loc}' (Count: {count})")
                country_counts[loc] = country_counts.get(loc, 0) + count

        print("\n=== Country Counts ===")
        for country, count in sorted(country_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"{country}: {count}")
            
        print(f"\nTotal active tours in DB: {total_tours}")
        
        # 2. Check duplications or hidden tours
        hidden_result = await session.execute(
            select(func.count(Tour.id)).where(Tour.active == False)
        )
        hidden_count = hidden_result.scalar()
        print(f"Hidden (inactive) tours: {hidden_count}")

        # 3. Check for 'Korea' vs 'South Korea' mismatch in DB
        korea_result = await session.execute(
            select(Tour.title, Tour.location).where(
                Tour.location.ilike('%korea%') | Tour.location.ilike('%корея%')
            )
        )
        koreas = korea_result.all()
        print(f"\n=== Korea Tours ({len(koreas)}) ===")
        for t in koreas[:5]:
            print(f"{t.title[:30]}... -> {t.location}")

if __name__ == "__main__":
    asyncio.run(check_locations())
