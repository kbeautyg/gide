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
from app.models.destination import Destination
from app.models.landmark import Landmark
from app.models.review import Review
from app.models.article import Article

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
        
        # Создаём направления
        destinations_data = [
            {"name": "Тбилиси", "country": "Грузия", "slug": "tbilisi", 
             "photo_url": "https://images.unsplash.com/photo-1597079858949-19881cff2e1d?w=800",
             "description": "Столица Грузии с богатой историей", "tours_count": 0},
            {"name": "Стамбул", "country": "Турция", "slug": "istanbul", 
             "photo_url": "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800",
             "description": "Город на стыке Европы и Азии", "tours_count": 0},
            {"name": "Бангкок", "country": "Таиланд", "slug": "bangkok", 
             "photo_url": "https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?w=800",
             "description": "Столица Таиланда с древними храмами", "tours_count": 0},
            {"name": "Дубай", "country": "ОАЭ", "slug": "dubai", 
             "photo_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
             "description": "Город будущего в пустыне", "tours_count": 0},
            {"name": "Париж", "country": "Франция", "slug": "paris", 
             "photo_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
             "description": "Город света и романтики", "tours_count": 0},
        ]
        
        for dest_data in destinations_data:
            dest = Destination(**dest_data)
            session.add(dest)
        
        await session.commit()
        print(f"✅ Создано {len(destinations_data)} направлений")
        
        # Получаем Тбилиси для достопримечательностей
        result = await session.execute(
            sa.select(Destination).where(Destination.slug == "tbilisi")
        )
        tbilisi = result.scalar_one_or_none()
        
        if tbilisi:
            landmarks_data = [
                {"destination_id": tbilisi.id, "name": "Серные бани", 
                 "photo_url": "https://images.unsplash.com/photo-1597079858949-19881cff2e1d?w=300", "tours_count": 0},
                {"destination_id": tbilisi.id, "name": "Крепость Нарикала", 
                 "photo_url": "https://images.unsplash.com/photo-1597079858949-19881cff2e1d?w=300", "tours_count": 0},
                {"destination_id": tbilisi.id, "name": "Площадь Свободы", 
                 "photo_url": "https://images.unsplash.com/photo-1597079858949-19881cff2e1d?w=300", "tours_count": 0},
                {"destination_id": tbilisi.id, "name": "Мост Мира", 
                 "photo_url": "https://images.unsplash.com/photo-1597079858949-19881cff2e1d?w=300", "tours_count": 0},
            ]
            
            for landmark_data in landmarks_data:
                landmark = Landmark(**landmark_data)
                session.add(landmark)
            
            await session.commit()
            print(f"✅ Создано {len(landmarks_data)} достопримечательностей")
        
        # Создаём статьи
        articles_data = [
            {
                "title": "Как добраться до Китайской стены: поездка из Пекина",
                "slug": "kak-dobratsya-do-kitayskoy-steny",
                "preview_text": "Удобные маршруты к популярным участкам",
                "content": "Великая Китайская стена — одна из самых известных достопримечательностей мира...",
                "photo_url": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800",
                "read_time": 10,
                "country_tag": "Китай",
                "views_count": 0
            },
            {
                "title": "Древние храмы Египта: где увидеть наследие фараонов",
                "slug": "drevnie-hramy-egipta",
                "preview_text": "От монументального Карнака до затерянного в песках Абу-Симбела",
                "content": "Египет славится своими древними храмами и пирамидами...",
                "photo_url": "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800",
                "read_time": 14,
                "country_tag": "Египет",
                "views_count": 0
            },
            {
                "title": "Пляжи Стамбула: лучшие места для отдыха",
                "slug": "plyazhi-stambula",
                "preview_text": "Городские и пригородные локации на Чёрном и Мраморном морях",
                "content": "Стамбул — не только культурная столица, но и отличное место для пляжного отдыха...",
                "photo_url": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800",
                "read_time": 11,
                "country_tag": "Турция",
                "views_count": 0
            },
        ]
        
        for article_data in articles_data:
            article = Article(**article_data)
            session.add(article)
        
        await session.commit()
        print(f"✅ Создано {len(articles_data)} статей")
        
        # Обновляем существующие туры с новыми полями
        result = await session.execute(sa.select(Tour))
        tours = result.scalars().all()
        
        themes_pool = ["Винные", "Казбеги", "Кахетия", "Гастрономические", "История и архитектура", "На море", "VIP-туры"]
        formats_pool = ["Индивидуальные туры", "Семейный тур", "Треккинг", "Всё включено"]
        
        for i, tour in enumerate(tours):
            # Добавляем контентные блоки
            tour.what_to_expect = f"На этой экскурсии вы откроете {tour.location} с новой стороны. Вас ждут уникальные места и интересные истории."
            tour.organizational_details = "Экскурсия проходит на комфортабельном транспорте с опытным гидом."
            tour.included = ["Трансфер от отеля", "Услуги гида", "Входные билеты", "Обед"]
            tour.not_included = ["Сувениры", "Личные расходы"]
            tour.meeting_point = f"Центр города {tour.location}"
            tour.languages = ["русский", "английский"]
            tour.max_group_size = 10 if i % 2 == 0 else 6
            tour.min_age = 6 if i % 3 == 0 else None
            tour.difficulty_level = "Лёгкая" if i % 2 == 0 else "Средняя"
            
            # Добавляем темы и форматы
            tour.themes = [themes_pool[i % len(themes_pool)], themes_pool[(i + 1) % len(themes_pool)]]
            tour.formats = [formats_pool[i % len(formats_pool)]]
            
            # Добавляем теги и достопримечательности
            tour.tags = ["Для семей"] if i % 3 == 0 else ["Фотосессия"] if i % 2 == 0 else []
            tour.landmarks = ["Храм", "Водопад"] if i % 2 == 0 else ["Рынок", "Музей"]
            
            # Промо (каждый 4-й со скидкой, каждый 5-й новый)
            if i % 4 == 0:
                tour.has_discount = True
                tour.discount_percentage = 20
                tour.original_price = tour.price * 1.25
            if i % 5 == 0:
                tour.is_new = True
            
            # Статистика
            tour.total_bookings = (i + 1) * 5
            tour.views_count = (i + 1) * 50
            
            # SEO
            tour.seo_title = f"{tour.title} — экскурсия в {tour.location}"
            tour.seo_description = tour.description[:160]
            tour.long_description = f"Экскурсии в {tour.location} — это уникальная возможность познакомиться с городом. Наши гиды с удовольствием расскажут вам о истории, культуре и традициях."
        
        await session.commit()
        print(f"✅ Обновлено {len(tours)} туров с новыми полями")
        
        # Создаём отзывы для туров
        if len(tours) > 0:
            reviews_data = []
            for i, tour in enumerate(tours[:10]):  # Отзывы для первых 10 туров
                for j in range(3):  # По 3 отзыва на тур
                    reviews_data.append({
                        "tour_id": tour.id,
                        "user_name": ["Мария", "Андрей", "Дарья", "Игорь", "Таня"][j % 5],
                        "user_photo": f"https://i.pravatar.cc/150?img={i * 3 + j}",
                        "rating": 4.5 + (j * 0.2),
                        "text": f"Отличная экскурсия! Очень понравилось. Гид был профессионален и интересно рассказывал. Рекомендую всем!",
                        "experience_count": j + 1
                    })
            
            for review_data in reviews_data:
                review = Review(**review_data)
                session.add(review)
            
            await session.commit()
            print(f"✅ Создано {len(reviews_data)} отзывов")
        
        # Создаём тестовые заявки
        requests_data = [
            {
                "client_id": super_admin.id,
                "title": "Романтическая прогулка по Пхукету",
                "description": "Хотим увидеть красивые закаты, романтичные места, сделать фотосессию на фоне океана",
                "duration_hours": 2,
                "participants_count": 2,
                "budget": 5000.0,
                "location": "Пхукет",
                "status": "pending"
            },
            {
                "client_id": super_admin.id,
                "title": "Полный день на островах Пхи-Пхи",
                "description": "Снорклинг, пляжи, обед на острове, фотографии, посещение бухты Майя Бэй",
                "duration_hours": 7,
                "participants_count": 4,
                "budget": 15000.0,
                "location": "Пхукет",
                "status": "pending"
            },
            {
                "client_id": super_admin.id,
                "title": "Обзорная экскурсия по Бангкоку",
                "description": "Храмы Ват Пхо и Ват Арун, рынки, уличная еда, прогулка по каналам",
                "duration_hours": 6,
                "participants_count": 3,
                "budget": 8000.0,
                "location": "Бангкок",
                "status": "pending"
            },
            {
                "client_id": super_admin.id,
                "title": "Утренний храмовый комплекс",
                "description": "Посещение главных храмов Бангкока до наплыва туристов, в том числе Изумрудного Будды",
                "duration_hours": 3,
                "participants_count": 2,
                "budget": 4000.0,
                "location": "Бангкок",
                "status": "pending"
            },
            {
                "client_id": super_admin.id,
                "title": "Вечерний закат на пляже Ката",
                "description": "Романтический ужин на пляже с видом на закат, фотосессия",
                "duration_hours": 2,
                "participants_count": 2,
                "budget": 4500.0,
                "location": "Пхукет",
                "status": "pending"
            },
            {
                "client_id": super_admin.id,
                "title": "Трекинг в джунглях Краби",
                "description": "Поход по джунглям с посещением водопадов, купание в горячих источниках",
                "duration_hours": 5,
                "participants_count": 4,
                "budget": 12000.0,
                "location": "Краби",
                "status": "pending"
            },
        ]
        
        for req_data in requests_data:
            req = Request(**req_data)
            session.add(req)
        
        await session.commit()
        print(f"✅ Создано {len(requests_data)} тестовых заявок")
        
        print("ℹ️ Пользователи могут создавать экскурсии сами через ЛК")


if __name__ == "__main__":
    print("🌱 Создание тестовых данных...")
    asyncio.run(seed_data())
    print("✅ Тестовые данные готовы!")
