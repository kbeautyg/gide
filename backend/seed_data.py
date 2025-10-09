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
from app.models.request import Request

# Async engine
DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def seed_data():
    """Создание тестовых данных"""
    
    async with async_session() as session:
        import sqlalchemy as sa
        
        # Очищаем телефон админа
        phone_clean = ''.join(filter(str.isdigit, settings.SUPER_ADMIN_PHONE))
        
        # Получаем админа
        result = await session.execute(
            sa.select(User).where(User.phone == phone_clean)
        )
        admin = result.scalar_one_or_none()
        
        if not admin:
            print("❌ Админ не найден")
            return
        
        print(f"✅ Админ найден: {admin.phone} (ID: {admin.id})")
        
        # Создаём системного гида для публичных туров (чтобы не показывать их обычным гидам)
        system_guide_phone = "00000000000"  # Системный номер
        result = await session.execute(
            sa.select(User).where(User.phone == system_guide_phone)
        )
        system_guide = result.scalar_one_or_none()
        
        if not system_guide:
            from app.core.security import get_password_hash
            system_guide = User(
                phone=system_guide_phone,
                email="system@thaiguide.pro",
                name="Каталог ThaiGuide",
                hashed_password=get_password_hash("system_password_no_login"),
                role=UserRole.MANAGER,
                parent_id=admin.id
            )
            session.add(system_guide)
            await session.commit()
            await session.refresh(system_guide)
            print(f"✅ Системный гид создан (ID: {system_guide.id})")
        else:
            print(f"✅ Системный гид найден (ID: {system_guide.id})")
        
        # Создаём направления (проверяем на существование)
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
        
        created_count = 0
        for dest_data in destinations_data:
            # Проверяем, существует ли уже
            existing = await session.execute(
                sa.select(Destination).where(Destination.slug == dest_data['slug'])
            )
            if not existing.scalar_one_or_none():
                dest = Destination(**dest_data)
                session.add(dest)
                created_count += 1
        
        await session.commit()
        print(f"✅ Создано {created_count} новых направлений (пропущено {len(destinations_data) - created_count} существующих)")
        
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
            
            landmark_created = 0
            for landmark_data in landmarks_data:
                # Проверяем дубликаты по имени и destination_id
                existing = await session.execute(
                    sa.select(Landmark).where(
                        Landmark.destination_id == landmark_data['destination_id'],
                        Landmark.name == landmark_data['name']
                    )
                )
                if not existing.scalar_one_or_none():
                    landmark = Landmark(**landmark_data)
                    session.add(landmark)
                    landmark_created += 1
            
            await session.commit()
            print(f"✅ Создано {landmark_created} новых достопримечательностей")
        
        # Создаём статьи (проверяем дубликаты)
        articles_data = [
            {
                "title": "Как добраться до Китайской стены: поездка из Пекина",
                "slug": "kak-dobratsya-do-kitayskoy-steny",
                "preview_text": "Удобные маршруты к популярным участкам",
                "content": """Великая Китайская стена — одна из самых известных достопримечательностей мира и обязательный пункт программы при посещении Пекина.

## Как добраться

Самый популярный участок для туристов — Бадалин, расположен в 70 км от Пекина. Добраться можно на автобусе 877 от станции метро Deshengmen, поездка займёт около 1.5 часов.

Альтернативный вариант — участок Мутяньюй, менее людный и более живописный. До него ходят туристические автобусы от площади Тяньаньмэнь.

## Что взять с собой

Удобная обувь обязательна — подъёмы крутые! Вода, головной убор и солнцезащитный крем в летний период. Зимой — тёплая одежда, на стене ветрено.

## Советы

Приезжайте к открытию (7:00-8:00) чтобы избежать толп. Лучшее время для посещения — весна и осень. Закладывайте минимум 4-5 часов на посещение.""",
                "photo_url": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800",
                "read_time": 10,
                "country_tag": "Китай",
                "views_count": 0
            },
            {
                "title": "Древние храмы Египта: где увидеть наследие фараонов",
                "slug": "drevnie-hramy-egipta",
                "preview_text": "От монументального Карнака до затерянного в песках Абу-Симбела",
                "content": """Египет — страна с тысячелетней историей, где каждый камень хранит память о великих фараонах и могущественных цивилизациях.

## Карнакский храм

Самый большой храмовый комплекс древности. Гипостильный зал со 134 колоннами производит невероятное впечатление. Лучшее время для посещения — раннее утро, когда мало туристов.

## Абу-Симбел

Высеченные в скале храмы Рамзеса II на берегу Нила. Добраться можно из Асуана (3 часа на автобусе). Дважды в год (22 февраля и 22 октября) солнечные лучи освещают статую Рамзеса в глубине храма.

## Практические советы

Обязательно берите воду — в храмах очень жарко. Гид необходим для понимания иероглифов и истории. Многие храмы закрываются в 17:00, планируйте визит заранее.""",
                "photo_url": "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800",
                "read_time": 14,
                "country_tag": "Египет",
                "views_count": 0
            },
            {
                "title": "Пляжи Стамбула: лучшие места для отдыха",
                "slug": "plyazhi-stambula",
                "preview_text": "Городские и пригородные локации на Чёрном и Мраморном морях",
                "content": """Стамбул удивляет своим разнообразием — это не только исторические достопримечательности, но и прекрасные пляжи на двух морях.

## Пляжи на Чёрном море

Кильос и Шиле — популярные курортные районы в часе езды от центра. Чистая вода, песчаные пляжи, много кафе и ресторанов. Добраться можно на автобусе с площади Таксим.

## Мраморное море

Принцевы острова (Бююкада, Хейбелиада) — идеальны для однодневной поездки. Паром от Кабаташа (40 минут). Тихие бухты, прокат велосипедов, отсутствие машин создают особую атмосферу.

## Советы

Лучший сезон: июнь-сентябрь. В июле-августе многолюдно, выбирайте будние дни. Берите с собой полотенце и крем от солнца. На островах можно арендовать лежаки (100-150 лир).""",
                "photo_url": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800",
                "read_time": 11,
                "country_tag": "Турция",
                "views_count": 0
            },
        ]
        
        article_created = 0
        for article_data in articles_data:
            # Проверяем дубликаты по slug
            existing = await session.execute(
                sa.select(Article).where(Article.slug == article_data['slug'])
            )
            if not existing.scalar_one_or_none():
                article = Article(**article_data)
                session.add(article)
                article_created += 1
        
        await session.commit()
        print(f"✅ Создано {article_created} новых статей")
        
        # Создаём 50+ туров с разными категориями
        tours_data = [
            # История и культура (15 туров)
            {"title": "Прогулка по Старому Тбилиси", "description": "Откройте сердце города с местным гидом", "price": 3500, "duration": 3, "location": "Тбилиси", "category": "История", "rating": 4.9, "reviews_count": 127, 
             "photos": ["https://images.unsplash.com/photo-1597079858949-19881cff2e1d?w=800", "https://images.unsplash.com/photo-1576144284135-85b908ded0c8?w=800"]},
            {"title": "Храмы и мечети Стамбула", "description": "Голубая мечеть, Айя-София, Султанахмет", "price": 4200, "duration": 4, "location": "Стамбул", "category": "Культура", "rating": 4.8, "reviews_count": 203,
             "photos": ["https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800", "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800"]},
            {"title": "Древние храмы Бангкока", "description": "Ват Пхо, Ват Арун, Изумрудный Будда", "price": 3800, "duration": 5, "location": "Бангкок", "category": "Культура", "rating": 4.7, "reviews_count": 156,
             "photos": ["https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?w=800", "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800"]},
            {"title": "Музеи Парижа за один день", "description": "Лувр, Орсе, Музей Родена с гидом-искусствоведом", "price": 8500, "duration": 7, "location": "Париж", "category": "История", "rating": 5.0, "reviews_count": 312,
             "photos": ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800", "https://images.unsplash.com/photo-1549144511-f099e773c147?w=800"]},
            {"title": "Еврейский квартал в Стамбуле", "description": "Балат и Фенер: история, синагоги, аутентичные кафе", "price": 3200, "duration": 3, "location": "Стамбул", "category": "История", "rating": 4.6, "reviews_count": 89,
             "photos": ["https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800"]},
            
            # Природа и приключения (12 туров)
            {"title": "Каньонинг в горах Грузии", "description": "Экстремальный спуск по водопадам Мартвили", "price": 7500, "duration": 6, "location": "Кутаиси", "category": "Природа", "rating": 4.9, "reviews_count": 67,
             "photos": ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800"]},
            {"title": "Острова Пхи-Пхи на закате", "description": "Снорклинг, бухта Майя Бэй, романтический ужин", "price": 12000, "duration": 8, "location": "Пхукет", "category": "Природа", "rating": 4.8, "reviews_count": 245,
             "photos": ["https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800", "https://images.unsplash.com/photo-1589224251458-b82c64024e03?w=800"]},
            {"title": "Сафари в пустыне Дубая", "description": "Джип-тур, катание на верблюдах, шоу в бедуинском лагере", "price": 9500, "duration": 5, "location": "Дубай", "category": "Приключения", "rating": 4.7, "reviews_count": 178,
             "photos": ["https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800", "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800"]},
            {"title": "Трекинг к водопадам Краби", "description": "Поход по джунглям, купание в горячих источниках", "price": 6800, "duration": 7, "location": "Краби", "category": "Природа", "rating": 4.9, "reviews_count": 134,
             "photos": ["https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800"]},
            {"title": "Вулкан и винодельни Кахетии", "description": "Сигнахи, монастырь Бодбе, дегустация вин", "price": 5500, "duration": 8, "location": "Кахетия", "category": "Природа", "rating": 5.0, "reviews_count": 201,
             "photos": ["https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=800"]},
            
            # Гастрономические туры (10 туров)
            {"title": "Стрит-фуд Бангкока", "description": "Лучшие рынки и уличные кафе с местным гидом", "price": 4200, "duration": 4, "location": "Бангкок", "category": "Гастрономия", "rating": 4.8, "reviews_count": 189,
             "photos": ["https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800"]},
            {"title": "Хинкали и хачапури: мастер-класс", "description": "Готовим с грузинской бабушкой, обед в семье", "price": 3800, "duration": 4, "location": "Тбилиси", "category": "Гастрономия", "rating": 5.0, "reviews_count": 167,
             "photos": ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800"]},
            {"title": "Рыбный рынок и сашими в Паттайе", "description": "Покупаем свежайшие морепродукты, готовим с шефом", "price": 5200, "duration": 3, "location": "Паттайя", "category": "Гастрономия", "rating": 4.7, "reviews_count": 98,
             "photos": ["https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800"]},
            {"title": "Турецкие сладости и кофе", "description": "Гранд-базар, лукум, чай в исторических кофейнях", "price": 3200, "duration": 3, "location": "Стамбул", "category": "Гастрономия", "rating": 4.6, "reviews_count": 142,
             "photos": ["https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800"]},
            {"title": "Парижские кондитерские: от макарон до эклеров", "description": "5 легендарных кондитерских, дегустация 15 десертов", "price": 7500, "duration": 3, "location": "Париж", "category": "Гастрономия", "rating": 4.9, "reviews_count": 231,
             "photos": ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800"]},
            
            # Экстрим и спорт (8 туров)
            {"title": "Параглайдинг над Батуми", "description": "Полёт с инструктором, видео в подарок", "price": 8500, "duration": 2, "location": "Батуми", "category": "Экстрим", "rating": 5.0, "reviews_count": 78,
             "photos": ["https://images.unsplash.com/photo-1522398371702-4a2f2a9f5a70?w=800"]},
            {"title": "Дайвинг на острове Ко Тао", "description": "Для новичков и опытных, сертификат PADI", "price": 11000, "duration": 8, "location": "Ко Тао", "category": "Спорт", "rating": 4.9, "reviews_count": 156,
             "photos": ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800"]},
            {"title": "Сёрфинг на Пхукете: урок для начинающих", "description": "2 часа с инструктором, оборудование включено", "price": 4500, "duration": 2, "location": "Пхукет", "category": "Спорт", "rating": 4.7, "reviews_count": 89,
             "photos": ["https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800"]},
            {"title": "Рафтинг по реке Арагви", "description": "Бурный сплав, пороги 2-3 категории, обед на природе", "price": 6200, "duration": 6, "location": "Пасанаури", "category": "Экстрим", "rating": 4.8, "reviews_count": 103,
             "photos": ["https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800"]},
            {"title": "Конная прогулка в Каппадокии", "description": "Закат среди скальных образований", "price": 5800, "duration": 3, "location": "Каппадокия", "category": "Спорт", "rating": 4.9, "reviews_count": 124,
             "photos": ["https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=800"]},
            
            # Семейные экскурсии (5 туров)
            {"title": "Океанариум и шоу дельфинов", "description": "Интерактивная программа для детей, фото с дельфинами", "price": 4800, "duration": 4, "location": "Паттайя", "category": "Семейные", "rating": 4.8, "reviews_count": 167,
             "photos": ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]},
            {"title": "Диснейленд в Париже: без очередей", "description": "VIP-пропуск, встреча с персонажами, обед в замке", "price": 15000, "duration": 8, "location": "Париж", "category": "Семейные", "rating": 5.0, "reviews_count": 289,
             "photos": ["https://images.unsplash.com/photo-1512206866737-0b4ff9acefc9?w=800"]},
            {"title": "Зоопарк Дусит и прогулка по каналам", "description": "Животные, кормление жирафов, лодка по Чао-Прайя", "price": 3500, "duration": 5, "location": "Бангкок", "category": "Семейные", "rating": 4.7, "reviews_count": 142,
             "photos": ["https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800"]},
            {"title": "Аквапарк Wild Wadi в Дубае", "description": "Целый день развлечений, трансфер от отеля", "price": 7200, "duration": 6, "location": "Дубай", "category": "Семейные", "rating": 4.9, "reviews_count": 198,
             "photos": ["https://images.unsplash.com/photo-1561410234-e464d75695da?w=800"]},
            {"title": "Детский мастер-класс: сладости в Стамбуле", "description": "Готовим турецкие сладости, дети берут домой лукум", "price": 3200, "duration": 2, "location": "Стамбул", "category": "Семейные", "rating": 4.8, "reviews_count": 87,
             "photos": ["https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800"]},
            
            # Дополнительные туры (20 туров для достижения 50+)
            {"title": "Ночная жизнь Бангкока", "description": "Лучшие бары на крышах, ночной рынок, тайский массаж", "price": 5500, "duration": 5, "location": "Бангкок", "category": "Развлечения", "rating": 4.6, "reviews_count": 134,
             "photos": ["https://images.unsplash.com/photo-1526882924447-7e9da5da8d84?w=800"]},
            {"title": "Фотопрогулка по Монмартру", "description": "Профессиональная фотосессия, 50+ обработанных фото", "price": 9500, "duration": 3, "location": "Париж", "category": "Фотосессии", "rating": 5.0, "reviews_count": 178,
             "photos": ["https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800"]},
            {"title": "Босфор на яхте", "description": "Частная яхта, шампанское, закуски, закат", "price": 18000, "duration": 3, "location": "Стамбул", "category": "VIP", "rating": 5.0, "reviews_count": 89,
             "photos": ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]},
            {"title": "Секретные места Тбилиси", "description": "Малоизвестные локации, винные погреба, граффити-дворы", "price": 3800, "duration": 4, "location": "Тбилиси", "category": "Необычные", "rating": 4.9, "reviews_count": 112,
             "photos": ["https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800"]},
            {"title": "Массаж и SPA в королевском стиле", "description": "Тайский массаж, ароматерапия, джакузи с лепестками роз", "price": 6500, "duration": 3, "location": "Бангкок", "category": "SPA", "rating": 4.8, "reviews_count": 167,
             "photos": ["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800"]},
            {"title": "Шопинг-тур по моллам Дубая", "description": "Dubai Mall, Mall of Emirates, личный стилист", "price": 8500, "duration": 6, "location": "Дубай", "category": "Шопинг", "rating": 4.7, "reviews_count": 145,
             "photos": ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"]},
            {"title": "Йога на рассвете у океана", "description": "Занятие с инструктором, медитация, смузи-боул", "price": 2800, "duration": 2, "location": "Пхукет", "category": "Здоровье", "rating": 4.9, "reviews_count": 98,
             "photos": ["https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800"]},
            {"title": "Виноградники Кахетии с пикником", "description": "Сбор винограда, давление ногами, дегустация из квеври", "price": 7200, "duration": 8, "location": "Кахетия", "category": "Винные", "rating": 5.0, "reviews_count": 201,
             "photos": ["https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800"]},
            {"title": "Архитектура Гауди в Барселоне", "description": "Саграда Фамилия, Парк Гуэль, Каса Батльо без очередей", "price": 9800, "duration": 6, "location": "Барселона", "category": "Архитектура", "rating": 5.0, "reviews_count": 267,
             "photos": ["https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800"]},
            {"title": "Круиз по каналам Амстердама", "description": "Лодка с капитаном, сыр и пиво, закат", "price": 7500, "duration": 2, "location": "Амстердам", "category": "Круизы", "rating": 4.8, "reviews_count": 189,
             "photos": ["https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800"]},
            {"title": "Мурманск: охота за северным сиянием", "description": "Ночная поездка к сопкам, термос с чаем, гарантия фото", "price": 8500, "duration": 6, "location": "Мурманск", "category": "Природа", "rating": 4.9, "reviews_count": 156,
             "photos": ["https://images.unsplash.com/photo-1579033461380-adb47c3eb938?w=800"]},
            {"title": "Байкал: ледяные гроты зимой", "description": "Прогулка по льду, посещение пещер, обед в юрте", "price": 12000, "duration": 8, "location": "Листвянка", "category": "Природа", "rating": 5.0, "reviews_count": 134,
             "photos": ["https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?w=800"]},
            {"title": "Мачу-Пикчу на рассвете", "description": "Встречаем солнце в древнем городе инков, альпаки", "price": 22000, "duration": 12, "location": "Куско", "category": "История", "rating": 5.0, "reviews_count": 312,
             "photos": ["https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800"]},
            {"title": "Сафари в Серенгети", "description": "3 дня: львы, слоны, жирафы, ночёвка в палатке", "price": 35000, "duration": 72, "location": "Серенгети", "category": "Приключения", "rating": 5.0, "reviews_count": 89,
             "photos": ["https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800"]},
            {"title": "Рафтинг по Колорадо", "description": "Гранд-Каньон с воды, пороги 4 категории, кемпинг", "price": 28000, "duration": 48, "location": "Гранд-Каньон", "category": "Экстрим", "rating": 5.0, "reviews_count": 67,
             "photos": ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"]},
            {"title": "Тропой хоббитов: Новая Зеландия", "description": "Хоббитон, Фангорн, водопады из 'Властелина колец'", "price": 32000, "duration": 96, "location": "Роторуа", "category": "Кино", "rating": 5.0, "reviews_count": 178,
             "photos": ["https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"]},
            {"title": "Вечер в Большом театре", "description": "Балет 'Лебединое озеро', места в партере, фуршет в антракте", "price": 15000, "duration": 4, "location": "Москва", "category": "Театр", "rating": 5.0, "reviews_count": 234,
             "photos": ["https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800"]},
            {"title": "Казбек: восхождение для новичков", "description": "5 дней, с акклиматизацией, гид-альпинист, оборудование", "price": 18000, "duration": 120, "location": "Казбеги", "category": "Альпинизм", "rating": 4.9, "reviews_count": 87,
             "photos": ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"]},
            {"title": "Прага: пивной тур", "description": "5 лучших пивоварен, дегустация 10 сортов, закуски", "price": 5800, "duration": 4, "location": "Прага", "category": "Гастрономия", "rating": 4.8, "reviews_count": 198,
             "photos": ["https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800"]},
            {"title": "Лиссабон на трамвае №28", "description": "Весь город за 3 часа, остановки на панорамных точках", "price": 4200, "duration": 3, "location": "Лиссабон", "category": "Обзорные", "rating": 4.7, "reviews_count": 156,
             "photos": ["https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800"]},
        ]
        
        tours_created = 0
        for tour_data in tours_data:
            # Проверяем дубликаты по title
            existing = await session.execute(
                sa.select(Tour).where(Tour.title == tour_data['title'])
            )
            if not existing.scalar_one_or_none():
                tour = Tour(
                    guide_id=system_guide.id,  # Привязываем к системному гиду, не к супер-админу
                    title=tour_data['title'],
                    description=tour_data['description'],
                    price=tour_data['price'],
                    duration=tour_data['duration'],
                    location=tour_data['location'],
                    category=tour_data['category'],
                    photos=tour_data['photos'],
                    rating=tour_data['rating'],
                    reviews_count=tour_data['reviews_count'],
                    active=True,
                    is_public=True
                )
                session.add(tour)
                tours_created += 1
        
        await session.commit()
        print(f"✅ Создано {tours_created} новых туров (пропущено {len(tours_data) - tours_created} существующих)")
        
        # Обновляем существующие туры с новыми полями
        result = await session.execute(sa.select(Tour))
        tours = result.scalars().all()
        
        themes_pool = ["Винные", "Казбеги", "Кахетия", "Гастрономические", "История и архитектура", "На море", "VIP-туры"]
        formats_pool = ["Индивидуальные туры", "Семейный тур", "Треккинг", "Всё включено"]
        
        for i, tour in enumerate(tours):
            # Детальные описания в зависимости от категории
            if "История" in tour.category or "Культура" in tour.category:
                tour.what_to_expect = f"• Прогулка по историческому центру {tour.location}\n• Посещение главных достопримечательностей\n• Рассказы о местных традициях и обычаях\n• Знакомство с архитектурой и культурным наследием\n• Остановки для фотографий в самых живописных местах\n• Ответы на все ваши вопросы от опытного гида"
                tour.included = ["Услуги русскоязычного гида", "Входные билеты в музеи", "Трансфер от/до отеля", "Бутылка воды", "Карта города"]
                tour.not_included = ["Обед и напитки", "Сувениры", "Личные расходы", "Чаевые гиду (по желанию)"]
            elif "Природа" in tour.category or "Приключения" in tour.category:
                tour.what_to_expect = f"• Путешествие к природным достопримечательностям {tour.location}\n• Треккинг по живописным маршрутам\n• Купание в чистейших водоёмах (сезонно)\n• Пикник на природе с местными продуктами\n• Фотосессия на фоне потрясающих пейзажей\n• Рассказы о флоре и фауне региона"
                tour.included = ["Профессиональный гид", "Трансфер на комфортабельном транспорте", "Оборудование для треккинга", "Обед-пикник", "Страховка", "Питьевая вода"]
                tour.not_included = ["Специальная одежда", "Дополнительные активности", "Алкогольные напитки"]
            elif "Гастрономия" in tour.category:
                tour.what_to_expect = f"• Дегустация аутентичных блюд {tour.location}\n• Посещение 5-7 лучших заведений города\n• Знакомство с местной кухней и кулинарными традициями\n• Мастер-класс по приготовлению блюд\n• Общение с местными шеф-поварами\n• Рецепты и советы которые можно использовать дома"
                tour.included = ["Гид-фудкритик", "Дегустация в 5-7 местах", "Все блюда и напитки по программе", "Рецепты блюд", "Трансфер между локациями"]
                tour.not_included = ["Дополнительные блюда вне программы", "Алкоголь премиум-класса", "Сувениры"]
            else:
                tour.what_to_expect = f"• Знакомство с {tour.location} в уникальном формате\n• Посещение интересных локаций\n• Профессиональный гид поделится инсайдерской информацией\n• Возможность задать любые вопросы\n• Фотографии на память\n• Приятная атмосфера и новые знакомства"
                tour.included = ["Услуги гида", "Входные билеты", "Трансфер", "Вода"]
                tour.not_included = ["Питание", "Личные расходы", "Сувениры"]
            
            tour.organizational_details = f"Встреча в центре города {tour.location}. Рекомендуем удобную обувь и одежду по погоде. Взять с собой: фотоаппарат, солнцезащитный крем, головной убор. Возможен трансфер от вашего отеля (уточните при бронировании)."
            tour.meeting_point = f"Главная площадь, {tour.location} (точный адрес отправим за день до экскурсии)"
            tour.languages = ["Русский", "Английский"] if i % 2 == 0 else ["Русский"]
            tour.max_group_size = 8 if "VIP" in tour.category or "Индивид" in str(tour.title) else 12
            tour.min_age = 0 if "Семейн" in tour.category else 12
            tour.difficulty_level = "Сложная" if "Треккинг" in str(tour.title) or "Восхождение" in str(tour.title) else "Средняя" if tour.duration > 5 else "Лёгкая"
            
            # Темы и форматы
            tour.themes = [themes_pool[i % len(themes_pool)], themes_pool[(i + 1) % len(themes_pool)]]
            tour.formats = [formats_pool[i % len(formats_pool)]]
            
            # Теги и достопримечательности
            tour.tags = ["Для семей", "Фотосессия"] if i % 3 == 0 else ["Фотосессия"] if i % 2 == 0 else ["Инстаграмное место"]
            tour.landmarks = ["Храм", "Смотровая площадка", "Исторический квартал"] if i % 2 == 0 else ["Рынок", "Музей", "Набережная"]
            
            # Промо
            if i % 4 == 0:
                tour.has_discount = True
                tour.discount_percentage = 20
                tour.original_price = tour.price * 1.25
            if i % 5 == 0:
                tour.is_new = True
            
            # Статистика (реалистичная)
            tour.total_bookings = min((i + 1) * 8, 150)
            tour.views_count = min((i + 1) * 75, 500)
            
            # SEO и детальное описание
            tour.seo_title = f"{tour.title} — авторская экскурсия в {tour.location} | Turex Pro"
            tour.seo_description = f"{tour.description} Бронируйте экскурсию онлайн с опытным гидом. Отзывы, фото, гарантия возврата."
            
            # Расширенное описание (500+ символов)
            tour.long_description = f"""Откройте для себя {tour.location} с этой увлекательной экскурсией! 

Эта экскурсия — отличный способ познакомиться с городом и его жителями. Вы увидите не только главные достопримечательности, но и секретные места, о которых знают только местные.

Наш профессиональный гид поделится интересными историями, покажет лучшие локации для фотографий и ответит на все ваши вопросы. Программа адаптируется под ваши интересы — хотите больше истории? Или предпочитаете гастрономические остановки? Мы подстроимся под вас!

Экскурсия проходит в комфортном темпе, подходит для всех возрастов. Мы делаем остановки для отдыха и фото. В конце вы получите рекомендации по ресторанам, кафе и другим интересным местам города.

Присоединяйтесь и создайте незабываемые воспоминания в {tour.location}!"""
        
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
        
        # Создаём тестовые заявки (проверяем дубликаты по title)
        requests_data = [
            {
                "client_id": admin.id,
                "title": "Романтическая прогулка по Пхукету",
                "description": "Хотим увидеть красивые закаты, романтичные места, сделать фотосессию на фоне океана",
                "duration_hours": 2,
                "participants_count": 2,
                "budget": 5000.0,
                "location": "Пхукет",
                "status": "pending"
            },
            {
                "client_id": admin.id,
                "title": "Полный день на островах Пхи-Пхи",
                "description": "Снорклинг, пляжи, обед на острове, фотографии, посещение бухты Майя Бэй",
                "duration_hours": 7,
                "participants_count": 4,
                "budget": 15000.0,
                "location": "Пхукет",
                "status": "pending"
            },
            {
                "client_id": admin.id,
                "title": "Обзорная экскурсия по Бангкоку",
                "description": "Храмы Ват Пхо и Ват Арун, рынки, уличная еда, прогулка по каналам",
                "duration_hours": 6,
                "participants_count": 3,
                "budget": 8000.0,
                "location": "Бангкок",
                "status": "pending"
            },
            {
                "client_id": admin.id,
                "title": "Утренний храмовый комплекс",
                "description": "Посещение главных храмов Бангкока до наплыва туристов, в том числе Изумрудного Будды",
                "duration_hours": 3,
                "participants_count": 2,
                "budget": 4000.0,
                "location": "Бангкок",
                "status": "pending"
            },
            {
                "client_id": admin.id,
                "title": "Вечерний закат на пляже Ката",
                "description": "Романтический ужин на пляже с видом на закат, фотосессия",
                "duration_hours": 2,
                "participants_count": 2,
                "budget": 4500.0,
                "location": "Пхукет",
                "status": "pending"
            },
            {
                "client_id": admin.id,
                "title": "Трекинг в джунглях Краби",
                "description": "Поход по джунглям с посещением водопадов, купание в горячих источниках",
                "duration_hours": 5,
                "participants_count": 4,
                "budget": 12000.0,
                "location": "Краби",
                "status": "pending"
            },
        ]
        
        request_created = 0
        for req_data in requests_data:
            # Проверяем дубликаты по title и status
            existing = await session.execute(
                sa.select(Request).where(
                    Request.title == req_data['title'],
                    Request.status == 'pending'
                )
            )
            if not existing.scalar_one_or_none():
                req = Request(**req_data)
                session.add(req)
                request_created += 1
        
        await session.commit()
        print(f"✅ Создано {request_created} новых заявок (пропущено {len(requests_data) - request_created} существующих)")
        
        print("ℹ️ Пользователи могут создавать экскурсии сами через ЛК")


if __name__ == "__main__":
    print("🌱 Создание тестовых данных...")
    asyncio.run(seed_data())
    print("✅ Тестовые данные готовы!")
