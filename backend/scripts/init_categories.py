"""
Скрипт инициализации базовых категорий и коллекций
"""
import asyncio
import sys
import os

# Добавляем путь к backend
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db.session import async_session
from app.models.category import Category, Collection
from sqlalchemy import select


async def init_categories():
    """Инициализация базовых категорий"""
    
    async with async_session() as db:
        # Проверяем, есть ли уже категории
        result = await db.execute(select(Category))
        existing = result.scalars().all()
        
        if existing:
            print(f"✅ Категории уже существуют ({len(existing)} шт.). Пропускаем инициализацию.")
            return
        
        print("🚀 Создаем базовые категории...")
        
        # Достопримечательности (landmarks)
        landmarks = [
            {"name": "Храмы и святыни", "slug": "temples-shrines", "icon": "🏛️", "is_featured": True, "display_order": 1},
            {"name": "Дворцы и крепости", "slug": "palaces-fortresses", "icon": "🏰", "is_featured": True, "display_order": 2},
            {"name": "Пляжи и острова", "slug": "beaches-islands", "icon": "🏖️", "is_featured": True, "display_order": 3},
            {"name": "Горы и водопады", "slug": "mountains-waterfalls", "icon": "⛰️", "is_featured": False, "display_order": 4},
            {"name": "Рынки и базары", "slug": "markets-bazaars", "icon": "🛒", "is_featured": False, "display_order": 5},
            {"name": "Музеи и галереи", "slug": "museums-galleries", "icon": "🎨", "is_featured": False, "display_order": 6},
        ]
        
        for data in landmarks:
            category = Category(
                name=data["name"],
                slug=data["slug"],
                type="landmark",
                icon=data["icon"],
                is_featured=data["is_featured"],
                display_order=data["display_order"],
                is_active=True,
                filters={},
                extra_data={}
            )
            db.add(category)
        
        # Темы (themes)
        themes = [
            {"name": "Культура и история", "slug": "culture-history", "icon": "📚", "is_featured": True, "display_order": 1},
            {"name": "Гастрономия", "slug": "gastronomy", "icon": "🍜", "is_featured": True, "display_order": 2},
            {"name": "Природа и пейзажи", "slug": "nature-landscapes", "icon": "🌿", "is_featured": True, "display_order": 3},
            {"name": "Приключения", "slug": "adventures", "icon": "🎿", "is_featured": False, "display_order": 4},
            {"name": "Ночная жизнь", "slug": "nightlife", "icon": "🌙", "is_featured": False, "display_order": 5},
            {"name": "Шопинг", "slug": "shopping", "icon": "🛍️", "is_featured": False, "display_order": 6},
        ]
        
        for data in themes:
            category = Category(
                name=data["name"],
                slug=data["slug"],
                type="theme",
                icon=data["icon"],
                is_featured=data["is_featured"],
                display_order=data["display_order"],
                is_active=True,
                filters={},
                extra_data={}
            )
            db.add(category)
        
        # Форматы (formats)
        formats = [
            {"name": "Индивидуальные", "slug": "private-tours", "icon": "👤", "is_featured": True, "display_order": 1},
            {"name": "Групповые", "slug": "group-tours", "icon": "👥", "is_featured": True, "display_order": 2},
            {"name": "Пешеходные", "slug": "walking-tours", "icon": "🚶", "is_featured": False, "display_order": 3},
            {"name": "На транспорте", "slug": "vehicle-tours", "icon": "🚗", "is_featured": False, "display_order": 4},
            {"name": "Водные", "slug": "water-tours", "icon": "⛵", "is_featured": False, "display_order": 5},
        ]
        
        for data in formats:
            category = Category(
                name=data["name"],
                slug=data["slug"],
                type="format",
                icon=data["icon"],
                is_featured=data["is_featured"],
                display_order=data["display_order"],
                is_active=True,
                filters={},
                extra_data={}
            )
            db.add(category)
        
        # Коллекции (collections) - автоматические подборки
        collections_data = [
            {
                "title": "Лучшие водные экскурсии",
                "slug": "best-water-tours",
                "description": "Острова, пляжи, дайвинг и морские приключения",
                "is_automatic": True,
                "auto_filters": {"tags": ["Водные"], "min_rating": 4.7},
                "auto_limit": 12,
                "is_featured": True,
                "display_order": 1
            },
            {
                "title": "Культурное наследие Азии",
                "slug": "cultural-heritage",
                "description": "Храмы, дворцы и исторические памятники",
                "is_automatic": True,
                "auto_filters": {"category": "Культура", "min_rating": 4.5},
                "auto_limit": 15,
                "is_featured": True,
                "display_order": 2
            },
            {
                "title": "Гастрономические туры",
                "slug": "food-tours",
                "description": "Уличная еда, рынки и кулинарные мастер-классы",
                "is_automatic": True,
                "auto_filters": {"category": "Гастрономия", "min_rating": 4.6},
                "auto_limit": 10,
                "is_featured": True,
                "display_order": 3
            },
        ]
        
        for data in collections_data:
            collection = Collection(
                title=data["title"],
                slug=data["slug"],
                description=data["description"],
                is_automatic=data["is_automatic"],
                auto_filters=data["auto_filters"],
                auto_limit=data["auto_limit"],
                is_featured=data["is_featured"],
                display_order=data["display_order"],
                is_active=True,
                tour_ids=[]
            )
            db.add(collection)
        
        await db.commit()
        
        # Подсчитываем созданные категории
        result = await db.execute(select(Category))
        categories = result.scalars().all()
        
        result = await db.execute(select(Collection))
        collections = result.scalars().all()
        
        print(f"✅ Создано {len(categories)} категорий:")
        for cat in categories:
            print(f"   - {cat.icon} {cat.name} ({cat.type})")
        
        print(f"\n✅ Создано {len(collections)} коллекций:")
        for coll in collections:
            print(f"   - {coll.title}")
        
        print("\n🎉 Инициализация завершена!")


if __name__ == "__main__":
    asyncio.run(init_categories())


