"""
Скрипт для инициализации базы данных с тестовыми данными
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.db.base import Base
from app.models.user import User
from app.core.security import get_password_hash
from app.core.config import settings

async def init_db():
    print("🗄️ Создание таблиц...")
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Таблицы созданы!")
    
    print("👥 Создание тестовых пользователей...")
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import sessionmaker
    
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Админ
        admin = User(
            email="79177445182@fastchange.local",
            phone="+79177445182",
            full_name="Админ",
            hashed_password=get_password_hash("password123"),
            role=0,  # admin
            active=True
        )
        session.add(admin)
        
        # Менеджер
        manager = User(
            email="79111111111@fastchange.local",
            phone="+79111111111",
            full_name="Менеджер 1",
            hashed_password=get_password_hash("password123"),
            role=1,  # manager
            active=True
        )
        session.add(manager)
        
        # Клиент
        client = User(
            email="79999991000@fastchange.local",
            phone="+79999991000",
            full_name="Клиент 1",
            hashed_password=get_password_hash("password123"),
            role=2,  # client
            active=True
        )
        session.add(client)
        
        await session.commit()
    
    print("✅ Тестовые пользователи созданы!")
    print("\n📝 Данные для входа:")
    print("  Админ: +79177445182 / password123")
    print("  Менеджер: +79111111111 / password123")
    print("  Клиент: +79999991000 / password123")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_db())
