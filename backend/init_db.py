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
        # Очищаем телефон от всех символов кроме цифр
        phone_clean = ''.join(filter(str.isdigit, settings.SUPER_ADMIN_PHONE))
        print(f"Super admin phone: {settings.SUPER_ADMIN_PHONE} -> cleaned: {phone_clean}")
        
        # Проверяем существует ли супер-админ
        result = await session.execute(
            sa.select(User).where(User.phone == phone_clean)
        )
        existing_admin = result.scalar_one_or_none()
        
        if not existing_admin:
            super_admin = User(
                phone=phone_clean,
                email="admin@thaiguide.pro",
                name="Super Admin",
                hashed_password=get_password_hash("admin123"),  # Измените на безопасный!
                role=UserRole.SUPER_ADMIN,
                parent_id=None,
            )
            session.add(super_admin)
            await session.commit()
            print(f"Super admin created: {phone_clean}")
        else:
            print(f"Super admin already exists: {phone_clean}")


if __name__ == "__main__":
    import sqlalchemy as sa
    print("Initializing database...")
    asyncio.run(init_db())
    print("Database ready!")
