"""
Очистка данных ГИДА - удаление туров, заявок, расписания, бронирований
НЕ трогает: супер-админа, других пользователей
Используется при RESET_DB=true для очистки только данных гида
"""
import asyncio
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Async engine
DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def reset_guide_data():
    """Очистка данных гидов - туры, заявки, расписание, бронирования"""
    
    print("🧹 Очистка данных гидов...")
    
    async with AsyncSessionLocal() as session:
        async with session.begin():
            # 1. Удаляем все бронирования
            result = await session.execute(sa.text("DELETE FROM bookings"))
            print(f"   ✓ Удалено бронирований: {result.rowcount}")
            
            # 2. Удаляем все заявки
            result = await session.execute(sa.text("DELETE FROM requests"))
            print(f"   ✓ Удалено заявок: {result.rowcount}")
            
            # 3. Удаляем расписание гидов
            result = await session.execute(sa.text("DELETE FROM guide_schedules"))
            print(f"   ✓ Удалено записей расписания: {result.rowcount}")
            
            # 4. Удаляем отзывы
            result = await session.execute(sa.text("DELETE FROM reviews"))
            print(f"   ✓ Удалено отзывов: {result.rowcount}")
            
            # 5. Удаляем ТОЛЬКО туры созданные гидом из заявок (с request_id)
            # Публичные туры (request_id IS NULL) остаются для главной страницы!
            result = await session.execute(sa.text("DELETE FROM tours WHERE request_id IS NOT NULL"))
            print(f"   ✓ Удалено туров гида: {result.rowcount}")
            print(f"   ℹ️  Публичные туры для главной страницы сохранены")
            
            # 6. Сбрасываем счётчики у гидов (но не удаляем их)
            result = await session.execute(sa.text("""
                UPDATE users 
                SET total_earnings = 0, 
                    total_tours = 0, 
                    reviews_count = 0,
                    rating = 0.0
                WHERE role = 'guide'
            """))
            print(f"   ✓ Сброшены счётчики у {result.rowcount} гидов")
    
    print("✅ Данные гидов очищены! Супер-админ и пользователи сохранены.")


if __name__ == "__main__":
    print("🔄 Очистка данных гидов...")
    asyncio.run(reset_guide_data())
    print("✅ Готово!")

