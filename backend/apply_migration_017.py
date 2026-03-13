"""
Миграция 017: Добавление функции поиска match_tours
"""
import asyncio
import os
import sys

# Добавляем путь к приложению
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.db.session import async_session

async def apply_migration():
    """Создает RPC функцию для поиска туров по вектору"""
    async with async_session() as session:
        try:
            print("[INFO] Migration 017: Creating search function...")

            # Create function match_tours
            # Note: We return specific columns relevant for the AI
            sql = """
            create or replace function match_tours (
              query_embedding vector(1536),
              match_threshold float,
              match_count int
            )
            returns table (
              id integer,
              title varchar,
              description text,
              price float,
              location varchar,
              similarity float
            )
            language plpgsql
            as $$
            begin
              return query
              select
                tours.id,
                tours.title,
                tours.description,
                tours.price,
                tours.location,
                1 - (tours.embedding <=> query_embedding) as similarity
              from tours
              where 1 - (tours.embedding <=> query_embedding) > match_threshold
              order by similarity desc
              limit match_count;
            end;
            $$;
            """
            
            print("   -> Creating function match_tours...")
            await session.execute(text(sql))
            await session.commit()

            print("[SUCCESS] Migration 017: Function match_tours created.")
            
        except Exception as e:
            print(f"[ERROR] Migration 017: Critical error - {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(apply_migration())










