"""
Migration 014: Create articles table
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.db.session import async_session


async def apply_migration():
    """Creates articles table if not exists"""
    async with async_session() as session:
        try:
            # Check if table exists
            result = await session.execute(text(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'articles')"
            ))
            exists = result.scalar()
            
            if exists:
                print("[OK] Migration 014: articles table already exists")
                return
            
            print("[RUN] Migration 014: Creating articles table...")
            
            await session.execute(text("""
                CREATE TABLE articles (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR NOT NULL,
                    slug VARCHAR UNIQUE NOT NULL,
                    preview_text TEXT,
                    content TEXT NOT NULL,
                    photo_url VARCHAR,
                    read_time INTEGER DEFAULT 5,
                    country_tag VARCHAR,
                    views_count INTEGER DEFAULT 0,
                    published_at TIMESTAMP DEFAULT NOW(),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """))
            
            # Создаём индексы
            await session.execute(text("CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug)"))
            await session.execute(text("CREATE INDEX IF NOT EXISTS idx_articles_country ON articles(country_tag)"))
            await session.execute(text("CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at)"))
            
            await session.commit()
            print("[OK] Migration 014: articles table created successfully")
            
        except Exception as e:
            print(f"[ERR] Migration 014: {e}")
            await session.rollback()


if __name__ == "__main__":
    asyncio.run(apply_migration())

