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
        
        # Создаём направления (ТОЛЬКО АЗИЯ!)
        destinations_data = [
            # Таиланд
            {"name": "Бангкок", "country": "Таиланд", "slug": "bangkok", 
             "photo_url": "https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?w=800",
             "description": "Столица Таиланда с древними храмами и современными небоскребами", "tours_count": 0},
            {"name": "Пхукет", "country": "Таиланд", "slug": "phuket", 
             "photo_url": "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800",
             "description": "Райский остров с белоснежными пляжами", "tours_count": 0},
            {"name": "Паттайя", "country": "Таиланд", "slug": "pattaya", 
             "photo_url": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
             "description": "Курортный город с пляжами и шоу", "tours_count": 0},
            {"name": "Краби", "country": "Таиланд", "slug": "krabi", 
             "photo_url": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
             "description": "Известен скалами и изумрудными водами", "tours_count": 0},
            {"name": "Чиангмай", "country": "Таиланд", "slug": "chiangmai", 
             "photo_url": "https://images.unsplash.com/photo-1604577968897-fab6ff4a09a3?w=800",
             "description": "Культурная столица севера", "tours_count": 0},
            {"name": "Ко Тао", "country": "Таиланд", "slug": "koh-tao", 
             "photo_url": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
             "description": "Остров дайверов", "tours_count": 0},
            
            # Япония
            {"name": "Токио", "country": "Япония", "slug": "tokyo", 
             "photo_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
             "description": "Столица Японии — город контрастов", "tours_count": 0},
            {"name": "Киото", "country": "Япония", "slug": "kyoto", 
             "photo_url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
             "description": "Древняя столица с храмами и садами", "tours_count": 0},
            {"name": "Осака", "country": "Япония", "slug": "osaka", 
             "photo_url": "https://images.unsplash.com/photo-1589452271712-64b8a66c7b71?w=800",
             "description": "Город гурманов", "tours_count": 0},
            
            # Индонезия
            {"name": "Убуд", "country": "Индонезия", "slug": "ubud", 
             "photo_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
             "description": "Культурное сердце Бали", "tours_count": 0},
            {"name": "Семиньяк", "country": "Индонезия", "slug": "seminyak", 
             "photo_url": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
             "description": "Модный курорт Бали", "tours_count": 0},
            {"name": "Нуса-Дуа", "country": "Индонезия", "slug": "nusa-dua", 
             "photo_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
             "description": "Элитный курорт Бали", "tours_count": 0},
            
            # Вьетнам
            {"name": "Ханой", "country": "Вьетнам", "slug": "hanoi", 
             "photo_url": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
             "description": "Столица Вьетнама", "tours_count": 0},
            {"name": "Хошимин", "country": "Вьетнам", "slug": "ho-chi-minh", 
             "photo_url": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
             "description": "Бывший Сайгон", "tours_count": 0},
            {"name": "Халонг", "country": "Вьетнам", "slug": "halong", 
             "photo_url": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
             "description": "Бухта с известняковыми островами", "tours_count": 0},
            
            # Корея
            {"name": "Сеул", "country": "Корея", "slug": "seoul", 
             "photo_url": "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800",
             "description": "Динамичная столица", "tours_count": 0},
            {"name": "Пусан", "country": "Корея", "slug": "busan", 
             "photo_url": "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800",
             "description": "Второй город Кореи", "tours_count": 0},
            
            # Сингапур
            {"name": "Сингапур", "country": "Сингапур", "slug": "singapore", 
             "photo_url": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800",
             "description": "Город-государство будущего", "tours_count": 0},
            
            # ОАЭ
            {"name": "Дубай", "country": "ОАЭ", "slug": "dubai", 
             "photo_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
             "description": "Город будущего в пустыне", "tours_count": 0},
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
        
        # Достопримечательности для азиатских городов
        result = await session.execute(
            sa.select(Destination).where(Destination.slug == "bangkok")
        )
        bangkok = result.scalar_one_or_none()
        
        if bangkok:
            landmarks_data = [
                {"destination_id": bangkok.id, "name": "Большой дворец", 
                 "photo_url": "https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?w=300", "tours_count": 0},
                {"destination_id": bangkok.id, "name": "Ват Пхо", 
                 "photo_url": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=300", "tours_count": 0},
                {"destination_id": bangkok.id, "name": "Ват Арун", 
                 "photo_url": "https://images.unsplash.com/photo-1599038966398-3fe4dd76fdc8?w=300", "tours_count": 0},
                {"destination_id": bangkok.id, "name": "Чайнатаун", 
                 "photo_url": "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=300", "tours_count": 0},
            ]
            
            landmark_created = 0
            for landmark_data in landmarks_data:
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
        
        # Создаём статьи (только про Азию!)
        articles_data = [
            {
                "title": "10 лучших храмов Бангкока для первого посещения",
                "slug": "10-best-temples-bangkok",
                "preview_text": "Путеводитель по самым красивым храмам тайской столицы",
                "content": """Бангкок известен своими величественными храмами. Мы собрали 10 лучших для первого посещения.

## 1. Большой дворец и Храм Изумрудного Будды

Главная достопримечательность Бангкока. Золотые ступы, мозаичные стены и священная статуя Будды высотой 66 см из цельного жадеита.

## 2. Ват Пхо — Храм лежащего Будды

Старейший храм Бангкока с 46-метровой статуей золотого лежащего Будды. Также здесь находится школа традиционного тайского массажа.

## 3. Ват Арун — Храм Рассвета

Потрясающая 79-метровая пагода на берегу реки Чао-Прайя, украшенная миллионами кусочков китайского фарфора.

## 4. Золотая гора (Ват Сакет)

Храм на вершине искусственного холма с панорамным видом на весь город. 344 ступени до вершины.

## 5. Мраморный храм (Ват Бенчамабопхит)

Построен из итальянского каррарского мрамора. Один из самых красивых храмов в современном тайском стиле.

## Практические советы

Посещение бесплатно или 50-200 бат. Закрытые плечи и колени обязательны. Лучшее время — раннее утро (7-9) или вечер (после 16:00).""",
                "photo_url": "https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?w=800",
                "read_time": 8,
                "country_tag": "Таиланд",
                "views_count": 0
            },
            {
                "title": "Как добраться до Великой Китайской стены из Пекина",
                "slug": "kak-dobratsya-do-kitayskoy-steny",
                "preview_text": "Удобные маршруты к самой известной достопримечательности Китая",
                "content": """Великая Китайская стена — must-see при посещении Пекина. Рассказываем про лучшие участки и способы добраться.

## Бадалин — классика

Самый популярный участок в 70 км от Пекина. Полностью отреставрирован, есть канатная дорога. Добраться можно на автобусе 877 от станции метро Deshengmen (1.5 часа).

## Мутяньюй — для эстетов

Менее людный и более живописный участок. Крутые подъёмы, но виды потрясающие. Туристические автобусы от площади Тяньаньмэнь (2 часа).

## Цзиньшаньлин — для хайкеров

Дикий участок для треккинга. Протяженность маршрута — 10 км. Нужна хорошая физическая форма. Организованные туры от 600 юаней.

## Практические советы

Приезжайте к открытию (7:00) чтобы избежать толп. Удобная обувь обязательна! Возьмите воду и снеки. Лучшее время — весна и осень.""",
                "photo_url": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800",
                "read_time": 12,
                "country_tag": "Китай",
                "views_count": 0
            },
            {
                "title": "Лучшие пляжи Пхукета: где отдыхать в 2025",
                "slug": "best-beaches-phuket",
                "preview_text": "Рейтинг пляжей от тихих бухт до вечеринок",
                "content": """Пхукет славится разнообразием пляжей. Каждый найдет свой идеальный.

## Патонг — для тусовок

Самый известный и людный пляж острова. Бары, клубы, магазины, водные развлечения. Подходит любителям активного отдыха и ночной жизни.

## Карон — для спокойного отдыха

Длинный (3 км) песчаный пляж с чистой водой. Меньше людей чем на Патонге, но вся инфраструктура есть. Отличные закаты.

## Ката Ной — для романтики

Маленькая уютная бухта с белым песком. Идеально для пар и семей. Хорошее место для снорклинга.

## Фридом Бич — дикий пляж

Добраться можно только на лодке. Никакой инфраструктуры, зато кристальная вода и никого. Берите еду и воду с собой.

## Советы

Лучший сезон: ноябрь-апрель. С мая по октябрь — сезон дождей, большие волны. Лежак + зонт = 200 бат/день.""",
                "photo_url": "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800",
                "read_time": 9,
                "country_tag": "Таиланд",
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
        
        # Создаём 105 азиатских туров с максимальным наполнением
        from tours_data_asia import get_tours_data
        tours_data = get_tours_data()
        print(f"📦 Загружено {len(tours_data)} туров из tours_data_asia.py")
        
        
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
        
        themes_pool = ["Храмы Азии", "Пляжи и острова", "Уличная еда", "История и культура", "Природа и водопады", "Ночная жизнь", "VIP-туры"]
        formats_pool = ["Индивидуальные туры", "Семейный тур", "Треккинг", "Всё включено", "Групповые туры"]
        
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
        
        # Создаём детальные отзывы для туров
        if len(tours) > 0:
            reviews_texts = [
                "Невероятная экскурсия! Гид рассказывал очень интересно, показал места которые сам бы никогда не нашёл. Особенно понравилась дегустация местной еды — всё свежее и вкусное. Группа была небольшая, все успели пообщаться с гидом и задать вопросы. Обязательно вернусь ещё раз!",
                "Лучшая экскурсия за всю поездку! Организация на высшем уровне, гид приехал вовремя, всё было как в описании. Увидели все главные достопримечательности, сделали кучу фотографий. Особенно запомнился закат — просто волшебство! Спасибо огромное, рекомендую всем друзьям!",
                "Очень насыщенная программа, но при этом не утомительная. Гид профессионал, чувствуется что любит свою работу. Рассказывал не только факты из истории, но и личные истории, это делало экскурсию живой. В группе было 6 человек — идеальное количество. Цена полностью оправдана качеством!",
                "Провели незабываемый день! Всё было организовано отлично: трансфер вовремя, входные билеты куплены заранее (не стояли в очередях), обед в аутентичном месте. Гид говорит на чистом русском, очень начитанный и интересный собеседник. Фотографии получились шикарные!",
                "Экскурсия превзошла все ожидания! Думали будет обычная обзорная, а получили настоящее погружение в культуру. Гид показал секретные места, где совсем нет туристов. Попробовали блюда которые не найдёшь в ресторанах. Это было приключение! Всем советую, не пожалеете.",
                "Отличное соотношение цены и качества. За такие деньги получили целый день интересной программы. Гид очень внимательный, подстраивался под наш темп. Ребёнку (8 лет) тоже было интересно, это важно. В конце дал рекомендации по другим местам города. Однозначно рекомендую!",
                "Брали эту экскурсию по отзывам и не прогадали! Всё прошло идеально. Особенно понравилось что группа маленькая, можно было задавать вопросы и не теряться. Гид очень харизматичный, рассказывает так что слушаешь затаив дыхание. Время пролетело незаметно. Уже хочу вернуться!",
                "Замечательная экскурсия для первого знакомства с городом. Увидели все must-see места, плюс гид показал пару скрытых жемчужин. Фотографии получились просто космос! Очень понравилось что можно было делать остановки когда захочется. Профессионализм и любовь к своему делу чувствуются сразу.",
                "Не первый раз путешествую, но такого внимательного гида встретила впервые. Учёл все наши пожелания, рассказывал с юмором и очень увлекательно. Даже муж, который обычно не любит экскурсии, был в восторге. Показал локации для лучших фото. Спасибо за отличный день!",
                "Экскурсия стоит каждого рубля! Очень информативно, но при этом не занудно. Гид умеет заинтересовать даже тех, кто далёк от истории. Маршрут продуман отлично — ничего лишнего, только самое интересное. В группе была отличная атмосфера. Буду рекомендовать всем знакомым!",
            ]
            
            names = ["Мария", "Андрей", "Дарья", "Игорь", "Елена", "Дмитрий", "Анна", "Сергей", "Ольга", "Алексей",
                     "Татьяна", "Михаил", "Наталья", "Владимир", "Екатерина", "Александр", "Ирина", "Павел", "Юлия", "Николай"]
            
            reviews_data = []
            
            # Для каждого тура создаём отзывы
            for i, tour in enumerate(tours):
                # Популярные туры (rating >= 4.8) - 5-10 отзывов
                # Обычные туры - 2-5 отзывов
                num_reviews = min(int(tour.reviews_count / 50), 10) if tour.rating >= 4.8 else min(int(tour.reviews_count / 100), 5)
                num_reviews = max(num_reviews, 2)  # Минимум 2 отзыва
                
                for j in range(num_reviews):
                    reviews_data.append({
                        "tour_id": tour.id,
                        "user_name": names[(i * num_reviews + j) % len(names)],
                        "user_photo": f"https://i.pravatar.cc/150?img={(i * 7 + j * 3) % 70}",
                        "rating": min(5.0, max(4.5, tour.rating - 0.1 + (j * 0.1))),
                        "text": reviews_texts[j % len(reviews_texts)],
                        "experience_count": (j % 5) + 1
                    })
            
            # Добавляем отзывы с проверкой дубликатов
            reviews_created = 0
            for review_data in reviews_data:
                # Проверяем есть ли уже отзыв от этого пользователя для этого тура
                existing = await session.execute(
                    sa.select(Review).where(
                        Review.tour_id == review_data['tour_id'],
                        Review.user_name == review_data['user_name'],
                        Review.text == review_data['text']
                    )
                )
                if not existing.scalar_one_or_none():
                    review = Review(**review_data)
                    session.add(review)
                    reviews_created += 1
            
            await session.commit()
            print(f"✅ Создано {reviews_created} новых отзывов (пропущено {len(reviews_data) - reviews_created} существующих)")
        
        # Создаём тестовые заявки с датами и привязкой к гиду
        from datetime import date, timedelta
        today = date.today()
        
        requests_data = [
            {
                "client_id": admin.id,
                "title": "Романтическая прогулка по Пхукету",
                "description": "Хотим увидеть красивые закаты, романтичные места, сделать фотосессию на фоне океана",
                "duration_hours": 2,
                "participants_count": 2,
                "budget": 5000.0,
                "location": "Пхукет",
                "preferred_date": today + timedelta(days=3),
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
                "preferred_date": today + timedelta(days=7),
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
                "preferred_date": today + timedelta(days=10),
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
                "preferred_date": today + timedelta(days=14),
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
                "preferred_date": today + timedelta(days=5),
                "status": "pending"
            },
            {
                "client_id": admin.id,
                "title": "Трекинг в джунглях Краби",
                "description": "Поход по джунглях с посещением водопадов, купание в горячих источниках",
                "duration_hours": 5,
                "participants_count": 4,
                "budget": 12000.0,
                "location": "Краби",
                "preferred_date": today + timedelta(days=12),
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
