"""
Миграция 020: Адаптация match_tours под стандарт LangChain (content + metadata)
"""
import asyncio
import os
import sys

# Добавляем путь к приложению
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.db.session import async_session

async def apply_migration():
    """Обновляет match_tours возвращая content и metadata"""
    async with async_session() as session:
        try:
            print("[INFO] Migration 020: Adapting match_tours for n8n/LangChain...")

            # 1. Drop old function
            await session.execute(text("DROP FUNCTION IF EXISTS match_tours(vector, float, int, jsonb)"))

            # 2. Create new function
            # LangChain expects: id, content, metadata, embedding, similarity
            # We map:
            #   content = title + "\n" + description
            #   metadata = json_build_object('price', price, 'location', location, 'id', id, 'title', title)
            
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
                -- Формируем единый текстовый контент для ответа агента
                (tours.title || E'\nPrice: ' || tours.price || ' RUB\nLocation: ' || tours.location || E'\n' || left(tours.description, 500)) as content,
                
                -- Собираем все полезные поля в metadata
                jsonb_build_object(
                    'id', tours.id,
                    'title', tours.title,
                    'price', tours.price,
                    'location', tours.location,
                    'category', tours.category,
                    'share_code', tours.share_code,
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
            
            print("   -> Creating LangChain-compatible match_tours...")
            await session.execute(text(sql))
            await session.commit()
            
            print("   -> Reloading schema cache...")
            await session.execute(text("NOTIFY pgrst, 'reload schema'"))
            await session.commit()

            print("[SUCCESS] Migration 020: Done. n8n should now see 'content'.")
            
        except Exception as e:
            print(f"[ERROR] Migration 020: Critical error - {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(apply_migration())










