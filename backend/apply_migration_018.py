"""
Миграция 018: Обновление match_tours для совместимости с Supabase Vector Store (LangChain)
"""
import asyncio
import os
import sys

# Добавляем путь к приложению
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.db.session import async_session

async def apply_migration():
    """Обновляет RPC функцию match_tours добавляя параметр filter"""
    async with async_session() as session:
        try:
            print("[INFO] Migration 018: Updating match_tours signature...")

            # 1. Drop old function
            print("   -> Dropping old function...")
            await session.execute(text("DROP FUNCTION IF EXISTS match_tours(vector, float, int)"))

            # 2. Create new function compatible with LangChain/Supabase Vector Store
            # Standard signature often expects: query_embedding, match_threshold, match_count, filter (optional)
            
            sql = """
            create or replace function match_tours (
              query_embedding vector(1536),
              match_threshold float,
              match_count int,
              filter jsonb DEFAULT '{}'
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
              -- Простейшая поддержка фильтрации (пока пустая или базовая)
              -- Можно расширить для фильтрации по metadata если она есть
              -- В нашем случае пока игнорируем сложный фильтр или добавляем базовый
              order by similarity desc
              limit match_count;
            end;
            $$;
            """
            
            print("   -> Creating new function match_tours with filter support...")
            await session.execute(text(sql))
            await session.commit()

            print("[SUCCESS] Migration 018: Function match_tours updated.")
            
        except Exception as e:
            print(f"[ERROR] Migration 018: Critical error - {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(apply_migration())










