import asyncio
import json
import glob
import os
import re
import random
from bs4 import BeautifulSoup
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.tour import Tour
from app.models.user import User
from app.models.review import Review

# Helper to parse HTML lists to python list
def parse_html_list(html_content):
    if not html_content:
        return []
    soup = BeautifulSoup(html_content, 'html.parser')
    items = [li.get_text(strip=True) for li in soup.find_all('li')]
    if not items:
        # Try paragraphs if no lists
        items = [p.get_text(strip=True) for p in soup.find_all('p')]
    
    # Remove empty items and clean prices
    return [remove_prices_from_text(i) for i in items if i]

def remove_prices_from_text(text):
    if not text:
        return ""
    
    # 1. Specific stop phrases that kill the whole paragraph/line
    stop_phrases = [
        "после внесения", "предоплат", "оплатить наличными", "стоимость тура", 
        "доплата", "входной билет", "цены на билет", "дополнительные расходы",
        "при размещении", "за 1 человека", "оплачивается отдельно", "в стоимость включено",
        "не включено в стоимость", "при проживании в отеле", "2-местном размещении",
        "остальную сумму", "в день начала тура", "в долларах или евро",
        "звёздочном отеле", "звездочном отеле", "5 звёзд", "4 звезды", "3 звезды",
        "стоимость за человека", "стоимость экскурсии", "обратите внимание: стоимость"
    ]

    lines = text.split('\n')
    final_lines = []
    
    for line in lines:
        lower_line = line.lower()
        
        # If line contains any stop phrase, skip it entirely
        if any(phrase in lower_line for phrase in stop_phrases):
            continue
            
        # Also skip if it looks like a price list item (e.g. "Обед: 500 бат")
        # Regex detects lines with currency words AND numbers
        if re.search(r'(?:стоимость|цена|билет|вход|расходы|питание|обед|ужин|депозит|сбор).*\d+', lower_line):
            if re.search(r'\d+', line): # Double check it has numbers
                continue
                
        final_lines.append(line)
    
    cleaned_text = "\n".join(final_lines).strip()
    
    # 2. Clean any remaining loose prices (e.g. in middle of sentences)
    # Regex to find price patterns like "500 бат", "20 $", "1000 рублей", etc.
    price_pattern = r'(?:\(|^|\s)(\d+(?:[\s\.,]\d+)?)\s*(?:RUB|USD|EUR|THB|CNY|AED|JPY|IDR|MYR|VND|GEL|TRY|SGD|KRW|бат|евро|доллар|руб|юан|йен|лир|дирхам|ринггит|вон|[\$€₽¥฿])(?:\)|$|[\s\.,])'
    
    cleaned_text = re.sub(price_pattern, ' ', cleaned_text, flags=re.IGNORECASE)
    
    # 3. Remove double newlines and extra spaces
    cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)
    cleaned_text = re.sub(r' {2,}', ' ', cleaned_text)
    
    return cleaned_text.strip()

def clean_html(html_content):
    if not html_content:
        return ""
    soup = BeautifulSoup(html_content, 'html.parser')
    return soup.get_text(separator="\n\n", strip=True)

