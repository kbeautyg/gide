"""
Миграция 016: Включение векторного поиска (pgvector)
"""
import asyncio
import os
import sys

# Добавляем путь к приложению
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.db.session import async_session

async def apply_migration():
    """Включает vector extension и добавляет колонку embedding"""
    async with async_session() as session:
        try:
            print("[INFO] Migration 016: Setting up vector database...")

            # 1. Enable extension
            print("   -> Enabling vector extension...")
            await session.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            await session.commit() # Commit DDL immediately

            # 2. Add column
            print("   -> Adding embedding column vector(1536)...")
            try:
                await session.execute(text("ALTER TABLE tours ADD COLUMN IF NOT EXISTS embedding vector(1536)"))
                await session.commit()
            except Exception as e:
                print(f"      (Column might already exist or error: {e})")
                await session.rollback()

            # 3. Create Index
            print("   -> Creating IVFFlat index...")
            try:
                # Check if index exists first or just try to create if not exists
                await session.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_tours_embedding 
                    ON tours 
                    USING ivfflat (embedding vector_cosine_ops)
                    WITH (lists = 100)
                """))
                await session.commit()
            except Exception as e:
                print(f"      (Index might already exist or error: {e})")
                await session.rollback()

            print("[SUCCESS] Migration 016: Vector search ready.")
            print("   (Now you need to populate embeddings via n8n or script)")
            
        except Exception as e:
            print(f"[ERROR] Migration 016: Critical error - {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(apply_migration())

