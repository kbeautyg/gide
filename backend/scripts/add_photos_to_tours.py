"""
Скрипт добавления 5-8 качественных фото к каждому туру
"""
import asyncio
import sys
import os
import random
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.tour import Tour

DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


# Категории фотографий для разных типов туров
PHOTO_COLLECTIONS = {
    "Культура и история": [
        "photo-1563784462041-5f97ac9523dd",  # Храм Бангкок
        "photo-1508009603885-50cf7c579365",  # Храм
        "photo-1599038966398-3fe4dd76fdc8",  # Ват Арун
        "photo-1528164344705-47542687000d",  # Японский храм
        "photo-1493976040374-85c8e12f0c0e",  # Киото
        "photo-1552465011-b4e21bf6e79a",  # Культура
        "photo-1560969184-10fe8719e047",  # Архитектура
        "photo-1589452271712-64b8a66c7b71",  # Осака замок
    ],
    "Гастрономия": [
        "photo-1578474846511-04ba529f0b88",  # Уличная еда
        "photo-1559847844-5315695dadae",  # Еда тайская
        "photo-1569562211093-4ed0d0758f12",  # Корейская еда
        "photo-1584030373081-f809da56c00e",  # Еда на рынке
        "photo-1555939594-58d7cb561ad1",  # Кулинария
        "photo-1540189549336-e6e99c3679fe",  # Десерты
        "photo-1551024709-8f23befc6f87",  # Фрукты
        "photo-1579584425555-c3ce17fd4351",  # Суши
    ],
    "Природа": [
        "photo-1559827260-dc66d52bef19",  # Море острова
        "photo-1552465011-b4e21bf6e79a",  # Пляж Пхи-Пхи
        "photo-1589394815804-964ed0be2eb5",  # Пхукет пляж
        "photo-1473496169904-658ba7c44d8a",  # Водопад
        "photo-1464822759023-fed622ff2c3b",  # Джунгли
        "photo-1537996194471-e657df975ab4",  # Бали террасы
        "photo-1490806843957-31f4c9a91c65",  # Фудзи
        "photo-1545569341-9eb8b30979d9",  # Бамбук
    ],
    "Развлечения": [
        "photo-1526882924447-7e9da5da8d84",  # Rooftop bar
        "photo-1566073771259-6a8506099945",  # Ночной город
        "photo-1519671482749-fd09be7ccebf",  # Клубы
        "photo-1566417713940-fe7c737a9ef2",  # Вечеринка
        "photo-1514525253161-7a46d19cd819",  # Концерт
        "photo-1470229722913-7c0e2dbbafd3",  # Музыка
    ],
    "Wellness и SPA": [
        "photo-1544161515-4ab6ce6db874",  # Массаж
        "photo-1540555700478-4be289fbecef",  # SPA
        "photo-1552046122-03184de85e08",  # Релакс
        "photo-1519415510236-718bdfcd89c8",  # Wellness
        "photo-1506126613408-eca07ce68773",  # Йога
    ],
    "VIP-туры": [
        "photo-1559827260-dc66d52bef19",  # Яхта
        "photo-1512453979798-5ea266f8880c",  # Роскошь Дубай
        "photo-1526882924447-7e9da5da8d84",  # Роскошный вид
    ],
    "default": [
        "photo-1540959733332-eab4deabeeaf",  # Токио
        "photo-1549144511-f099e773c147",  # Современный город
        "photo-1466692476868-aef1dfb1e735",  # Природа
        "photo-1488646953014-85cb44e24d5e",  # Путешествия
    ]
}


def get_photos_for_category(category: str, count: int = 7) -> list:
    """Генерирует массив URL фото для категории"""
    # Находим подходящую коллекцию
    collection = PHOTO_COLLECTIONS.get(category, PHOTO_COLLECTIONS["default"])
    
    # Добавляем фото из других категорий для разнообразия
    all_photos = list(collection)
    for cat_photos in PHOTO_COLLECTIONS.values():
        all_photos.extend(cat_photos)
    
    # Убираем дубликаты
    all_photos = list(set(all_photos))
    
    # Выбираем случайные
    selected = random.sample(all_photos, min(count, len(all_photos)))
    
    # Формируем URL с параметрами
    return [f"https://images.unsplash.com/{photo}?w=1200&h=800&fit=crop" for photo in selected]


async def update_tour_photos():
    """Добавить 5-8 фото к каждому туру"""
    async with async_session() as session:
        result = await session.execute(select(Tour))
        tours = result.scalars().all()
        
        print(f"📦 Найдено {len(tours)} туров")
        print("🖼️  Начинаю обновление фотографий...\n")
        
        updated = 0
        for i, tour in enumerate(tours, 1):
            # Определяем сколько фото нужно
            num_photos = random.randint(5, 8)
            
            # Генерируем фото для категории
            photos = get_photos_for_category(tour.category, num_photos)
            
            # Обновляем тур
            tour.photos = photos
            
            updated += 1
            
            if i % 50 == 0 or i == len(tours):
                print(f"✅ Обновлено {i}/{len(tours)} туров...")
        
        await session.commit()
        print(f"\n🎉 Добавлено {updated} фотографий к турам!")
        print(f"   Каждый тур теперь имеет 5-8 качественных фото")


if __name__ == "__main__":
    print("=" * 70)
    print("  ДОБАВЛЕНИЕ ФОТОГРАФИЙ К ТУРАМ")
    print("=" * 70)
    print()
    asyncio.run(update_tour_photos())