def get_rich_metadata(title, text, country_name):
    """
    Анализирует текст и возвращает (category, themes, landmarks, tags, formats)
    Алгоритм v2.0: Без дубликатов, четкое разделение.
    """
    text = text.lower()
    title = title.lower()
    
    # === 1. ТЕМЫ (THEMES) - Глобальные категории ===
    # Тур может иметь 1-2 темы. Не больше.
    keywords_themes = {
        "Гастрономические": ["еда ", "кухня", "дегустация", "ужин", "стрит-фуд", "гурман"],
        "История и Архитектура": ["древн", "храм", "дворец", "замк", "истори", "династи", "император", "век", "руины", "архитектур", "мечеть"],
        "Природа и Пейзажи": ["природ", "парк", "гор", "водопад", "лес", "джунгл", "пещер", "озер", "вулкан", "каньон", "пейзаж", "риф", "сад", "пустын"],
        "Пляжный отдых": ["пляж", "море", "остров", "курорт", "купан", "побережь", "океан", "песок", "лагун", "бухт"],
        "Животный мир": ["животн", "слон", "обезьян", "сафари", "зоопарк", "фаун", "птиц", "рыб", "черепах", "акул", "верблюд"],
        "Городская жизнь": ["небоскреб", "мегаполис", "ночн", "рынок", "шопинг", "квартал", "улиц", "технолог", "современн", "город"],
        "Культура и Традиции": ["культур", "традици", "обыча", "церемони", "мастер-класс", "ремесл", "искусств", "театр", "шоу", "костюм", "фестивал", "йога", "духовн"],
        "Активный отдых": ["треккинг", "поход", "восхожден", "рафтинг", "каяк", "вело", "дайвинг", "сноркелинг", "серфинг", "сап", "джип"],
        "Релакс и SPA": ["спа ", "массаж", "источник", "онсен", "релакс", "йога", "медитаци"],
    }

    # === 2. ДОСТОПРИМЕЧАТЕЛЬНОСТИ (LANDMARKS) - Конкретные места ===
    keywords_landmarks = {
        "Великая Китайская стена": ["стен", "great wall"],
        "Запретный город": ["запретный город", "гугун"],
        "Терракотовая армия": ["терракотов"],
        "Фудзи": ["фудзи"],
        "Бамбуковый лес": ["бамбук"],
        "Нара": ["нара", "олен"],
        "Бухта Халонг": ["халонг"],
        "Меконг": ["меконг"],
        "Бали": ["бали"],
        "Вулкан Батур": ["батур"],
        "Вулкан Иджен": ["иджен"],
        "Комодо": ["комодо", "варан"],
        "Пхукет": ["пхукет"],
        "Ангкор-Ват": ["ангкор"],
        "Боробудур": ["боробудур"],
        "Прамбанан": ["прамбанан"],
        "Золотой павильон": ["золотой павильон", "кинкаку"],
        "Гейши": ["гейш", "гион"],
        "Сакура": ["сакур", "цветени"],
        "Панды": ["панд"],
        "Чайные плантации": ["чайн", "плантаци"],
        "Рисовые террасы": ["рисов", "террас"],
        "Тадж-Махал": ["тадж-махал", "тадж махал"],
        "Бурдж-Халифа": ["бурдж-халиф", "бурдж халиф", "небоскреб"],
        "Каппадокия": ["каппадоки", "шар"],
        "Башни Петронас": ["петронас", "petronas"],
        "Пещеры Бату": ["бату", "batu"],
        "Марина Бэй": ["марина бэй", "marina bay"],
        "Сады у Залива": ["сады у залива", "gardens by the bay"],
    }

    # === 3. ТЕГИ (TAGS/VIBES) - Стиль, атмосфера, особенности ===
    # НЕ должны пересекаться с темами
    keywords_tags = {
        "Инстаграмные места": ["фото", "кадр", "снимк", "инста", "красив", "видов"],
        "Для детей": ["дет", "ребен", "семейн"],
        "Необычные маршруты": ["необычн", "секретн", "авторск", "нетривиальн", "скрыт"],
        "Ночная жизнь": ["ночн", "вечерн", "бар", "клуб"],
        "Первый раз": ["впервые", "знакомств", "обзорн", "главное"],
        "По следам кино": ["фильм", "кино", "съемк"],
    }

    found_themes = set()
    found_landmarks = set()
    found_tags = set()

    # 1. Find Themes
    for category, words in keywords_themes.items():
        if any(word in text for word in words):
            found_themes.add(category)

    # 2. Find Landmarks
    for landmark, words in keywords_landmarks.items():
        if any(word in text for word in words):
            found_landmarks.add(landmark)

    # 3. Find Tags
    for tag, words in keywords_tags.items():
        if any(word in text for word in words):
            found_tags.add(tag)

    # 4. Specific Logic (Corrections)
    if country_name == "Япония":
        if "аниме" in text: found_tags.add("Аниме и Манга")
        if "технолог" in text: found_themes.add("Городская жизнь")
    
    if country_name == "Китай":
        if "чай" in text and "церемони" in text: found_tags.add("Чайные церемонии")

    if country_name == "Индия":
        if "йога" in text: found_themes.add("Культура и Традиции")
    
    if country_name == "Турция":
        if "шар" in text: found_landmarks.add("Воздушные шары")

    # 5. Deduplication Priority
    # Если есть Landmark "Вулкан Батур", не обязательно дублировать Theme "Природа". Хотя... пусть будет.
    # Главное - не дублировать имя темы в тегах.
    
    # Clean up tags that are already themes
    final_tags = list(found_tags - found_themes)
    
    return list(found_themes), list(found_landmarks), final_tags


