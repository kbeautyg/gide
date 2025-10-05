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
        
        # Получаем супер-админа
        result = await session.execute(
            sa.select(User).where(User.phone == settings.SUPER_ADMIN_PHONE)
        )
        super_admin = result.scalar_one_or_none()
        
        if not super_admin:
            print("❌ Супер-админ не найден")
            return
        
        print(f"✅ Супер-админ найден: {super_admin.phone} (ID: {super_admin.id})")
        
        # Создаем тестовые экскурсии для супер-админа
        tours_data = [
            {
                "title": "Обзорная экскурсия по Пхукету",
                "description": "Познакомьтесь с главными достопримечательностями острова! Посетите Большого Будду, храм Ват Чалонг, и насладитесь панорамными видами с мыса Промтеп.",
                "price": 2500.0,
                "duration": 6,
                "location": "Пхукет",
                "category": "Культура и история",
                "photos": [
                    "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800",
                    "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800"
                ],
            },
            {
                "title": "Острова Пхи-Пхи на скоростной лодке",
                "description": "Незабываемое путешествие на знаменитые острова Пхи-Пхи! Снорклинг в кристально чистых водах, пляж Майя Бэй, обед на острове.",
                "price": 3200.0,
                "duration": 8,
                "location": "Пхукет",
                "category": "Природа и пляжи",
                "photos": [
                    "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
                    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"
                ],
            },
            {
                "title": "Джунгли и водопады Краби",
                "description": "Приключение в джунглях провинции Краби! Треккинг к водопадам, купание в изумрудном озере, посещение горячих источников.",
                "price": 2800.0,
                "duration": 7,
                "location": "Краби",
                "category": "Приключения",
                "photos": [
                    "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800"
                ],
            },
            {
                "title": "Ночная жизнь Паттайи",
                "description": "Откройте для себя яркую ночную жизнь Паттайи! Посещение лучших баров, дискотек, шоу трансвеститов Tiffany's.",
                "price": 1800.0,
                "duration": 5,
                "location": "Паттайя",
                "category": "Развлечения",
                "photos": [
                    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800"
                ],
            },
            {
                "title": "Храмы Бангкока",
                "description": "Погрузитесь в культуру Таиланда! Посетите Храм Изумрудного Будды, Лежащего Будды, Золотую гору и плавучий рынок.",
                "price": 2200.0,
                "duration": 8,
                "location": "Бангкок",
                "category": "Культура и история",
                "photos": [
                    "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800"
                ],
            },
        ]
        
        # Проверяем есть ли уже экскурсии
        result = await session.execute(sa.select(Tour).where(Tour.guide_id == super_admin.id))
        existing_tours = result.scalars().all()
        
        if existing_tours:
            print(f"✅ У супер-админа уже есть {len(existing_tours)} экскурсий")
            return
        
        # Создаем экскурсии
        for tour_data in tours_data:
            tour = Tour(
                guide_id=super_admin.id,
                title=tour_data["title"],
                description=tour_data["description"],
                price=tour_data["price"],
                duration=tour_data["duration"],
                location=tour_data["location"],
                category=tour_data["category"],
                photos=tour_data["photos"],
                rating=4.5 + (len(tour_data["title"]) % 10) / 20,  # Случайный рейтинг 4.5-5.0
                reviews_count=(len(tour_data["title"]) % 50) + 50,  # Случайно 50-100
                active=True,
            )
            session.add(tour)
        
        await session.commit()
        print(f"✅ Создано {len(tours_data)} экскурсий для супер-админа")


if __name__ == "__main__":
    print("🌱 Создание тестовых данных...")
    asyncio.run(seed_data())
    print("✅ Тестовые данные готовы!")
