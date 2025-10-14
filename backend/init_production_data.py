"""
Автоматическая инициализация данных для production
Запускается автоматически если база пустая
"""
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, func
from app.core.config import settings
from app.models.tour import Tour
from app.models.user import User, UserRole

DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_data():
    """Инициализация данных если база пустая"""
    async with async_session() as session:
        # Проверяем есть ли туры
        tours_count_result = await session.execute(select(func.count(Tour.id)))
        tours_count = tours_count_result.scalar()
        
        if tours_count > 0:
            print(f"✅ База уже содержит {tours_count} туров. Пропускаю инициализацию.")
            return
        
        print("🌱 База пустая. Инициализирую данные...\n")
        
        # Импортируем и запускаем скрипты
        from seed_data import seed_data
        from scripts.create_all_asia_tours import create_all_tours
        from scripts.expand_tours_to_500 import generate_tour_variations
        from scripts.add_photos_to_tours import update_tour_photos
        
        # 1. Создаем базовые данные (админ, гид)
        print("1️⃣ Создание базовых пользователей...")
        await seed_data()
        
        # 2. Создаем базовые туры
        print("\n2️⃣ Создание базовых туров...")
        await create_all_tours()
        
        # 3. Расширяем до 500
        print("\n3️⃣ Расширение до 500 туров...")
        await generate_tour_variations()
        
        # 4. Добавляем фото
        print("\n4️⃣ Добавление фотографий...")
        await update_tour_photos()
        
        print("\n✅ Инициализация завершена!")


if __name__ == "__main__":
    asyncio.run(init_data())

