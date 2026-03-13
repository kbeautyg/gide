import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select
from app.db.session import async_session
from app.models.tour import Tour

async def check_prices():
    async with async_session() as session:
        # Берем 5 случайных туров
        result = await session.execute(select(Tour).limit(5))
        tours = result.scalars().all()
        
        print(f"{'ID':<6} {'Title':<50} {'Price':<10} {'Location'}")
        print("-" * 80)
        for tour in tours:
            print(f"{tour.id:<6} {tour.title[:48]:<50} {tour.price:<10} {tour.location}")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(check_prices())










