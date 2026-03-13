"""
Скрипт для полного рерайта туров через OpenAI ChatGPT API.

Берёт оригинальные данные с Tripster JSON файлов и отправляет в ChatGPT
для рерайта под нашу структуру. Результат сохраняется в базу данных.

Использование:
1. Установить OPENAI_API_KEY в переменные окружения
2. Запустить: python backend/scripts/rewrite_tours_gpt.py
"""

import asyncio
import json
import glob
import os
import sys
import time
from typing import Optional, Dict, Any, List

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import openai
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.tour import Tour
from app.models.user import User
from app.models.review import Review

# OpenAI API key
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')

# Промпт для ChatGPT
REWRITE_PROMPT = """Ты — профессиональный копирайтер туристического агентства. Твоя задача — переписать описание экскурсии, сделав его уникальным, привлекательным и информативным.

ВАЖНЫЕ ПРАВИЛА:
1. НЕ упоминай цены, стоимость, доллары, евро, рубли, баты и любые денежные суммы
2. НЕ упоминай условия оплаты, предоплаты, наличные
3. НЕ упоминай звёздность отелей (3 звезды, 4 звезды, 5 звёзд)
4. НЕ копируй текст дословно — сделай полный рерайт
5. Пиши живым, эмоциональным языком, но без излишней восторженности
6. Сохрани все факты, локации и достопримечательности
7. Если есть псевдо-заголовки (Питание., Транспорт., Дети.), объедини их с текстом в единый абзац

ВХОДНЫЕ ДАННЫЕ ЭКСКУРСИИ:
{tour_data}

Верни ответ СТРОГО в формате JSON (без markdown, без ```json):
{{
    "title": "Название экскурсии (можно немного улучшить, но сохранить суть)",
    "description": "Полное описание экскурсии (2-4 абзаца, живой текст)",
    "what_to_expect": "Что вас ожидает (краткое, 1-2 предложения, интригующее)",
    "organizational_details": "Организационные детали (без цен! только практическая информация: что взять, как одеться, уровень сложности)",
    "included": ["Что включено - пункт 1", "Что включено - пункт 2", "..."],
    "not_included": ["Что не включено - пункт 1", "Что не включено - пункт 2", "..."],
    "meeting_point": "Место встречи (если известно, иначе null)",
    "tags": ["тег1", "тег2", "тег3"],
    "themes": ["тема1", "тема2"],
    "landmarks": ["достопримечательность1", "достопримечательность2"],
    "reviews": [
        {{"name": "Имя", "rating": 5, "text": "Текст отзыва (если нет отзывов, придумай 3-5 реалистичных)"}},
        ...
    ]
}}

ВАЖНО: Ответ должен быть валидным JSON без лишних символов!"""


def extract_tour_data_from_tripster(item: Dict[str, Any], country_name: str) -> Dict[str, Any]:
    """Извлекает данные тура из Tripster JSON для отправки в GPT"""
    from fix_city_country import CITY_COUNTRY_MAP
    
    # Город
    city_name = ""
    if 'geo' in item and 'city' in item['geo'] and item['geo']['city']:
        main_city = next((c for c in item['geo']['city'] if c.get('is_main_city')), None)
        if main_city:
            city_name = main_city['name']
        elif item['geo']['city']:
            city_name = item['geo']['city'][0]['name']
    
    # Используем правильную страну из маппинга
    if city_name:
        correct_country = CITY_COUNTRY_MAP.get(city_name, country_name)
        location = f"{city_name}, {correct_country}"
    else:
        location = country_name
    
    # Собираем все текстовые данные
    return {
        "title": item.get('title', ''),
        "tagline": item.get('tagline', ''),
        "annotation": item.get('annotation', ''),
        "additional_info": item.get('additional_info', ''),
        "comfort_level_info": item.get('comfort_level_info', ''),
        "price_included": item.get('price_included_description', ''),
        "price_not_included": item.get('price_not_included_description', ''),
        "location": location,
        "country": country_name,
        "city": city_name,
        "duration_hours": item.get('duration', 0),
        "max_persons": item.get('max_persons', 10),
        "rating": item.get('rating', 5.0),
        "review_count": item.get('review_count', 0),
        "movement_type": item.get('movement_type', ''),
    }