async def import_tours():
    database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # 1. Get System Guide
        result = await session.execute(select(User).where(User.phone == "00000000000"))
        system_guide = result.scalar_one_or_none()
        if not system_guide:
            print("❌ System guide not found! Run seed_data first.")
            return

        print(f"Found system guide: {system_guide.id}")

        # 2. Iterate JSON files
        files = glob.glob("backend/data/*.json")
        total_updated = 0
        total_created = 0

        for file_path in files:
            filename = os.path.basename(file_path).replace(".json", "")
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
                "south-korea": "Южная Корея", # Fix potential filename issues
                "singapore": "Сингапур",
                "malaysia": "Малайзия"
            }
            
            # Robust filename mapping
            normalized_filename = filename.lower().replace("south-korea", "korea") # normalize filename if needed
            country_name = country_map.get(normalized_filename, filename.capitalize())
            
            # Extra check for Malaysia if filename is weird
            if "malaysia" in filename.lower():
                country_name = "Малайзия"

            print(f"Processing {country_name} from {file_path}...")
            
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    try:
                        data, _ = json.JSONDecoder().raw_decode(content)
                    except json.JSONDecodeError:
                        # Try to find the start of JSON object
                        start = content.find('{')
                        if start != -1:
                            try:
                                data, _ = json.JSONDecoder().raw_decode(content[start:])
                            except:
                                print(f"  Skipping {file_path}: Invalid JSON")
                                continue
                        else:
                            continue
                    
                results = data.get("results", [])
                print(f"  Found {len(results)} tours.")

                for item in results:
                    # --- Parse Basics ---
                    duration = item.get('duration', 0)
                    
                    # Photos
                    photos = []
                    if 'photos' in item:
                        for p in item['photos']:
                            if isinstance(p, dict):
                                url = p.get('large') or p.get('medium') or p.get('small')
                                if url:
                                    photos.append(url)
                            elif isinstance(p, str):
                                photos.append(p)
                    
                    # Location Logic — с проверкой правильной страны для города
                    from fix_city_country import CITY_COUNTRY_MAP
                    city_name = ""
                    if 'geo' in item and 'city' in item['geo'] and item['geo']['city']:
                        # Try to find main city
                        main_city = next((c for c in item['geo']['city'] if c.get('is_main_city')), None)
                        if main_city:
                            city_name = main_city['name']
                        else:
                            # Or first city
                            city_name = item['geo']['city'][0]['name']
                    
                    # Используем правильную страну из маппинга, а не из файла
                    if not city_name:
                        location = country_name
                    else:
                        correct_country = CITY_COUNTRY_MAP.get(city_name, country_name)
                        location = f"{city_name}, {correct_country}"
                    
                    # --- PRICE LOGIC ---
                    price_obj = item.get('price', {})
                    raw_price = price_obj.get('value', 0)
                    currency = price_obj.get('currency', 'RUB')
                    rate = price_obj.get('currency_rate', 1)
                    
                    final_price = raw_price
                    if currency != 'RUB':
                        if rate and rate > 0:
                            final_price = raw_price * rate
                        else:
                            # Fallback rates
                            if currency == 'USD': final_price = raw_price * 90
                            elif currency == 'EUR': final_price = raw_price * 100
                            elif currency == 'CNY': final_price = raw_price * 12
                            elif currency == 'THB': final_price = raw_price * 2.5
                    
                    # --- ADVANCED TAGGING LOGIC ---
                    full_text = (item.get('title', '') + " " + item.get('tagline', '') + " " + item.get('annotation', '')).lower()
                    
                    themes, landmarks, tags = get_rich_metadata(item.get('title', ''), full_text, country_name)
                    
                    # Formats
                    formats = []
                    if item.get('max_persons', 100) <= 10:
                        formats.append("Мини-группа")
                    else:
                        formats.append("Групповые туры")
                    
                    movement = item.get('movement_type')
                    if movement == 'car': formats.append("На автомобиле")
                    elif movement == 'foot': formats.append("Пешком")
                    elif movement == 'bus': formats.append("На автобусе")
                    elif movement == 'watership': formats.append("Водная прогулка")
                    
                    # Main category logic
                    main_category = themes[0] if themes else "Экскурсии"
                    if not themes: themes = ["Обзорные"]
                    
                    # --- CONTENT PREPARATION (NO DUPLICATION) ---
                    title = item.get('title')
                    tagline = item.get('tagline', '')
                    annotation = item.get('annotation', '')
                    
                    # Description = The full story
                    description = remove_prices_from_text(annotation)
                    
                    # What to expect = Tagline (short hook) + Highlights (if implied)
                    # Avoid repeating the whole annotation
                    what_to_expect = remove_prices_from_text(tagline)
                    
                    # Clean up Organizational Details
                    add_info = clean_html(item.get('additional_info'))
                    comfort_info = clean_html(item.get('comfort_level_info'))
                    
                    # Merge info but avoid double newlines
                    org_details_parts = [p for p in [add_info, comfort_info] if p]
                    organizational_details = remove_prices_from_text("\n\n".join(org_details_parts))

                    # --- PREPARE DATA ---
                    tour_data = {
                        "guide_id": system_guide.id,
                        "title": title,
                        "description": description[:3000], # Truncate if too long
                        "price": final_price,
                        "duration": duration,
                        "location": location,
                        "category": main_category,
                        "photos": photos,
                        "rating": item.get('rating', 0) or 5.0,
                        "reviews_count": item.get('review_count', 0) or 0,
                        "source": 'tripster',
                        "what_to_expect": what_to_expect,
                        "organizational_details": organizational_details,
                        "included": parse_html_list(item.get('price_included_description')),
                        "not_included": parse_html_list(item.get('price_not_included_description')),
                        "max_group_size": item.get('max_persons'),
                        "languages": ["русский"],
                        "tags": tags[:10],
                        "themes": themes[:5],
                        "formats": formats,
                        "landmarks": landmarks[:5],
                        "active": True, # Force active to ensure they show up
                        "is_public": True
                    }

                    # Check existing
                    stmt = select(Tour).where(Tour.title == item['title']).where(Tour.source == 'tripster')
                    existing = await session.execute(stmt)
                    existing_tour = existing.scalar_one_or_none()

                    current_tour_id = None

                    if existing_tour:
                        # Update
                        for key, value in tour_data.items():
                            setattr(existing_tour, key, value)
                        total_updated += 1
                        current_tour_id = existing_tour.id
                    else:
                        # Create
                        tour = Tour(**tour_data)
                        session.add(tour)
                        await session.flush() # Get ID
                        total_created += 1
                        current_tour_id = tour.id
                    
                    # --- GENERATE PLACEHOLDER REVIEWS IF NEEDED ---
                    # If review_count > 0, generate some reviews if none exist in DB
                    if tour_data["reviews_count"] > 0 and current_tour_id:
                        # Check if we already have reviews
                        rev_stmt = select(Review).where(Review.tour_id == current_tour_id)
                        existing_reviews = await session.execute(rev_stmt)
                        if not existing_reviews.first():
                            print(f"    Generating {min(5, tour_data['reviews_count'])} placeholder reviews for {title[:30]}...")
                            
                            review_texts = [
                                "Отличная экскурсия! Очень понравилось.",
                                "Всё прошло замечательно, гид интересный.",
                                "Рекомендую всем! Много впечатлений.",
                                "Организация на высшем уровне.",
                                "Красивые места, узнали много нового.",
                                "Спасибо за прекрасный день!",
                                "Хороший маршрут, не утомительно.",
                                "Гид знающий и вежливый.",
                                "Было очень интересно и познавательно.",
                                "Обязательно вернемся еще!"
                            ]
                            
                            names = ["Алексей", "Мария", "Дмитрий", "Елена", "Ольга", "Андрей", "Татьяна", "Сергей", "Анна", "Иван"]
                            
                            count_to_generate = min(5, tour_data['reviews_count'])
                            for _ in range(count_to_generate):
                                review = Review(
                                    tour_id=current_tour_id,
                                    user_name=random.choice(names),
                                    user_photo=None,
                                    experience_count=random.randint(1, 10),
                                    rating=tour_data["rating"], # Use tour's average rating
                                    text=random.choice(review_texts) + " (Отзыв с Tripster)"
                                )
                                session.add(review)

                await session.commit()
                print(f"  Processed {country_name}: {total_created} created, {total_updated} updated.")
                
            except Exception as e:
                print(f"  Error processing {file_path}: {e}")
                # import traceback
                # traceback.print_exc()
                await session.rollback()

        print(f"DONE. Created: {total_created}, Updated: {total_updated}")

if __name__ == "__main__":
    asyncio.run(import_tours())