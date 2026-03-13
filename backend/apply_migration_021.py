"""
Миграция 021: Добавляем tourId в metadata для удобства AI
"""
import asyncio
import os
import sys

# Добавляем путь к приложению
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.db.session import async_session

async def apply_migration():
    """Обновляет match_tours добавляя tourId в metadata"""
    async with async_session() as session:
        try:
            print("[INFO] Migration 021: Adding tourId to metadata...")

            # 1. Drop old function
            await session.execute(text("DROP FUNCTION IF EXISTS match_tours(vector, float, int, jsonb)"))

            # 2. Create new function
            sql = """
            create or replace function match_tours (
              query_embedding vector(1536),
              match_threshold float default 0.0,
              match_count int default 10,
              filter jsonb default '{}'
            )
            returns table (
              id integer,
              content text,
              metadata jsonb,
              similarity float
            )
            language plpgsql
            as $$
            begin
              return query
              select
                tours.id,
                -- Контент для AI
                (tours.title || E'\nPrice: ' || tours.price || ' RUB\nLocation: ' || tours.location || E'\n' || left(tours.description, 500)) as content,
                
                -- Метаданные (добавляем tourId явно)
                jsonb_build_object(
                    'id', tours.id,
                    'tourId', tours.id,  -- DUPLICATE FOR SAFETY
                    'title', tours.title,
                    'price', tours.price,
                    'location', tours.location,
                    'category', tours.category,
                    'photos', tours.photos
                ) as metadata,
                
                1 - (tours.embedding <=> query_embedding) as similarity
              from tours
              where 1 - (tours.embedding <=> query_embedding) > match_threshold
              order by similarity desc
              limit match_count;
            end;
            $$;
            """
            
            print("   -> Creating updated match_tours...")
            await session.execute(text(sql))
            await session.commit()
            
            print("   -> Reloading schema cache...")
            await session.execute(text("NOTIFY pgrst, 'reload schema'"))
            await session.commit()

            print("[SUCCESS] Migration 021: Done.")
            
        except Exception as e:
            print(f"[ERROR] Migration 021: Critical error - {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(apply_migration())










