import asyncio
import os
import sys
import json

# Настройка путей для корректного импорта app
sys.path.append(os.path.join(os.path.dirname(__file__), '../..'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from openai import AsyncOpenAI
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.models.tour import Tour
from app.core.config import settings

# ВАШ КЛЮЧ
OPENAI_API_KEY = "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"

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

async def generate_embeddings():
    # Настраиваем подключение к БД
    db_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(db_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        print("[INFO] Fetching tours...")
        
        # Получаем все туры
        stmt = select(Tour).where(Tour.active == True)
        result = await session.execute(stmt)
        tours = result.scalars().all()
        
        print(f"[INFO] Found {len(tours)} active tours.")
        
        count = 0
        updated = 0
        
        for tour in tours:
            count += 1
            try:
                # Формируем текст для эмбеддинга
                description_short = tour.description[:1000] if tour.description else ""
                text_to_embed = f"Title: {tour.title}. Location: {tour.location}. Category: {tour.category}. Description: {description_short}"
                
                # Генерируем вектор
                # print(f"   Generating embedding for tour {tour.id}: {tour.title[:30]}...")
                response = await client.embeddings.create(
                    input=text_to_embed,
                    model="text-embedding-3-small"
                )
                embedding_list = response.data[0].embedding
                
                # ПРЕОБРАЗОВАНИЕ В СТРОКУ ДЛЯ pgvector/asyncpg
                # asyncpg требует строковый формат '[0.1,0.2,...]' для типа vector
                embedding_str = str(embedding_list)
                
                # Обновляем тур
                await session.execute(
                    text("UPDATE tours SET embedding = :embedding WHERE id = :id"),
                    {"embedding": embedding_str, "id": tour.id}
                )
                updated += 1
                
                # Коммитим каждые 10 записей
                if updated % 10 == 0:
                    print(f"   [PROGRESS] Updated {updated}/{len(tours)} tours...")
                    await session.commit()
                    
            except Exception as e:
                print(f"[ERROR] Failed tour {tour.id}: {e}")

        await session.commit()
        print(f"[SUCCESS] Finished! Updated {updated} tours.")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        
    asyncio.run(generate_embeddings())
