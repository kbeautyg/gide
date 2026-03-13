"""
Скрипт инициализации базовых категорий и коллекций
Структура категорий как у Tripster: основные категории (themes) и подкатегории (landmarks)
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
    """Инициализация базовых категорий с иерархией"""
    
    async with async_session() as db:
        # Проверяем, есть ли уже категории
        result = await db.execute(select(Category))
        existing = result.scalars().all()
        
        if existing:
            print(f"✅ Категории уже существуют ({len(existing)} шт.). Пропускаем инициализацию.")
            return
        
        print("🚀 Создаем базовые категории с иерархией (как у Tripster)...")
        
        # ========== ОСНОВНЫЕ КАТЕГОРИИ (THEMES) ==========
        # Это родительские категории, которые группируют подкатегории
        
        main_themes = [
            {
                "name": "Музеи и искусство",
                "slug": "muzei-i-iskusstvo",
                "description": "Экскурсии по музеям, галереям и художественным пространствам",
                "icon": "🎨",
                "is_featured": True,
                "display_order": 1
            },
            {
                "name": "Исторические",
                "slug": "istoricheskie",
                "description": "Экскурсии по историческим местам и памятникам",
                "icon": "🏛️",
                "is_featured": True,
                "display_order": 2
            },
            {
                "name": "Архитектура",
                "slug": "arhitektura",
                "description": "Экскурсии по архитектурным достопримечательностям",
                "icon": "🏰",
                "is_featured": True,
                "display_order": 3
            },
            {
                "name": "Гастрономия",
                "slug": "gastronomiya",
                "description": "Гастрономические туры, рынки и кулинарные мастер-классы",
                "icon": "🍜",
                "is_featured": True,
                "display_order": 4
            },
            {
                "name": "Природа и пейзажи",
                "slug": "priroda-i-peyzazhi",
                "description": "Природные достопримечательности, парки и заповедники",
                "icon": "🌿",
                "is_featured": True,
                "display_order": 5
            },
            {
                "name": "Религиозные места",
                "slug": "religioznye-mesta",
                "description": "Храмы, святыни и места паломничества",
                "icon": "🙏",
                "is_featured": False,
                "display_order": 6
            },
            {
                "name": "Приключения",
                "slug": "priklyucheniya",
                "description": "Активные туры и приключенческие экскурсии",
                "icon": "🎿",
                "is_featured": False,
                "display_order": 7
            },
            {
                "name": "Фотосессии",
                "slug": "fotosessii",
                "description": "Фотосессии и фототуры",
                "icon": "📸",
                "is_featured": False,
                "display_order": 8
            },
            {
                "name": "Ночная жизнь",
                "slug": "nochnaya-zhizn",
                "description": "Экскурсии по ночным клубам, барам и развлекательным заведениям",
                "icon": "🌙",
                "is_featured": False,
                "display_order": 9
            },
            {
                "name": "Шопинг",
                "slug": "shoping",
                "description": "Шопинг-туры и рынки",
                "icon": "🛍️",
                "is_featured": False,
                "display_order": 10
            },
        ]
        
        # Создаем основные категории и сохраняем их ID для подкатегорий
        theme_ids = {}
        for theme_data in main_themes:
            category = Category(
                name=theme_data["name"],
                slug=theme_data["slug"],
                description=theme_data.get("description"),
                type="theme",
                icon=theme_data["icon"],
                is_featured=theme_data["is_featured"],
                display_order=theme_data["display_order"],
                is_active=True,
                filters={},
                extra_data={},
                parent_id=None  # Родительские категории не имеют parent_id
            )
            db.add(category)
            await db.flush()  # Получаем ID сразу после создания
            theme_ids[theme_data["slug"]] = category.id
            print(f"   ✓ Создана категория: {theme_data['icon']} {theme_data['name']}")
        
        await db.commit()
        print(f"\n✅ Создано {len(main_themes)} основных категорий")
        
        # ========== ПОДКАТЕГОРИИ (LANDMARKS) ==========
        # Это конкретные места/достопримечательности, привязанные к основным категориям
        
        # Подкатегории для "Музеи и искусство"
        museums_landmarks = [
            {"name": "Эрмитаж", "slug": "ermitazh", "icon": "🏛️", "display_order": 1},
            {"name": "Музей Фаберже", "slug": "muzej-faberzhe", "icon": "💎", "display_order": 2},
            {"name": "Русский музей", "slug": "russkij-muzej", "icon": "🖼️", "display_order": 3},
            {"name": "Третьяковская галерея", "slug": "tretyakovskaya-galereya", "icon": "🎨", "display_order": 4},
            {"name": "Музей современного искусства", "slug": "muzej-sovremennogo-iskusstva", "icon": "🎭", "display_order": 5},
        ]
        
        # Подкатегории для "Исторические"
        historical_landmarks = [
            {"name": "Исторический центр", "slug": "istoricheskij-centr", "icon": "🏛️", "display_order": 1},
            {"name": "Древние руины", "slug": "drevnie-ruiny", "icon": "🏺", "display_order": 2},
            {"name": "Старый город", "slug": "staryj-gorod", "icon": "🏘️", "display_order": 3},
            {"name": "Крепости", "slug": "kreposti", "icon": "🏰", "display_order": 4},
            {"name": "Военные памятники", "slug": "voennye-pamyatniki", "icon": "⚔️", "display_order": 5},
        ]
        
        # Подкатегории для "Архитектура"
        architecture_landmarks = [
            {"name": "Дворцы", "slug": "dvorcy", "icon": "🏰", "display_order": 1},
            {"name": "Храмы и соборы", "slug": "hramy-i-sobory", "icon": "⛪", "display_order": 2},
            {"name": "Особняки", "slug": "osobnyaki", "icon": "🏛️", "display_order": 3},
            {"name": "Современная архитектура", "slug": "sovremennaya-arhitektura", "icon": "🏙️", "display_order": 4},
            {"name": "Мосты", "slug": "mosty", "icon": "🌉", "display_order": 5},
        ]
        
        # Подкатегории для "Гастрономия"
        gastronomy_landmarks = [
            {"name": "Рынки и базары", "slug": "rynki-i-bazary", "icon": "🛒", "display_order": 1},
            {"name": "Уличная еда", "slug": "ulichnaya-eda", "icon": "🍜", "display_order": 2},
            {"name": "Рестораны", "slug": "restorany", "icon": "🍽️", "display_order": 3},
            {"name": "Кулинарные мастер-классы", "slug": "kulinarnye-master-klassy", "icon": "👨‍🍳", "display_order": 4},
            {"name": "Винные туры", "slug": "vinnye-tury", "icon": "🍷", "display_order": 5},
        ]
        
        # Подкатегории для "Природа и пейзажи"
        nature_landmarks = [
            {"name": "Пляжи", "slug": "plyazhi", "icon": "🏖️", "display_order": 1},
            {"name": "Острова", "slug": "ostrova", "icon": "🏝️", "display_order": 2},
            {"name": "Горы", "slug": "gory", "icon": "⛰️", "display_order": 3},
            {"name": "Водопады", "slug": "vodopady", "icon": "🌊", "display_order": 4},
            {"name": "Национальные парки", "slug": "nacionalnye-parki", "icon": "🌳", "display_order": 5},
        ]
        
        # Подкатегории для "Религиозные места"
        religious_landmarks = [
            {"name": "Храмы и святыни", "slug": "hramy-i-svyatyni", "icon": "🙏", "display_order": 1},
            {"name": "Монастыри", "slug": "monastyri", "icon": "⛪", "display_order": 2},
            {"name": "Места паломничества", "slug": "mesta-palomnichestva", "icon": "🕯️", "display_order": 3},
        ]
        
        # Группируем подкатегории по родительским категориям
        subcategories_by_parent = {
            theme_ids["muzei-i-iskusstvo"]: museums_landmarks,
            theme_ids["istoricheskie"]: historical_landmarks,
            theme_ids["arhitektura"]: architecture_landmarks,
            theme_ids["gastronomiya"]: gastronomy_landmarks,
            theme_ids["priroda-i-peyzazhi"]: nature_landmarks,
            theme_ids["religioznye-mesta"]: religious_landmarks,
        }
        
        print("\n📋 Создаем подкатегории...")
        total_subcategories = 0
        
        for parent_id, landmarks in subcategories_by_parent.items():
            parent_category = await db.get(Category, parent_id)
            if not parent_category:
                continue
                
            print(f"\n   Категория: {parent_category.name}")
            for landmark_data in landmarks:
                landmark = Category(
                    name=landmark_data["name"],
                    slug=landmark_data["slug"],
                    type="landmark",
                    icon=landmark_data["icon"],
                    is_featured=False,
                    display_order=landmark_data["display_order"],
                    is_active=True,
                    filters={},
                    extra_data={},
                    parent_id=parent_id  # Привязываем к родительской категории
                )
                db.add(landmark)
                total_subcategories += 1
                print(f"      ✓ {landmark_data['icon']} {landmark_data['name']}")
        
        await db.commit()
        print(f"\n✅ Создано {total_subcategories} подкатегорий")
        
        # ========== ФОРМАТЫ (FORMATS) ==========
        # Форматы проведения экскурсий (не имеют подкатегорий)
        
        formats = [
            {"name": "Индивидуальные", "slug": "individualnye", "icon": "👤", "is_featured": True, "display_order": 1},
            {"name": "Групповые", "slug": "gruppovye", "icon": "👥", "is_featured": True, "display_order": 2},
            {"name": "Пешеходные", "slug": "peshehodnye", "icon": "🚶", "is_featured": False, "display_order": 3},
            {"name": "На транспорте", "slug": "na-transporte", "icon": "🚗", "is_featured": False, "display_order": 4},
            {"name": "Водные", "slug": "vodnye", "icon": "⛵", "is_featured": False, "display_order": 5},
        ]
        
        print("\n🚀 Создаем форматы...")
        for format_data in formats:
            category = Category(
                name=format_data["name"],
                slug=format_data["slug"],
                type="format",
                icon=format_data["icon"],
                is_featured=format_data["is_featured"],
                display_order=format_data["display_order"],
                is_active=True,
                filters={},
                extra_data={},
                parent_id=None  # Форматы не имеют подкатегорий
            )
            db.add(category)
            print(f"   ✓ {format_data['icon']} {format_data['name']}")
        
        await db.commit()
        print(f"✅ Создано {len(formats)} форматов")
        
        # ========== КОЛЛЕКЦИИ ==========
        
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
        
        print("\n🚀 Создаем коллекции...")
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
            print(f"   ✓ {data['title']}")
        
        await db.commit()
        print(f"✅ Создано {len(collections_data)} коллекций")
        
        # Подсчитываем итоги
        result = await db.execute(select(Category))
        categories = result.scalars().all()
        
        result = await db.execute(select(Collection))
        collections = result.scalars().all()
        
        print(f"\n📊 ИТОГО:")
        print(f"   - Основных категорий (themes): {len([c for c in categories if c.type == 'theme' and c.parent_id is None])}")
        print(f"   - Подкатегорий (landmarks): {len([c for c in categories if c.type == 'landmark'])}")
        print(f"   - Форматов (formats): {len([c for c in categories if c.type == 'format'])}")
        print(f"   - Коллекций: {len(collections)}")
        print(f"\n🎉 Инициализация завершена!")


if __name__ == "__main__":
    asyncio.run(init_categories())
