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
# Импортируем ВСЕ модели, чтобы create_all создал все таблицы
from app.models import User, Tour, Booking, Request, Destination, Landmark, Review, Article, GuideSchedule, Message
from app.models.user import UserRole

# Async engine
DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    """Инициализация базы данных"""
    
    # Создаем таблицы
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Создаем админа
    async with async_session() as session:
        # Очищаем телефон от всех символов кроме цифр
        phone_clean = ''.join(filter(str.isdigit, settings.SUPER_ADMIN_PHONE))
        print(f"📞 Админ телефон: {settings.SUPER_ADMIN_PHONE} -> очищено: {phone_clean}")
        
        # Проверяем существует ли админ
        result = await session.execute(
            sa.select(User).where(User.phone == phone_clean)
        )
        existing_admin = result.scalar_one_or_none()
        
        if not existing_admin:
            admin = User(
                phone=phone_clean,
                email="admin@thaiguide.pro",
                name="Администратор",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                parent_id=None,
            )
            session.add(admin)
            await session.commit()
            print(f"✅ Админ создан: {phone_clean}")
        else:
            print(f"✅ Админ уже существует: {phone_clean}")


if __name__ == "__main__":
    import sqlalchemy as sa
    print("🔧 Инициализация базы данных...")
    asyncio.run(init_db())
    print("✅ База данных готова!")
