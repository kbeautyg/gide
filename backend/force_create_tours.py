"""
ПРИНУДИТЕЛЬНОЕ создание публичных туров
Используется для восстановления туров после случайного удаления
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.user import User

DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def force_create():
    """Принудительно создать туры"""
    print("🚀 ПРИНУДИТЕЛЬНОЕ СОЗДАНИЕ ПУБЛИЧНЫХ ТУРОВ...")
    print("=" * 60)
    
    async with async_session() as session:
        # Проверяем есть ли системный гид
        result = await session.execute(select(User).where(User.phone == "00000000000"))
        system_guide = result.scalar_one_or_none()
        
        if not system_guide:
            print("❌ Системный гид не найден! Создаю базовых пользователей...")
            from seed_data import seed_data
            await seed_data()
            
            result = await session.execute(select(User).where(User.phone == "00000000000"))
            system_guide = result.scalar_one_or_none()
    
    # Импортируем и запускаем создание туров
    from scripts.create_all_asia_tours import create_all_tours
    from scripts.expand_tours_to_500 import generate_tour_variations
    from scripts.add_photos_to_tours import update_tour_photos
    
    print("\n1️⃣ Создание базовых туров по Азии...")
    await create_all_tours()
    
    print("\n2️⃣ Расширение до 500 туров...")
    await generate_tour_variations()
    
    print("\n3️⃣ Добавление фотографий...")
    await update_tour_photos()
    
    print("\n" + "=" * 60)
    print("✅ ПУБЛИЧНЫЕ ТУРЫ ВОССТАНОВЛЕНЫ!")
    print("=" * 60)


if __name__ == "__main__":
    print("🔄 Запуск принудительного создания туров...")
    asyncio.run(force_create())
    print("✅ ГОТОВО!")

