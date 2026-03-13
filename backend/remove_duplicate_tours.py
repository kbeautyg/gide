"""
Скрипт для удаления дубликатов туров из базы данных.
Дубликаты определяются по одинаковому названию (title).
Оставляем первый (самый старый) тур, удаляем остальные.
"""
import asyncio
import os
import sys

# Устанавливаем UTF-8 для Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Добавляем путь к backend
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select, func, delete, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.tour import Tour
from app.core.config import settings


async def remove_duplicate_tours():
    """Удаляет дубликаты туров, оставляя самый старый"""
    
    # Создаём подключение к БД
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    engine = create_async_engine(db_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Находим все названия туров, которые встречаются более одного раза
        duplicate_query = (
            select(Tour.title, func.count(Tour.id).label('cnt'))
            .group_by(Tour.title)
            .having(func.count(Tour.id) > 1)
        )
        
        result = await session.execute(duplicate_query)
        duplicates = result.all()
        
        if not duplicates:
            print("[OK] No duplicates found!")
            return
        
        print(f"[FOUND] Found {len(duplicates)} tour titles with duplicates:\n")
        
        total_deleted = 0
        total_reviews_deleted = 0
        
        for title, count in duplicates:
            title_short = title[:50] if len(title) > 50 else title
            print(f"  - \"{title_short}\" - {count} copies")
            
            # Получаем все туры с этим названием, сортируем по дате создания
            tours_query = (
                select(Tour.id, Tour.created_at)
                .where(Tour.title == title)
                .order_by(Tour.created_at.asc())  # Самый старый первый
            )
            
            result = await session.execute(tours_query)
            tours = result.all()
            
            # Оставляем первый (самый старый), удаляем остальные
            tour_ids_to_delete = [t.id for t in tours[1:]]  # Все кроме первого
            
            if tour_ids_to_delete:
                # Сначала удаляем связанные отзывы
                delete_reviews = text(
                    "DELETE FROM reviews WHERE tour_id = ANY(:tour_ids)"
                )
                result = await session.execute(
                    delete_reviews, 
                    {"tour_ids": tour_ids_to_delete}
                )
                reviews_deleted = result.rowcount
                total_reviews_deleted += reviews_deleted
                
                # Удаляем связанные бронирования
                delete_bookings = text(
                    "DELETE FROM bookings WHERE tour_id = ANY(:tour_ids)"
                )
                await session.execute(
                    delete_bookings, 
                    {"tour_ids": tour_ids_to_delete}
                )
                
                # Теперь удаляем туры
                delete_tours = text(
                    "DELETE FROM tours WHERE id = ANY(:tour_ids)"
                )
                result = await session.execute(
                    delete_tours, 
                    {"tour_ids": tour_ids_to_delete}
                )
                tours_deleted = result.rowcount
                total_deleted += tours_deleted
                
                for tour in tours[1:]:
                    print(f"     [DEL] ID {tour.id} (created {tour.created_at})")
        
        # Сохраняем изменения
        await session.commit()
        
        print(f"\n[OK] Done!")
        print(f"     Deleted {total_deleted} duplicate tours")
        print(f"     Deleted {total_reviews_deleted} related reviews")


if __name__ == "__main__":
    print("=" * 60)
    print("REMOVE DUPLICATE TOURS")
    print("=" * 60)
    print()
    
    asyncio.run(remove_duplicate_tours())