async def call_chatgpt(tour_data: Dict[str, Any], client: openai.AsyncOpenAI) -> Optional[Dict[str, Any]]:
    """Отправляет данные тура в ChatGPT и получает рерайт"""
    
    prompt = REWRITE_PROMPT.format(tour_data=json.dumps(tour_data, ensure_ascii=False, indent=2))
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",  # Или gpt-4 для лучшего качества
            messages=[
                {"role": "system", "content": "Ты профессиональный копирайтер. Отвечай только валидным JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        content = response.choices[0].message.content.strip()
        
        # Убираем возможные markdown обёртки
        if content.startswith('```json'):
            content = content[7:]
        if content.startswith('```'):
            content = content[3:]
        if content.endswith('```'):
            content = content[:-3]
        content = content.strip()
        
        # Парсим JSON
        result = json.loads(content)
        return result
        
    except json.JSONDecodeError as e:
        print(f"  ❌ JSON parse error: {e}")
        print(f"  Raw content: {content[:500]}...")
        return None
    except Exception as e:
        print(f"  ❌ API error: {e}")
        return None


async def rewrite_all_tours():
    """Основная функция рерайта всех туров"""
    
    if not OPENAI_API_KEY:
        print("❌ OPENAI_API_KEY not set!")
        print("Set it with: $env:OPENAI_API_KEY='sk-...'")
        return
    
    # Инициализация OpenAI клиента
    client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)
    
    # Подключение к БД
    db_url = settings.DATABASE_URL
    if "postgresql://" in db_url and "+asyncpg" not in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
    
    engine = create_async_engine(db_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Получаем system guide
        result = await session.execute(select(User).where(User.phone == "00000000000"))
        system_guide = result.scalar_one_or_none()
        if not system_guide:
            print("❌ System guide not found!")
            return
        
        print(f"✅ Found system guide: {system_guide.id}")
        
        # Читаем все JSON файлы с Tripster данными
        files = glob.glob("backend/data/*.json")
        
        country_map = {
            "thailand": "Таиланд",
            "vietnam": "Вьетнам",
            "china": "Китай",
            "japan": "Япония",
            "indonesia": "Индонезия",
            "india": "Индия",
            "turkey": "Турция",
            "uae": "ОАЭ",
            "korea": "Южная Корея",
            "singapore": "Сингапур",
            "malaysia": "Малайзия"
        }
        
        total_processed = 0
        total_success = 0
        total_errors = 0
        
        for file_path in files:
            filename = os.path.basename(file_path).replace(".json", "").lower()
            country_name = country_map.get(filename, filename.capitalize())
            
            print(f"\n📁 Processing {country_name} from {file_path}...")
            
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    try:
                        data, _ = json.JSONDecoder().raw_decode(content)
                    except json.JSONDecodeError:
                        start = content.find('{')
                        if start != -1:
                            data, _ = json.JSONDecoder().raw_decode(content[start:])
                        else:
                            print(f"  ⚠️ Skipping {file_path}: Invalid JSON")
                            continue
                
                results = data.get("results", [])
                print(f"  Found {len(results)} tours")
                
                for i, item in enumerate(results):
                    total_processed += 1
                    title = item.get('title', 'Unknown')[:50]
                    print(f"\n  [{i+1}/{len(results)}] Processing: {title}...")
                    
                    # Извлекаем данные для GPT
                    tour_data = extract_tour_data_from_tripster(item, country_name)
                    
                    # Отправляем в ChatGPT
                    rewritten = await call_chatgpt(tour_data, client)
                    
                    if not rewritten:
                        total_errors += 1
                        print(f"  ⚠️ Failed to rewrite, skipping...")
                        continue
                    
                    # Подготавливаем данные для БД
                    # Фото
                    photos = []
                    if 'photos' in item:
                        for p in item['photos']:
                            if isinstance(p, dict):
                                url = p.get('large') or p.get('medium') or p.get('small')
                                if url:
                                    photos.append(url)
                            elif isinstance(p, str):
                                photos.append(p)
                    
                    # Цена
                    price_obj = item.get('price', {})
                    raw_price = price_obj.get('value', 0)
                    currency = price_obj.get('currency', 'RUB')
                    rate = price_obj.get('currency_rate', 1)
                    
                    final_price = raw_price
                    if currency != 'RUB' and rate and rate > 0:
                        final_price = raw_price * rate
                    
                    # Город
                    city_name = tour_data.get('city', '')
                    location = f"{city_name}, {country_name}" if city_name else country_name
                    
                    # Форматы
                    formats = []
                    if item.get('max_persons', 100) <= 10:
                        formats.append("Мини-группа")
                    else:
                        formats.append("Групповые туры")
                    
                    movement = item.get('movement_type')
                    if movement == 'car': formats.append("На автомобиле")
                    elif movement == 'foot': formats.append("Пешком")
                    elif movement == 'bus': formats.append("На автобусе")
                    
                    # Собираем данные тура
                    tour_db_data = {
                        "guide_id": system_guide.id,
                        "title": rewritten.get('title', item.get('title')),
                        "description": rewritten.get('description', '')[:3000],
                        "price": final_price,
                        "duration": item.get('duration', 0),
                        "location": location,
                        "category": rewritten.get('themes', ['Экскурсии'])[0] if rewritten.get('themes') else "Экскурсии",
                        "photos": photos,
                        "rating": item.get('rating', 5.0) or 5.0,
                        "reviews_count": len(rewritten.get('reviews', [])),
                        "source": 'tripster',
                        "what_to_expect": rewritten.get('what_to_expect', ''),
                        "organizational_details": rewritten.get('organizational_details', ''),
                        "included": rewritten.get('included', []),
                        "not_included": rewritten.get('not_included', []),
                        "meeting_point": rewritten.get('meeting_point'),
                        "max_group_size": item.get('max_persons'),
                        "languages": ["русский"],
                        "tags": rewritten.get('tags', [])[:10],
                        "themes": rewritten.get('themes', [])[:5],
                        "formats": formats,
                        "landmarks": rewritten.get('landmarks', [])[:5],
                        "active": True,
                        "is_public": True
                    }
                    
                    # Ищем существующий тур
                    stmt = select(Tour).where(Tour.title == item['title']).where(Tour.source == 'tripster')
                    existing = await session.execute(stmt)
                    existing_tour = existing.scalar_one_or_none()
                    
                    if existing_tour:
                        # Обновляем
                        for key, value in tour_db_data.items():
                            setattr(existing_tour, key, value)
                        tour_id = existing_tour.id
                        print(f"  ✅ Updated tour ID {tour_id}")
                    else:
                        # Создаём новый
                        tour = Tour(**tour_db_data)
                        session.add(tour)
                        await session.flush()
                        tour_id = tour.id
                        print(f"  ✅ Created tour ID {tour_id}")
                    
                    # Добавляем отзывы
                    reviews_data = rewritten.get('reviews', [])
                    if reviews_data:
                        # Удаляем старые отзывы
                        old_reviews = await session.execute(
                            select(Review).where(Review.tour_id == tour_id)
                        )
                        for old_review in old_reviews.scalars().all():
                            await session.delete(old_review)
                        
                        # Добавляем новые
                        for rev in reviews_data[:5]:  # Максимум 5 отзывов
                            review = Review(
                                tour_id=tour_id,
                                user_name=rev.get('name', 'Гость'),
                                rating=rev.get('rating', 5),
                                text=rev.get('text', 'Отличная экскурсия!')
                            )
                            session.add(review)
                    
                    await session.commit()
                    total_success += 1
                    
                    # Пауза чтобы не превысить rate limit
                    await asyncio.sleep(1)
                    
            except Exception as e:
                print(f"  ❌ Error processing {file_path}: {e}")
                import traceback
                traceback.print_exc()
                await session.rollback()
        
        print(f"\n{'='*50}")
        print(f"✅ DONE!")
        print(f"   Total processed: {total_processed}")
        print(f"   Success: {total_success}")
        print(f"   Errors: {total_errors}")


if __name__ == "__main__":
    asyncio.run(rewrite_all_tours())



