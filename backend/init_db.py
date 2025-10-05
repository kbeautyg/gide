"""
Инициализация базы данных - создание супер-админа
"""
import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.security import get_password_hash
from app.db.base import Base
from app.models.user import User, UserRole

# Async engine
DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    """Инициализация базы данных"""
    
    # Создаем таблицы
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Создаем супер-админа
    async with async_session() as session:
        # Проверяем существует ли супер-админ
        result = await session.execute(
            sa.select(User).where(User.phone == settings.SUPER_ADMIN_PHONE)
        )
        existing_admin = result.scalar_one_or_none()
        
        if not existing_admin:
            super_admin = User(
                phone=settings.SUPER_ADMIN_PHONE,
                email="admin@thaiguide.pro",
                name="Супер Админ",
                hashed_password=get_password_hash("admin123"),  # Измените на безопасный!
                role=UserRole.SUPER_ADMIN,
                parent_id=None,
            )
            session.add(super_admin)
            await session.commit()
            print(f"✅ Супер-админ создан: {settings.SUPER_ADMIN_PHONE}")
        else:
            print(f"✅ Супер-админ уже существует: {settings.SUPER_ADMIN_PHONE}")


if __name__ == "__main__":
    import sqlalchemy as sa
    print("🔧 Инициализация базы данных...")
    asyncio.run(init_db())
    print("✅ База данных готова!")
