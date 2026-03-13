"""
Миграция 022: Добавляем image (первое фото) в metadata
"""
import asyncio
import os
import sys

# Добавляем путь к приложению
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.db.session import async_session

async def apply_migration():
    """Обновляет match_tours добавляя image в metadata"""
    async with async_session() as session:
        try:
            print("[INFO] Migration 022: Adding image to metadata...")

            # 1. Drop old function
            await session.execute(text("DROP FUNCTION IF EXISTS match_tours(vector, float, int, jsonb)"))

            # 2. Create new function
            # We extract the first photo from the JSON array using ->>0
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
                
                -- Метаданные
                jsonb_build_object(
                    'id', tours.id,
                    'tourId', tours.id,
                    'title', tours.title,
                    'price', tours.price,
                    'location', tours.location,
                    'category', tours.category,
                    'image', tours.photos->0, -- Берем первое фото как обложку
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
            
            print("   -> Creating updated match_tours with image...")
            await session.execute(text(sql))
            await session.commit()
            
            print("   -> Reloading schema cache...")
            await session.execute(text("NOTIFY pgrst, 'reload schema'"))
            await session.commit()

            print("[SUCCESS] Migration 022: Done.")
            
        except Exception as e:
            print(f"[ERROR] Migration 022: Critical error - {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(apply_migration())










