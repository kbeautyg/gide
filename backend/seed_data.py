"""
Создание тестовых данных для демонстрации
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.security import get_password_hash
from app.db.base import Base
from app.models.user import User, UserRole
from app.models.tour import Tour

# Async engine
DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def seed_data():
    """Создание тестовых данных"""
    
    async with async_session() as session:
        import sqlalchemy as sa
        
        # Очищаем телефон супер-админа
        phone_clean = ''.join(filter(str.isdigit, settings.SUPER_ADMIN_PHONE))
        
        # Получаем супер-админа
        result = await session.execute(
            sa.select(User).where(User.phone == phone_clean)
        )
        super_admin = result.scalar_one_or_none()
        
        if not super_admin:
            print("Super admin not found")
            return
        
        print(f"Super admin found: {super_admin.phone} (ID: {super_admin.id})")
        
        # Удаляем все тестовые экскурсии
        result = await session.execute(sa.select(Tour).where(Tour.guide_id == super_admin.id))
        existing_tours = result.scalars().all()
        
        if existing_tours:
            for tour in existing_tours:
                await session.delete(tour)
            await session.commit()
            print(f"Deleted {len(existing_tours)} test tours")
        else:
            print("No test tours found")


if __name__ == "__main__":
    print("Creating test data...")
    asyncio.run(seed_data())
    print("Test data ready!")
