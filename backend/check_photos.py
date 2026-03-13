import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select
from app.db.session import async_session
from app.models.tour import Tour

async def check():
    async with async_session() as session:
        result = await session.execute(select(Tour).limit(1))
        tour = result.scalar_one_or_none()
        if tour:
            print(f"ID: {tour.id}")
            print(f"Photos: {tour.photos}")
        else:
            print("No tours found")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(check())










