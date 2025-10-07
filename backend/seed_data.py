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
            print("❌ Супер-админ не найден")
            return
        
        print(f"✅ Супер-админ найден: {super_admin.phone} (ID: {super_admin.id})")
        print("ℹ️ Автоматическое создание тестовых экскурсий отключено")
        print("✅ Пользователи создают экскурсии сами через ЛК")


if __name__ == "__main__":
    print("🌱 Создание тестовых данных...")
    asyncio.run(seed_data())
    print("✅ Тестовые данные готовы!")
