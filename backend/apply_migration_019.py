"""
Миграция 019: Фикс match_tours - делаем аргументы опциональными и меняем порядок
"""
import asyncio
import os
import sys

# Добавляем путь к приложению
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.db.session import async_session

async def apply_migration():
    """Пересоздает match_tours для максимальной совместимости"""
    async with async_session() as session:
        try:
            print("[INFO] Migration 019: Fixing match_tours signature...")

            # 1. Drop old functions (both variants just in case)
            print("   -> Dropping old functions...")
            await session.execute(text("DROP FUNCTION IF EXISTS match_tours(vector, float, int)"))
            await session.execute(text("DROP FUNCTION IF EXISTS match_tours(vector, float, int, jsonb)"))

            # 2. Create flexible function
            # LangChain JS usually calls: rpc('func_name', { query_embedding, match_count, filter, match_threshold })
            # PostgREST matches by parameter names mostly.
            
            sql = """
            create or replace function match_tours (
              query_embedding vector(1536),
              match_threshold float default 0.0,
              match_count int default 10,
              filter jsonb default '{}'
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
            
            print("   -> Creating robust match_tours...")
            await session.execute(text(sql))
            await session.commit()
            
            # ВАЖНО: Иногда Supabase кэширует схему. 
            # Нужно перезагрузить схему API, но программно это делается через NOTIFY pgrst.
            # Попробуем отправить команду на перезагрузку схемы.
            print("   -> Reloading PostgREST schema cache...")
            await session.execute(text("NOTIFY pgrst, 'reload schema'"))
            await session.commit()

            print("[SUCCESS] Migration 019: Done.")
            
        except Exception as e:
            print(f"[ERROR] Migration 019: Critical error - {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(apply_migration())










