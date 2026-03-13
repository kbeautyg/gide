import asyncio
from sqlalchemy import text
from app.core.config import settings
from sqlalchemy.ext.asyncio import create_async_engine

async def add_source_column():
    database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(database_url, echo=True)

    async with engine.begin() as conn:
        try:
            print("Checking if 'source' column exists in 'tours' table...")
            # Check if column exists
            result = await conn.execute(text(
                "SELECT column_name FROM information_schema.columns WHERE table_name='tours' AND column_name='source'"
            ))
            if result.scalar():
                print("'source' column already exists.")
            else:
                print("Adding 'source' column...")
                await conn.execute(text("ALTER TABLE tours ADD COLUMN source VARCHAR DEFAULT 'manual'"))
                await conn.execute(text("UPDATE tours SET source = 'manual'"))
                print("'source' column added and populated with default value.")
                
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(add_source_column())

