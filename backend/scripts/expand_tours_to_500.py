"""
Расширение каталога до 500+ туров путем создания вариаций существующих туров
"""
import asyncio
import sys
import os
import random

# Добавляем пути для импорта
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.tour import Tour
from app.models.review import Review
from app.models.user import User

DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


# Варианты префиксов для создания новых туров
TIME_PREFIXES = ["Утренний", "Вечерний", "Ночной", "Дневной", "Рассветный", "Закатный"]
STYLE_PREFIXES = ["VIP", "Эксклюзивный", "Премиум", "Экспресс", "Расширенный", "Полный день"]
THEME_PREFIXES = ["Романтический", "Семейный", "Активный", "Релакс", "Фото-тур", "Инстаграмный"]
GROUP_PREFIXES = ["Групповой", "Индивидуальный", "Приватный", "Для двоих", "Для компании"]

# Модификаторы для описаний
DESCRIPTION_ADDITIONS = [
    "С профессиональным фотографом и 50+ обработанных фото",
    "Включая традиционный обед в аутентичном ресторане",
    "С посещением скрытых локаций, куда не водят туристов",
    "Включая мастер-класс от местного мастера",
    "С трансфером на премиум-автомобиле",
    "Малая группа до 4 человек для комфорта",
    "С дегустацией местных деликатесов",
    "Включая встречу рассвета/заката в особом месте",
]


async def generate_tour_variations():
    """Генерирует вариации существующих туров"""
    async with async_session() as session:
        result = await session.execute(select(User).where(User.phone == "00000000000"))
        system_guide = result.scalar_one_or_none()
        
        if not system_guide:
            print("❌ Системный гид не найден!")
            return
        
        # Получаем все существующие туры
        result = await session.execute(select(Tour))
        existing_tours = result.scalars().all()
        
        print(f"📊 Найдено {len(existing_tours)} существующих туров")
        print(f"🎯 Цель: создать {500 - len(existing_tours)} новых вариаций\n")
        
        if len(existing_tours) >= 500:
            print("✅ Каталог уже содержит 500+ туров!")
            return
        
        variations_needed = 500 - len(existing_tours)
        created = 0
        
        # Создаем вариации
        for base_tour in existing_tours:
            if created >= variations_needed:
                break
            
            # Создаем 5-6 вариаций каждого тура
            num_variations = min(6, (variations_needed - created) // len(existing_tours) + 1)
            
            for i in range(num_variations):
                if created >= variations_needed:
                    break
                
                # Выбираем модификаторы
                prefix = random.choice(TIME_PREFIXES + STYLE_PREFIXES + THEME_PREFIXES + GROUP_PREFIXES)
                addition = random.choice(DESCRIPTION_ADDITIONS)
                
                # Создаем новый тур на основе существующего
                new_title = f"{prefix} {base_tour.title.lower()}"
                new_description = f"{base_tour.description} {addition}"
                
                # Небольшая вариация цены (+/-20%)
                price_mod = random.uniform(0.8, 1.2)
                new_price = round(base_tour.price * price_mod, -2)  # Округляем до сотен
                
                # Вариация длительности (+/-1 час)
                duration_mod = random.choice([-1, 0, 0, 1])
                new_duration = max(1, base_tour.duration + duration_mod)
                
                # Вариация рейтинга
                rating_mod = random.uniform(-0.2, 0.1)
                new_rating = round(min(5.0, max(4.5, base_tour.rating + rating_mod)), 1)
                
                # Создаем новый тур
                new_tour = Tour(
                    guide_id=system_guide.id,
                    title=new_title,
                    description=new_description,
                    price=new_price,
                    duration=new_duration,
                    location=base_tour.location,
                    category=base_tour.category,
                    photos=base_tour.photos if base_tour.photos else [],
                    rating=new_rating,
                    reviews_count=0,  # Всегда 0, реальное количество считается из таблицы reviews
                    what_to_expect=base_tour.what_to_expect,
                    organizational_details=base_tour.organizational_details,
                    included=base_tour.included if base_tour.included else [],
                    not_included=base_tour.not_included if base_tour.not_included else [],
                    meeting_point=base_tour.meeting_point,
                    languages=base_tour.languages if base_tour.languages else ["Русский"],
                    max_group_size=base_tour.max_group_size or 8,
                    min_age=base_tour.min_age or 0,
                    difficulty_level=base_tour.difficulty_level or "Лёгкая",
                    landmarks=base_tour.landmarks if base_tour.landmarks else [],
                    tags=base_tour.tags if base_tour.tags else [],
                    themes=base_tour.themes if base_tour.themes else [],
                    formats=base_tour.formats if base_tour.formats else [],
                    seo_title=f"{new_title} | Экскурсия с гидом",
                    seo_description=new_description[:160],
                    long_description=base_tour.long_description,
                    is_public=True,
                    active=True,
                    total_bookings=random.randint(50, 200),
                    views_count=random.randint(200, 800)
                )
                
                session.add(new_tour)
                await session.flush()
                
                # Создаем отзывы
                num_reviews = random.randint(8, 12)
                
                review_templates = [
                    {"text": "Отличная экскурсия! Всё понравилось, гид профессионал. Рекомендую!", "rating": 5.0},
                    {"text": "Замечательная программа. Увидели много интересного. Спасибо!", "rating": 4.8},
                    {"text": "Очень понравилось! Организация на высоте, всё четко и по плану.", "rating": 4.9},
                    {"text": "Хорошая экскурсия за свои деньги. Гид знающий, группа небольшая.", "rating": 4.7},
                    {"text": "Превосходно! Лучшая экскурсия за всю поездку. Браво!", "rating": 5.0},
                ]
                
                names = ["Александр", "Мария", "Дмитрий", "Анна", "Сергей", "Елена"]
                
                for j in range(num_reviews):
                    template = review_templates[j % len(review_templates)]
                    review = Review(
                        tour_id=new_tour.id,
                        user_name=names[j % len(names)],
                        user_photo=f"https://i.pravatar.cc/150?img={(created * 7 + j) % 70}",
                        rating=template["rating"],
                        text=template["text"],
                        experience_count=(j % 5) + 1
                    )
                session.add(review)
            
            # Обновляем reviews_count
            new_tour.reviews_count = num_reviews
            
            created += 1
            
            if created % 50 == 0:
                print(f"✅ Создано {created}/{variations_needed} вариаций...")
        
        await session.commit()
        print(f"\n🎉 Создано {created} новых вариаций туров!")
        print(f"📊 Всего туров в каталоге: {len(existing_tours) + created}")


if __name__ == "__main__":
    print("=" * 80)
    print("  РАСШИРЕНИЕ КАТАЛОГА ДО 500+ ТУРОВ")
    print("=" * 80)
    print()
    asyncio.run(generate_tour_variations())

