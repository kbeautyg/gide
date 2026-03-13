"""
Tour Rewriter Pro - Рерайт туров с Tripster через ChatGPT
С автоматическим скачиванием фоток и загрузкой на Inturex/Supabase
+ Генерация статей для журнала

Запуск: python app.py
"""

from flask import Flask, render_template, jsonify, request, send_from_directory, Response
import json
import glob
import os
import asyncio
import threading
from datetime import datetime
import openai
import requests
import hashlib
from urllib.parse import urlparse
import time
import shutil
import re
import base64
from collections import deque

# Импортируем модуль генерации статей
try:
    from article_generator import (
        generate_articles_for_tour, 
        convert_tour_images_to_webp,
        upload_article,
        ARTICLE_TYPES
    )
    ARTICLES_ENABLED = True
except ImportError:
    ARTICLES_ENABLED = False
    print("WARNING: article_generator not found, articles feature disabled")

app = Flask(__name__)

# Очередь логов для UI
log_queue = deque(maxlen=100)

# ============ ПУТИ И НАСТРОЙКИ ============

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TOURS_DIR = os.path.join(BASE_DIR, "tours")  # Главная папка с турами
SETTINGS_FILE = os.path.join(BASE_DIR, "settings.json")
PROGRESS_FILE = os.path.join(BASE_DIR, "progress.json")


os.makedirs(TOURS_DIR, exist_ok=True)

# ============ ФУНКЦИИ СОХРАНЕНИЯ/ЗАГРУЗКИ ============

def load_settings():
    """Загружает настройки"""
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            pass
    return {}

def save_settings(data):
    """Сохраняет настройки"""
    try:
        with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving settings: {e}")

def load_progress():
    """Загружает прогресс обработки"""
    if os.path.exists(PROGRESS_FILE):
        try:
            with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            pass
    return {
        "processed_ids": [],  # tripster_id уже обработанных туров
        "uploaded_ids": [],   # tripster_id загруженных на Inturex
        "current_index": 0,
        "last_update": None
    }

def save_progress(progress):
    """Сохраняет прогресс"""
    progress["last_update"] = datetime.now().isoformat()
    try:
        with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
            json.dump(progress, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving progress: {e}")

# Загружаем сохранённые данные
saved_settings = load_settings()
progress = load_progress()

# ============ ГЛОБАЛЬНОЕ СОСТОЯНИЕ ============

state = {
    "tours": [],
    "current_index": progress.get("current_index", 0),
    "is_running": False,
    "api_key": saved_settings.get("api_key", ""),
    "model": saved_settings.get("model", "gpt-4o-mini"),
    "turex_token": saved_settings.get("turex_token", ""),
    "stats": {
        "total": 0,
        "processed": len(progress.get("processed_ids", [])),
        "uploaded": len(progress.get("uploaded_ids", [])),
        "errors": 0
    }
}

def add_log(message, level="info"):
    """Добавляет лог в очередь для UI"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    log_entry = {
        "time": timestamp,
        "message": message,
        "level": level
    }
    log_queue.append(log_entry)
    # Также выводим в консоль (без эмодзи для совместимости с Windows)
    prefix = {"info": "[INFO]", "success": "[OK]", "error": "[ERR]", "warning": "[WARN]"}.get(level, "")
    try:
        print(f"[{timestamp}] {prefix} {message}")
    except UnicodeEncodeError:
        # Fallback для консолей с ограниченной кодировкой
        print(f"[{timestamp}] {prefix} {message.encode('ascii', 'replace').decode()}")

# ============ МАППИНГ СТРАН ============

COUNTRY_MAP = {
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

COUNTRY_CODE_MAP = {v: k for k, v in COUNTRY_MAP.items()}

# ============ ПРОМПТ ДЛЯ CHATGPT (БЕЗ ФОТОК!) ============

REWRITE_PROMPT = """Ты — профессиональный SEO-копирайтер туристического агентства Inturex. Твоя задача — переписать описание экскурсии, сделав его уникальным, привлекательным, информативным и ОПТИМИЗИРОВАННЫМ ДЛЯ ПОИСКОВИКОВ.

=== SEO ТРЕБОВАНИЯ ===
1. TITLE: Включи город + "экскурсия" или "тур". Пример: "Экскурсия по храмам Бангкока"
2. DESCRIPTION: Первые 160 символов — самые важные! Начни с главного.
3. Естественно включай: "экскурсия", "тур", название города, "русский гид"
4. Используй короткие абзацы (2-3 предложения)
5. Текст должен быть 100% уникальным

=== КОНТЕНТНЫЕ ПРАВИЛА ===
1. НЕ упоминай цены, стоимость, доллары, евро, рубли
2. НЕ упоминай условия оплаты, предоплаты
3. НЕ упоминай звёздность отелей
4. НЕ ПРИДУМЫВАЙ ФАКТЫ! Только информация из исходных данных
5. Псевдо-заголовки (Питание., Транспорт.) объедини в текст
6. ЦЕНА: Конвертируй в рубли. 1 USD = 86 RUB, 1 EUR = 93 RUB, 1 CNY = 12 RUB, 1 THB = 2.5 RUB
7. ЛОКАЦИЯ: Формат "Город, Страна" (например: "Бангкок, Таиланд" или "Чжанцзяцзе, Китай")
8. ТЕГИ И ТЕМЫ: ТОЛЬКО из списков ниже!

=== ОТЗЫВЫ — ПИШИ КАК РЕАЛЬНЫЕ ЛЮДИ ===
Представь что это реальные отзывы от туристов на Яндекс.Картах или Google. Люди пишут по-разному!

ДЛИНА ОТЗЫВОВ (обязательно разная!):
- 2-3 отзыва КОРОТКИЕ (5-15 слов): "Супер! Всем советую", "норм экскурсия, гид молодец"
- 2-3 отзыва СРЕДНИЕ (20-40 слов): описание что понравилось
- 1-2 отзыва ДЛИННЫЕ (50-80 слов): подробный рассказ с деталями

СТИЛЬ (у каждого свой!):
- Кто-то пишет сухо: "Хорошая экскурсия. Гид знающий. Рекомендую"
- Кто-то эмоционально: "Вааау это было нечто!!! Столько эмоций)))"
- Кто-то с юмором: "думал будет скучно а оказалось огонь, даже жена довольна хаха"
- Кто-то по делу: "Экскурсия на 4 часа, успели всё посмотреть, трансфер вовремя"

ОШИБКИ И НЕРОВНОСТИ (не у всех, но у некоторых):
- Опечатки: "экскурися", "понравилоь", "рекомендкю"
- Без запятых: "гид отличный всё показал рассказал"
- С лишними запятыми: "очень, очень понравилось, советую"
- Маленькая буква в начале: "отличная поездка была"
- Скобочки и смайлы: ")) ", "((", "👍"

ЗАПРЕЩЕНО:
- Точка в конце отзыва
- Длинное тире (—), только дефис (-) если нужно
- Шаблоны: "превзошло ожидания", "идеально", "безупречно", "на высшем уровне"

ИМЕНА: Алексей, Марина, Дмитрий, Оля, Настя, Сергей, Виктор, Анна, Катя, Женя, Игорь, Света, Максим, Юля, Андрей

РЕЙТИНГИ: 5-6 отзывов на 5 звёзд, 1-2 отзыва на 4 звезды

ПРИМЕРЫ ХОРОШИХ ОТЗЫВОВ:
- "Супер👍" (короткий)
- "норм съездили" (короткий)
- "Классная экскурсия, гид Сергей всё подробно рассказал про историю храмов, очень интересно было" (средний)
- "ездили с детьми им понравилось, особено обезьянки)) спасибо гиду за терпение" (средний с ошибкой)
- "Долго выбирали куда поехать, в итоге не пожалели что выбрали эту экскурсию. Виды просто космос, фоток наделали кучу. Единственное - жарко было очень, берите воду с собой. Гид Анна молодец, всё рассказала показала, ответила на все вопросы. Рекомендую" (длинный)

ДОСТУПНЫЕ ТЕГИ (выбери 3-6):
Горы, Море, Пляж, Острова, Озёра, Реки, Водопады, Пещеры, Джунгли, Пустыня, Природа, Национальный парк, Заповедник, Храмы, Дворцы, Крепости, Руины, Музеи, Архитектура, История, Культура, Традиции, Буддизм, Индуизм, Гастрономия, Рынки, Шоппинг, Ночная жизнь, Спа, Йога, Медитация, Треккинг, Дайвинг, Снорклинг, Сёрфинг, Велосипед, Яхта, Круиз, Фотография, Закаты, Панорамы, Смотровые площадки, Канатная дорога, Гид, Мини-группа, Индивидуальный тур, Семейный тур, Романтика, Приключения, Релакс, Детям, Эко-туризм

ДОСТУПНЫЕ ТЕМЫ (выбери 1-3):
Природа и Пейзажи, История и Культура, Пляжный отдых, Активный отдых, Гастрономия, Духовные практики, Экскурсии по городу, Приключения, Романтика, Семейный отдых, Оздоровление и СПА, Фототуры, Круизы и водные прогулки, Треккинг и походы, Дайвинг и снорклинг, Ночная жизнь, Шоппинг

ВХОДНЫЕ ДАННЫЕ:
{tour_data}

=== ТРЕБОВАНИЯ К ОПИСАНИЮ (description) ===
Описание должно быть ПОДРОБНЫМ и ИНФОРМАТИВНЫМ (минимум 500-800 символов):
1. Первый абзац: захватывающее вступление, что это за экскурсия и почему она уникальна
2. Второй абзац: подробно опиши маршрут и что увидят туристы
3. Третий абзац: особенности экскурсии, интересные факты о местах
4. Четвёртый абзац: для кого подойдёт экскурсия, что получит турист

НЕ ПИШИ общими фразами типа "незабываемые впечатления" - пиши КОНКРЕТИКУ!
Используй информацию из исходных данных, расширяй и дополняй её.

Верни СТРОГО JSON (без ```json):
{{
    "title": "SEO-название с городом (привлекательное, 50-70 символов)",
    "location": "Город, Страна",
    "description": "ПОДРОБНОЕ SEO-описание 4-5 абзацев, минимум 500 символов. Расскажи про маршрут, достопримечательности, что увидят туристы. БЕЗ ЦЕН!",
    "what_to_expect": "2-3 предложения. Конкретно что увидит и испытает турист. Начни с 'Вы увидите...' или 'Вас ждёт...'",
    "organizational_details": "Подробные оргдетали: транспорт, физическая подготовка, что взять с собой, ограничения по возрасту. БЕЗ ЦЕН.",
    "price": 12500,
    "price_note": "Цена за группу / за человека",
    "included": ["Подробно что включено - транспорт, гид, входные билеты и т.д."],
    "not_included": ["Что не включено - еда, личные расходы и т.д."],
    "meeting_point": "Точное место встречи или null",
    "tags": ["Тег1", "Тег2", "Тег3"],
    "themes": ["Тема1", "Тема2"],
    "landmarks": ["Достопримечательность1", "Достопримечательность2", "Достопримечательность3"],
    "reviews": [
        {{"name": "Имя", "rating": 5, "text": "Реалистичный отзыв с неровностями, без точки в конце"}}
    ]
}}"""


# ============ ФУНКЦИИ ДЛЯ РАБОТЫ С ТУРАМИ ============

def get_tour_folder(country, city, tripster_id):
    """Возвращает путь к папке тура"""
    # Очищаем имена от спецсимволов
    country_safe = re.sub(r'[^\w\s-]', '', country).strip()
    city_safe = re.sub(r'[^\w\s-]', '', city).strip() if city else "unknown"
    
    folder = os.path.join(TOURS_DIR, country_safe, city_safe, str(tripster_id))
    os.makedirs(folder, exist_ok=True)
    os.makedirs(os.path.join(folder, "images"), exist_ok=True)
    return folder


def save_tour_data(tour_folder, original_data, rewritten_data=None, status="pending"):
    """Сохраняет данные тура в JSON"""
    data_file = os.path.join(tour_folder, "data.json")
    
    data = {
        "status": status,  # pending, processed, uploaded, error
        "original": original_data,
        "rewritten": rewritten_data,
        "images": [],
        "turex_id": None,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    # Если файл уже есть — обновляем
    if os.path.exists(data_file):
        try:
            with open(data_file, "r", encoding="utf-8") as f:
                existing = json.load(f)
                data["created_at"] = existing.get("created_at", data["created_at"])
                data["images"] = existing.get("images", [])
                data["turex_id"] = existing.get("turex_id")
        except:
            pass
    
    with open(data_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    return data_file


def load_tour_data(tour_folder):
    """Загружает данные тура"""
    data_file = os.path.join(tour_folder, "data.json")
    if os.path.exists(data_file):
        with open(data_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return None


def upload_image_to_turex(local_path, tour_id=None):
    """Загружает изображение на сервер Inturex"""
    if not state["turex_token"]:
        return {"success": False, "error": "Не залогинены в Inturex"}
    
    try:
        # Определяем content-type
        ext = os.path.splitext(local_path)[1].lower()
        content_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.gif': 'image/gif'
        }
        content_type = content_types.get(ext, 'image/jpeg')
        
        # Открываем файл для загрузки
        with open(local_path, 'rb') as f:
            files = {'file': (os.path.basename(local_path), f, content_type)}
            headers = {
                'Authorization': f'Bearer {state["turex_token"]}'
            }
            
            params = {}
            if tour_id:
                params['tour_id'] = tour_id
            
            response = requests.post(
                f"{TUREX_API_URL}/api/v1/admin/upload-image",
                files=files,
                headers=headers,
                params=params,
                timeout=60
            )
        
        if response.status_code in [200, 201]:
            data = response.json()
            # Формируем полный URL
            full_url = f"{TUREX_API_URL}{data.get('url', data.get('path', ''))}"
            return {"success": True, "url": full_url}
        else:
            return {"success": False, "error": f"Upload failed: {response.status_code} - {response.text[:200]}"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}


def upload_tour_images_to_turex(tour_folder, tour_id=None):
    """Загружает все изображения тура на Inturex и возвращает URL"""
    images_dir = os.path.join(tour_folder, "images")
    if not os.path.exists(images_dir):
        return []
    
    uploaded_urls = []
    
    for filename in sorted(os.listdir(images_dir)):
        if not filename.startswith('photo_'):
            continue
        
        local_path = os.path.join(images_dir, filename)
        
        print(f"    Uploading {filename} to Inturex...")
        result = upload_image_to_turex(local_path, tour_id)
        
        if result["success"]:
            uploaded_urls.append(result["url"])
            print(f"      OK: {result['url'][:60]}...")
        else:
            print(f"      ERROR: {result['error'][:50]}")
        
        time.sleep(0.3)  # Пауза между загрузками
    
    return uploaded_urls


def download_tour_images(tour_folder, photo_urls):
    """Скачивает фотки тура"""
    if not photo_urls:
        return []
    
    images_dir = os.path.join(tour_folder, "images")
    os.makedirs(images_dir, exist_ok=True)
    
    downloaded = []
    for i, url in enumerate(photo_urls[:10]):  # Максимум 10 фото
        if not url or not url.startswith('http'):
            continue
        
        # Определяем расширение
        ext = '.jpg'
        if '.png' in url.lower():
            ext = '.png'
        elif '.webp' in url.lower():
            ext = '.webp'
        
        filename = f"photo_{i+1}{ext}"
        filepath = os.path.join(images_dir, filename)
        
        # Если уже скачано — пропускаем
        if os.path.exists(filepath):
            downloaded.append(filepath)
            continue
        
        try:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            response = requests.get(url, headers=headers, timeout=30, stream=True)
            if response.status_code == 200:
                with open(filepath, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                downloaded.append(filepath)
                print(f"    Downloaded: {filename}")
            time.sleep(0.3)
        except Exception as e:
            print(f"    Error downloading {url[:50]}: {e}")
    
    return downloaded


# ============ ЗАГРУЗКА ТУРОВ ИЗ JSON ============

def load_tours_from_json():
    """Загружает туры из JSON файлов Tripster"""
    tours = []
    
    # Ищем JSON файлы
    data_paths = [
        os.path.join(os.path.dirname(BASE_DIR), "backend", "data", "*.json"),
        os.path.join(BASE_DIR, "data", "*.json"),
    ]
    
    files = []
    for path in data_paths:
        files.extend(glob.glob(path))
    
    print(f"Found {len(files)} JSON files")
    
    for file_path in files:
        filename = os.path.basename(file_path).replace(".json", "").lower()
        country_name = COUNTRY_MAP.get(filename, filename.capitalize())
        country_code = filename
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                try:
                    data = json.loads(content)
                except:
                    start = content.find('{')
                    if start != -1:
                        data, _ = json.JSONDecoder().raw_decode(content[start:])
                    else:
                        continue
            
            results = data.get("results", [])
            print(f"  {country_name}: {len(results)} tours")
            
            for item in results:
                tour = extract_tour_data(item, country_name, country_code)
                tours.append(tour)
                
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
    
    return tours


def extract_tour_data(item, country_name, country_code):
    """Извлекает данные тура"""
    
    # Город
    city_name = ""
    if 'geo' in item and 'city' in item['geo'] and item['geo']['city']:
        main_city = next((c for c in item['geo']['city'] if c.get('is_main_city')), None)
        if main_city:
            city_name = main_city['name']
        elif item['geo']['city']:
            city_name = item['geo']['city'][0]['name']
    
    location = f"{country_name}, {city_name}" if city_name else country_name
    
    # Цена
    price_info = ""
    if 'price' in item:
        price_data = item['price']
        if isinstance(price_data, dict):
            price_value = price_data.get('value', price_data.get('amount', ''))
            price_currency = price_data.get('currency', 'RUB')
            price_info = f"{price_value} {price_currency}"
        else:
            price_info = str(price_data)
    
    # Фотки (для скачивания, НЕ для ChatGPT)
    photo_urls = []
    if 'photo' in item and item['photo']:
        photo = item['photo']
        if isinstance(photo, dict):
            for size in ['big', 'medium', 'original']:
                if size in photo and photo[size]:
                    photo_urls.append(photo[size])
                    break
        elif isinstance(photo, str):
            photo_urls.append(photo)
    
    if 'photos' in item:
        for photo in item.get('photos', [])[:10]:
            if isinstance(photo, dict):
                for size in ['big', 'medium', 'original']:
                    if size in photo and photo[size] and photo[size] not in photo_urls:
                        photo_urls.append(photo[size])
                        break
            elif isinstance(photo, str) and photo not in photo_urls:
                photo_urls.append(photo)
    
    return {
        "tripster_id": item.get('id', ''),
        "title": item.get('title', ''),
        "tagline": item.get('tagline', ''),
        "annotation": item.get('annotation', ''),
        "additional_info": item.get('additional_info', ''),
        "comfort_level_info": item.get('comfort_level_info', ''),
        "price_included": item.get('price_included_description', ''),
        "price_not_included": item.get('price_not_included_description', ''),
        "original_price": price_info,
        "location": location,
        "country": country_name,
        "country_code": country_code,
        "city": city_name,
        "duration_hours": item.get('duration', 0),
        "max_persons": item.get('max_persons', 10),
        "rating": item.get('rating', 5.0),
        "photo_urls": photo_urls,  # Только для скачивания!
    }


# ============ CHATGPT ============

def run_async(coro):
    """Запускает async функцию синхронно"""
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)


async def call_chatgpt(tour_data, api_key, model=None):
    """Отправляет данные в ChatGPT (БЕЗ ФОТОК!)"""
    
    if model is None:
        model = state.get("model", "gpt-4o-mini")
    
    # Убираем фотки из данных для GPT
    data_for_gpt = {k: v for k, v in tour_data.items() if k not in ['photo_urls', 'country_code']}
    
    tour_json = json.dumps(data_for_gpt, ensure_ascii=False, indent=2)
    prompt = REWRITE_PROMPT.format(tour_data=tour_json)
    
    client = openai.AsyncOpenAI(api_key=api_key)
    
    try:
        use_new_param = any(x in model.lower() for x in ["gpt-5", "gpt-4.1", "o1", "o3", "o4", "chatgpt"])
        
        params = {
            "model": model,
            "messages": [
                {"role": "system", "content": "Ты профессиональный копирайтер. Отвечай только валидным JSON."},
                {"role": "user", "content": prompt}
            ],
        }
        
        if use_new_param:
            params["max_completion_tokens"] = 16000
        else:
            params["temperature"] = 0.7
            params["max_tokens"] = 8000
        
        response = await client.chat.completions.create(**params)
        content = response.choices[0].message.content.strip()
        
        # Убираем markdown
        if content.startswith('```json'):
            content = content[7:]
        if content.startswith('```'):
            content = content[3:]
        if content.endswith('```'):
            content = content[:-3]
        content = content.strip()
        
        result = json.loads(content)
        return {"success": True, "data": result}
        
    except json.JSONDecodeError as e:
        return {"success": False, "error": f"JSON parse error: {e}", "raw": content[:500]}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ============ TUREX API ============

TUREX_API_URL = "https://inturex.pro"

def upload_to_turex(tour_folder, gpt_data, original_data, upload_images=False):
    """Загружает тур на Inturex с изображениями
    
    ВАЖНО: Railway имеет эфемерную файловую систему - файлы удаляются при деплое!
    Поэтому используем оригинальные URL с Tripster (они стабильные).
    upload_images=False по умолчанию - не загружаем на Railway.
    """
    
    if not state["turex_token"]:
        return {"success": False, "error": "Не залогинены в Inturex"}
    
    headers = {
        "Authorization": f"Bearer {state['turex_token']}",
        "Content-Type": "application/json; charset=utf-8"
    }
    
    tripster_id = original_data.get("tripster_id", "unknown")
    
    # Используем оригинальные URL с Tripster - они стабильные
    # Railway удаляет файлы при деплое, поэтому не загружаем туда
    photo_urls = original_data.get("photo_urls", [])
    
    # Формируем payload
    tour_payload = {
        "title": gpt_data.get("title", original_data.get("title", "")),
        "description": gpt_data.get("description", ""),
        "price": gpt_data.get("price", 5000),
        "duration": original_data.get("duration_hours", 4),
        "location": gpt_data.get("location", original_data.get("location", "")),
        "category": gpt_data.get("themes", ["Экскурсии"])[0] if gpt_data.get("themes") else "Экскурсии",
        "photos": photo_urls[:10],
        "what_to_expect": gpt_data.get("what_to_expect", ""),
        "organizational_details": gpt_data.get("organizational_details", ""),
        "included": gpt_data.get("included", []),
        "not_included": gpt_data.get("not_included", []),
        "meeting_point": gpt_data.get("meeting_point"),
        "tags": gpt_data.get("tags", []),
        "themes": gpt_data.get("themes", []),
        "landmarks": gpt_data.get("landmarks", []),
        "rating": original_data.get("rating", 5.0),
        "max_group_size": original_data.get("max_persons", 10),
        "is_public": True,
        "active": True,
        "source": "rewriter"
    }
    
    try:
        # Создаём тур
        response = requests.post(
            f"{TUREX_API_URL}/api/v1/tours/",
            json={
                "title": tour_payload["title"],
                "description": tour_payload["description"],
                "price": tour_payload["price"],
                "duration": tour_payload["duration"],
                "location": tour_payload["location"],
                "category": tour_payload["category"],
                "photos": tour_payload["photos"]
            },
            headers=headers,
            timeout=60
        )
        
        if response.status_code not in [200, 201]:
            return {"success": False, "error": f"Create error: {response.status_code} - {response.text[:200]}"}
        
        created = response.json()
        tour_id = created.get("id")
        
        if tour_id:
            # НЕ загружаем фотки на Railway - они удалятся при деплое!
            # Используем оригинальные URL с Tripster
            # Если нужно своё хранилище - использовать Supabase Storage или S3
            if upload_images:
                print(f"  [SKIP] Image upload disabled - Railway has ephemeral storage")
                print(f"  Using original Tripster URLs instead")
            
            # Обновляем все поля через admin API
            requests.put(
                f"{TUREX_API_URL}/api/v1/admin/tours/{tour_id}/full-update",
                json=tour_payload,
                headers=headers,
                timeout=60
            )
            
            # Добавляем отзывы
            reviews_data = gpt_data.get("reviews", [])
            reviews_added = 0
            for review in reviews_data:
                try:
                    rev_resp = requests.post(
                        f"{TUREX_API_URL}/api/v1/reviews/",
                        json={
                            "tour_id": int(tour_id),
                            "user_name": review.get("name", "Гость"),
                            "rating": float(review.get("rating", 5)),
                            "text": review.get("text", "Отличная экскурсия!"),
                            "experience_count": 1
                        },
                        headers=headers,
                        timeout=30
                    )
                    if rev_resp.status_code in [200, 201]:
                        reviews_added += 1
                except:
                    pass
            
            return {
                "success": True,
                "tour_id": tour_id,
                "reviews_added": reviews_added,
                "images_count": len(tour_payload.get("photos", []))
            }
        
        return {"success": False, "error": "No tour ID returned"}
        
    except Exception as e:
        return {"success": False, "error": str(e)}


# ============ API ENDPOINTS ============

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/load-tours', methods=['POST'])
def api_load_tours():
    """Загружает туры из JSON"""
    state["tours"] = load_tours_from_json()
    state["stats"]["total"] = len(state["tours"])
    
    # Проверяем статусы всех туров
    processed = 0
    uploaded = 0
    pending = 0
    
    for tour in state["tours"]:
        tripster_id = tour.get("tripster_id")
        folder = get_tour_folder(tour["country"], tour["city"], tripster_id)
        data = load_tour_data(folder)
        if data:
            status = data.get("status", "pending")
            if status == "processed":
                processed += 1
            elif status == "uploaded":
                uploaded += 1
            else:
                pending += 1
        else:
            pending += 1
    
    state["stats"]["processed"] = processed
    state["stats"]["uploaded"] = uploaded
    
    return jsonify({
        "success": True,
        "total": len(state["tours"]),
        "processed": processed,
        "uploaded": uploaded,
        "pending": pending
    })


@app.route('/api/get-tours-list')
def api_get_tours_list():
    """Возвращает список всех туров с их статусами"""
    tours_list = []
    
    for i, tour in enumerate(state["tours"]):
        tripster_id = tour.get("tripster_id")
        folder = get_tour_folder(tour["country"], tour["city"], tripster_id)
        data = load_tour_data(folder)
        
        status = "pending"
        if data:
            status = data.get("status", "pending")
        
        tours_list.append({
            "index": i,
            "tripster_id": tripster_id,
            "title": tour.get("title", "")[:60],
            "country": tour.get("country", ""),
            "city": tour.get("city", ""),
            "status": status
        })
    
    return jsonify({
        "success": True,
        "tours": tours_list,
        "total": len(tours_list)
    })


@app.route('/api/get-stats')
def api_get_stats():
    """Статистика"""
    # Считаем из папок
    total_folders = 0
    processed = 0
    uploaded = 0
    with_images = 0
    
    if os.path.exists(TOURS_DIR):
        for country in os.listdir(TOURS_DIR):
            country_path = os.path.join(TOURS_DIR, country)
            if not os.path.isdir(country_path):
                continue
            for city in os.listdir(country_path):
                city_path = os.path.join(country_path, city)
                if not os.path.isdir(city_path):
                    continue
                for tour_id in os.listdir(city_path):
                    tour_path = os.path.join(city_path, tour_id)
                    if not os.path.isdir(tour_path):
                        continue
                    total_folders += 1
                    
                    data = load_tour_data(tour_path)
                    if data:
                        if data.get("status") == "processed":
                            processed += 1
                        elif data.get("status") == "uploaded":
                            uploaded += 1
                        if data.get("images"):
                            with_images += 1
    
    return jsonify({
        "total_tours": state["stats"]["total"],
        "total_folders": total_folders,
        "processed": processed,
        "uploaded": uploaded,
        "with_images": with_images,
        "is_running": state["is_running"],
        "current_index": state["current_index"]
    })


@app.route('/api/get-tour/<int:index>')
def api_get_tour(index):
    """Получает данные тура"""
    if index < 0 or index >= len(state["tours"]):
        return jsonify({"success": False, "error": "Invalid index"})
    
    tour = state["tours"][index]
    tripster_id = tour.get("tripster_id")
    folder = get_tour_folder(tour["country"], tour["city"], tripster_id)
    saved_data = load_tour_data(folder)
    
    # Генерируем промпт для предпросмотра (без фоток!)
    data_for_gpt = {k: v for k, v in tour.items() if k not in ['photo_urls', 'country_code']}
    tour_json = json.dumps(data_for_gpt, ensure_ascii=False, indent=2)
    prompt_preview = REWRITE_PROMPT.format(tour_data=tour_json)
    
    return jsonify({
        "success": True,
        "index": index,
        "total": len(state["tours"]),
        "tour": tour,
        "saved_data": saved_data,
        "folder": folder,
        "prompt_preview": prompt_preview
    })


@app.route('/api/process-tour/<int:index>', methods=['POST'])
def api_process_tour(index):
    """Обрабатывает один тур: GPT + скачивание фоток"""
    if not state["api_key"]:
        return jsonify({"success": False, "error": "API key not set"})
    
    if index < 0 or index >= len(state["tours"]):
        return jsonify({"success": False, "error": "Invalid index"})
    
    tour = state["tours"][index]
    tripster_id = tour.get("tripster_id")
    
    print(f"\n[{index+1}/{len(state['tours'])}] Processing: {tour['title'][:50]}...")
    
    # 1. Создаём папку
    folder = get_tour_folder(tour["country"], tour["city"], tripster_id)
    print(f"  Folder: {folder}")
    
    # 2. Скачиваем фотки
    photo_urls = tour.get("photo_urls", [])
    print(f"  Downloading {len(photo_urls)} images...")
    downloaded = download_tour_images(folder, photo_urls)
    print(f"  Downloaded: {len(downloaded)} images")
    
    # 3. Обрабатываем через ChatGPT
    print(f"  Calling ChatGPT ({state['model']})...")
    result = run_async(call_chatgpt(tour, state["api_key"]))
    
    if result["success"]:
        # 4. Сохраняем
        save_tour_data(folder, tour, result["data"], status="processed")
        
        # Обновляем data.json с путями к фоткам
        data_file = os.path.join(folder, "data.json")
        with open(data_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        data["images"] = downloaded
        with open(data_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"  SUCCESS!")
        
        return jsonify({
            "success": True,
            "tripster_id": tripster_id,
            "folder": folder,
            "images_downloaded": len(downloaded),
            "rewritten": result["data"]
        })
    else:
        save_tour_data(folder, tour, None, status="error")
        print(f"  ERROR: {result.get('error', 'Unknown')}")
        
        return jsonify({
            "success": False,
            "error": result.get("error", "Unknown error"),
            "tripster_id": tripster_id
        })


@app.route('/api/upload-tour/<int:index>', methods=['POST'])
def api_upload_tour(index):
    """Загружает обработанный тур на Inturex"""
    if index < 0 or index >= len(state["tours"]):
        return jsonify({"success": False, "error": "Invalid index"})
    
    tour = state["tours"][index]
    tripster_id = tour.get("tripster_id")
    folder = get_tour_folder(tour["country"], tour["city"], tripster_id)
    
    # Загружаем сохранённые данные
    saved = load_tour_data(folder)
    if not saved or saved.get("status") != "processed":
        return jsonify({"success": False, "error": "Tour not processed yet"})
    
    # Загружаем на Inturex
    result = upload_to_turex(folder, saved["rewritten"], saved["original"])
    
    if result["success"]:
        # Обновляем статус
        saved["status"] = "uploaded"
        saved["turex_id"] = result["tour_id"]
        saved["updated_at"] = datetime.now().isoformat()
        
        data_file = os.path.join(folder, "data.json")
        with open(data_file, "w", encoding="utf-8") as f:
            json.dump(saved, f, ensure_ascii=False, indent=2)
    
    return jsonify(result)


@app.route('/api/set-api-key', methods=['POST'])
def api_set_key():
    """Устанавливает API ключ"""
    data = request.json
    state["api_key"] = data.get("api_key", "").strip()
    state["model"] = data.get("model", "gpt-4o-mini")
    
    save_settings({
        "api_key": state["api_key"],
        "model": state["model"],
        "turex_token": state.get("turex_token", "")
    })
    
    return jsonify({"success": True})


@app.route('/api/get-models', methods=['POST'])
def api_get_models():
    """Получает список моделей из OpenAI API"""
    if not state["api_key"]:
        return jsonify({"success": False, "error": "API key not set"})
    
    try:
        headers = {
            "Authorization": f"Bearer {state['api_key']}"
        }
        response = requests.get("https://api.openai.com/v1/models", headers=headers, timeout=30)
        
        if response.status_code != 200:
            error_msg = response.json().get("error", {}).get("message", f"API error: {response.status_code}")
            return jsonify({"success": False, "error": error_msg})
        
        data = response.json()
        models = data.get("data", [])
        
        # Фильтруем только chat модели
        chat_models = []
        for model in models:
            model_id = model.get("id", "")
            # Включаем GPT модели и o1/o3/o4
            if any(x in model_id.lower() for x in ["gpt-", "o1", "o3", "o4", "chatgpt"]):
                chat_models.append({
                    "id": model_id,
                    "owned_by": model.get("owned_by", ""),
                    "created": model.get("created", 0)
                })
        
        # Сортируем по дате (новые первые)
        chat_models.sort(key=lambda x: x["created"], reverse=True)
        
        return jsonify({
            "success": True,
            "models": chat_models,
            "current_model": state["model"]
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    
    return jsonify({"success": True})


@app.route('/api/turex-login', methods=['POST'])
def api_turex_login():
    """Логин в Inturex"""
    data = request.json
    phone = data.get("phone", "79177445182")
    password = data.get("password", "admin123")
    
    try:
        response = requests.post(
            f"{TUREX_API_URL}/api/v1/auth/login",
            json={"phone": phone, "password": password},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            state["turex_token"] = result.get("access_token")
            
            save_settings({
                "api_key": state["api_key"],
                "model": state["model"],
                "turex_token": state["turex_token"]
            })
            
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "error": f"Login failed: {response.status_code}"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


@app.route('/api/batch-process', methods=['POST'])
def api_batch_process():
    """Пакетная обработка туров"""
    if state["is_running"]:
        return jsonify({"success": False, "error": "Already running"})
    
    data = request.json
    start_index = data.get("start", 0)
    count = data.get("count", 10)
    
    state["is_running"] = True
    state["current_index"] = start_index
    
    def process_batch():
        end_index = min(start_index + count, len(state["tours"]))
        
        for i in range(start_index, end_index):
            if not state["is_running"]:
                break
            
            state["current_index"] = i
            
            tour = state["tours"][i]
            tripster_id = tour.get("tripster_id")
            folder = get_tour_folder(tour["country"], tour["city"], tripster_id)
            
            # Проверяем, не обработан ли уже
            saved = load_tour_data(folder)
            if saved and saved.get("status") in ["processed", "uploaded"]:
                print(f"[{i+1}] Already processed, skipping...")
                continue
            
            # Обрабатываем
            print(f"\n[{i+1}/{end_index}] Processing: {tour['title'][:50]}...")
            
            # Скачиваем фотки
            downloaded = download_tour_images(folder, tour.get("photo_urls", []))
            
            # ChatGPT
            result = run_async(call_chatgpt(tour, state["api_key"]))
            
            if result["success"]:
                save_tour_data(folder, tour, result["data"], status="processed")
                
                # Сохраняем пути к фоткам
                data_file = os.path.join(folder, "data.json")
                with open(data_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                data["images"] = downloaded
                with open(data_file, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                print(f"  SUCCESS! Images: {len(downloaded)}")
            else:
                save_tour_data(folder, tour, None, status="error")
                print(f"  ERROR: {result.get('error', 'Unknown')[:100]}")
            
            time.sleep(2)  # Пауза между запросами
        
        state["is_running"] = False
        print("\n=== Batch processing complete ===")
    
    thread = threading.Thread(target=process_batch)
    thread.daemon = True
    thread.start()
    
    return jsonify({"success": True, "message": f"Processing tours {start_index} to {start_index + count}"})


@app.route('/api/batch-upload', methods=['POST'])
def api_batch_upload():
    """Пакетная загрузка на Inturex"""
    if not state["turex_token"]:
        return jsonify({"success": False, "error": "Not logged in to Inturex"})
    
    if state["is_running"]:
        return jsonify({"success": False, "error": "Already running"})
    
    state["is_running"] = True
    
    def upload_all():
        uploaded = 0
        errors = []
        total_to_upload = 0
        
        # Сначала считаем сколько туров нужно загрузить
        tours_to_upload = []
        if os.path.exists(TOURS_DIR):
            for country in os.listdir(TOURS_DIR):
                country_path = os.path.join(TOURS_DIR, country)
                if not os.path.isdir(country_path):
                    continue
                for city in os.listdir(country_path):
                    city_path = os.path.join(country_path, city)
                    if not os.path.isdir(city_path):
                        continue
                    for tour_id in os.listdir(city_path):
                        tour_path = os.path.join(city_path, tour_id)
                        if not os.path.isdir(tour_path):
                            continue
                        
                        saved = load_tour_data(tour_path)
                        if saved and saved.get("status") == "processed":
                            tours_to_upload.append((tour_path, tour_id, saved))
        
        total_to_upload = len(tours_to_upload)
        add_log(f"Начинаем загрузку {total_to_upload} туров на Inturex...", "info")
        
        for i, (tour_path, tour_id, saved) in enumerate(tours_to_upload):
            if not state["is_running"]:
                add_log("Загрузка остановлена пользователем", "warning")
                break
            
            state["current_index"] = i
            title = saved.get("rewritten", {}).get("title", tour_id)[:40]
            add_log(f"[{i+1}/{total_to_upload}] {title}...", "info")
            
            result = upload_to_turex(tour_path, saved["rewritten"], saved["original"])
            if result["success"]:
                saved["status"] = "uploaded"
                saved["turex_id"] = result["tour_id"]
                data_file = os.path.join(tour_path, "data.json")
                with open(data_file, "w", encoding="utf-8") as f:
                    json.dump(saved, f, ensure_ascii=False, indent=2)
                uploaded += 1
                add_log(f"Загружен #{result['tour_id']}", "success")
            else:
                errors.append(f"{tour_id}: {result['error']}")
                add_log(f"Ошибка: {result['error'][:80]}", "error")
            
            time.sleep(1)
        
        state["is_running"] = False
        add_log(f"Загрузка завершена! Успешно: {uploaded}, Ошибок: {len(errors)}", "success")
    
    thread = threading.Thread(target=upload_all)
    thread.daemon = True
    thread.start()
    
    return jsonify({
        "success": True,
        "message": "Загрузка запущена в фоне. Смотрите консоль."
    })


@app.route('/api/stop', methods=['POST'])
def api_stop():
    """Останавливает обработку"""
    state["is_running"] = False
    return jsonify({"success": True})


@app.route('/api/get-settings')
def api_get_settings():
    """Возвращает настройки"""
    return jsonify({
        "api_key": state["api_key"][:10] + "..." if state["api_key"] else "",
        "model": state["model"],
        "turex_logged_in": bool(state["turex_token"])
    })


@app.route('/api/get-logs')
def api_get_logs():
    """Возвращает последние логи"""
    return jsonify({
        "logs": list(log_queue),
        "is_running": state["is_running"],
        "current_index": state["current_index"]
    })


@app.route('/api/get-status')
def api_get_status():
    """Возвращает текущий статус операции"""
    # Пересчитываем статистику
    stats = {"pending": 0, "processed": 0, "uploaded": 0, "error": 0, "total_folders": 0}
    
    if os.path.exists(TOURS_DIR):
        for country in os.listdir(TOURS_DIR):
            country_path = os.path.join(TOURS_DIR, country)
            if not os.path.isdir(country_path):
                continue
            for city in os.listdir(country_path):
                city_path = os.path.join(country_path, city)
                if not os.path.isdir(city_path):
                    continue
                for tour_id in os.listdir(city_path):
                    tour_path = os.path.join(city_path, tour_id)
                    if not os.path.isdir(tour_path):
                        continue
                    
                    stats["total_folders"] += 1
                    saved = load_tour_data(tour_path)
                    if saved:
                        status = saved.get("status", "pending")
                        if status in stats:
                            stats[status] += 1
                        else:
                            stats["pending"] += 1
    
    return jsonify({
        "is_running": state["is_running"],
        "current_index": state["current_index"],
        "total_tours": len(state["tours"]),
        "stats": stats
    })


@app.route('/api/reset-stats', methods=['POST'])
def api_reset_stats():
    """Сбрасывает статистику загруженных туров (меняет статус uploaded -> processed)"""
    reset_count = 0
    
    if os.path.exists(TOURS_DIR):
        for country in os.listdir(TOURS_DIR):
            country_path = os.path.join(TOURS_DIR, country)
            if not os.path.isdir(country_path):
                continue
            for city in os.listdir(country_path):
                city_path = os.path.join(country_path, city)
                if not os.path.isdir(city_path):
                    continue
                for tour_id in os.listdir(city_path):
                    tour_path = os.path.join(city_path, tour_id)
                    data_file = os.path.join(tour_path, "data.json")
                    if os.path.exists(data_file):
                        with open(data_file, "r", encoding="utf-8") as f:
                            data = json.load(f)
                        if data.get("status") == "uploaded":
                            data["status"] = "processed"
                            with open(data_file, "w", encoding="utf-8") as f:
                                json.dump(data, f, ensure_ascii=False, indent=2)
                            reset_count += 1
    
    # Сбрасываем progress.json
    progress_file = os.path.join(TOURS_DIR, "progress.json")
    if os.path.exists(progress_file):
        with open(progress_file, "r", encoding="utf-8") as f:
            progress = json.load(f)
        progress["uploaded_ids"] = []
        with open(progress_file, "w", encoding="utf-8") as f:
            json.dump(progress, f, ensure_ascii=False, indent=2)
    
    state["stats"]["uploaded"] = 0
    add_log(f"Статистика сброшена. Сброшено {reset_count} туров.", "success")
    
    return jsonify({"success": True, "reset_count": reset_count})


# ============ ARTICLE GENERATION ENDPOINTS ============

@app.route('/api/articles/types')
def api_get_article_types():
    """Возвращает доступные типы статей"""
    if not ARTICLES_ENABLED:
        return jsonify({"success": False, "error": "Articles feature not available"})
    
    types = []
    for key, config in ARTICLE_TYPES.items():
        types.append({
            "id": key,
            "name": config["name"],
            "description": config["description"],
            "prompt": config["prompt"]  # Возвращаем промпт
        })
    
    return jsonify({"success": True, "types": types})


@app.route('/api/articles/generate/<int:index>', methods=['POST'])
def api_generate_articles(index):
    """Генерирует статьи для тура"""
    if not ARTICLES_ENABLED:
        return jsonify({"success": False, "error": "Articles feature not available"})
    
    if not state["api_key"]:
        return jsonify({"success": False, "error": "API key not set. Сначала введите ключ и нажмите Сохранить."})
    
    # Если туры не загружены - загружаем автоматически
    if len(state["tours"]) == 0:
        add_log("Автоматическая загрузка туров...", "info")
        state["tours"] = load_tours_from_json()
        state["stats"]["total"] = len(state["tours"])
        add_log(f"Загружено {len(state['tours'])} туров", "success")
    
    if index < 0 or index >= len(state["tours"]):
        return jsonify({"success": False, "error": f"Invalid tour index: {index}. Всего туров: {len(state['tours'])}. Сначала загрузите туры."})
    
    data = request.json or {}
    article_count = data.get("count", 2)  # По умолчанию 2 статьи
    
    tour = state["tours"][index]
    tripster_id = tour.get("tripster_id")
    folder = get_tour_folder(tour["country"], tour["city"], tripster_id)
    
    # Загружаем данные тура (если обработан - берём рерайт)
    saved = load_tour_data(folder)
    tour_data = saved.get("rewritten", tour) if saved and saved.get("rewritten") else tour
    
    # Добавляем оригинальные данные
    tour_data["country"] = tour.get("country", "")
    tour_data["city"] = tour.get("city", "")
    tour_data["photo_urls"] = tour.get("photo_urls", [])
    
    add_log(f"Генерация {article_count} статей для: {tour_data.get('title', '')[:40]}...", "info")
    
    # Генерируем статьи
    articles = run_async(generate_articles_for_tour(
        tour_data, 
        state["api_key"], 
        state["model"],
        article_count
    ))
    
    if articles:
        # Сохраняем статьи в папку тура
        articles_file = os.path.join(folder, "articles.json")
        with open(articles_file, "w", encoding="utf-8") as f:
            json.dump(articles, f, ensure_ascii=False, indent=2)
        
        add_log(f"Сгенерировано {len(articles)} статей", "success")
        
        return jsonify({
            "success": True,
            "articles": articles,
            "count": len(articles)
        })
    else:
        add_log("Ошибка генерации статей", "error")
        return jsonify({"success": False, "error": "No articles generated"})


@app.route('/api/articles/upload/<int:index>', methods=['POST'])
def api_upload_articles(index):
    """Загружает статьи тура на сервер"""
    if not ARTICLES_ENABLED:
        return jsonify({"success": False, "error": "Articles feature not available"})
    
    if not state["turex_token"]:
        return jsonify({"success": False, "error": "Not logged in to Inturex"})
    
    if index < 0 or index >= len(state["tours"]):
        return jsonify({"success": False, "error": "Invalid tour index"})
    
    tour = state["tours"][index]
    tripster_id = tour.get("tripster_id")
    folder = get_tour_folder(tour["country"], tour["city"], tripster_id)
    
    # Загружаем статьи
    articles_file = os.path.join(folder, "articles.json")
    if not os.path.exists(articles_file):
        return jsonify({"success": False, "error": "No articles found. Generate first."})
    
    with open(articles_file, "r", encoding="utf-8") as f:
        articles = json.load(f)
    
    photo_urls = tour.get("photo_urls", [])
    uploaded = []
    errors = []
    
    for i, article in enumerate(articles):
        photo_url = photo_urls[i % len(photo_urls)] if photo_urls else ""
        
        add_log(f"Загрузка статьи: {article.get('title', '')[:40]}...", "info")
        
        result = upload_article(article, photo_url, state["turex_token"])
        
        if result["success"]:
            article["turex_id"] = result.get("article_id")
            article["slug"] = result.get("slug")
            uploaded.append(result)
            add_log(f"Статья загружена: #{result.get('article_id')}", "success")
        else:
            errors.append(result.get("error", "Unknown error"))
            add_log(f"Ошибка: {result.get('error', 'Unknown')[:50]}", "error")
        
        time.sleep(0.5)
    
    # Обновляем файл статей
    with open(articles_file, "w", encoding="utf-8") as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)
    
    return jsonify({
        "success": len(uploaded) > 0,
        "uploaded": len(uploaded),
        "errors": errors
    })


@app.route('/api/articles/get/<int:index>')
def api_get_articles(index):
    """Получает сохранённые статьи для тура"""
    if index < 0 or index >= len(state["tours"]):
        return jsonify({"success": False, "error": "Invalid tour index"})
    
    tour = state["tours"][index]
    tripster_id = tour.get("tripster_id")
    folder = get_tour_folder(tour["country"], tour["city"], tripster_id)
    
    articles_file = os.path.join(folder, "articles.json")
    if not os.path.exists(articles_file):
        return jsonify({"success": True, "articles": [], "count": 0})
    
    with open(articles_file, "r", encoding="utf-8") as f:
        articles = json.load(f)
    
    return jsonify({
        "success": True,
        "articles": articles,
        "count": len(articles)
    })


@app.route('/api/articles/convert-webp/<int:index>', methods=['POST'])
def api_convert_webp(index):
    """Конвертирует изображения тура в WebP"""
    if not ARTICLES_ENABLED:
        return jsonify({"success": False, "error": "Articles feature not available"})
    
    if index < 0 or index >= len(state["tours"]):
        return jsonify({"success": False, "error": "Invalid tour index"})
    
    tour = state["tours"][index]
    tripster_id = tour.get("tripster_id")
    folder = get_tour_folder(tour["country"], tour["city"], tripster_id)
    
    add_log(f"Конвертация изображений в WebP...", "info")
    
    converted = convert_tour_images_to_webp(folder)
    
    add_log(f"Конвертировано {len(converted)} изображений", "success")
    
    return jsonify({
        "success": True,
        "converted": len(converted),
        "files": [os.path.basename(f) for f in converted]
    })


@app.route('/api/articles/batch-generate', methods=['POST'])
def api_batch_generate_articles():
    """Пакетная генерация статей для обработанных туров"""
    if not ARTICLES_ENABLED:
        return jsonify({"success": False, "error": "Articles feature not available"})
    
    if state["is_running"]:
        return jsonify({"success": False, "error": "Already running"})
    
    if not state["api_key"]:
        return jsonify({"success": False, "error": "API key not set"})
    
    data = request.json or {}
    start_index = data.get("start", 0)
    count = data.get("count", 10)
    articles_per_tour = data.get("articles_per_tour", 2)
    
    state["is_running"] = True
    state["current_index"] = start_index
    
    def generate_batch():
        end_index = min(start_index + count, len(state["tours"]))
        generated_count = 0
        
        for i in range(start_index, end_index):
            if not state["is_running"]:
                break
            
            state["current_index"] = i
            
            tour = state["tours"][i]
            tripster_id = tour.get("tripster_id")
            folder = get_tour_folder(tour["country"], tour["city"], tripster_id)
            
            # Проверяем, есть ли уже статьи
            articles_file = os.path.join(folder, "articles.json")
            if os.path.exists(articles_file):
                add_log(f"[{i+1}] Статьи уже есть, пропуск...", "info")
                continue
            
            # Загружаем данные тура
            saved = load_tour_data(folder)
            if not saved or saved.get("status") not in ["processed", "uploaded"]:
                add_log(f"[{i+1}] Тур не обработан, пропуск...", "warning")
                continue
            
            tour_data = saved.get("rewritten", tour)
            tour_data["country"] = tour.get("country", "")
            tour_data["city"] = tour.get("city", "")
            tour_data["photo_urls"] = tour.get("photo_urls", [])
            
            add_log(f"[{i+1}/{end_index}] Генерация статей: {tour_data.get('title', '')[:40]}...", "info")
            
            # Генерируем статьи
            articles = run_async(generate_articles_for_tour(
                tour_data, 
                state["api_key"], 
                state["model"],
                articles_per_tour
            ))
            
            if articles:
                with open(articles_file, "w", encoding="utf-8") as f:
                    json.dump(articles, f, ensure_ascii=False, indent=2)
                generated_count += len(articles)
                add_log(f"[{i+1}] Сгенерировано {len(articles)} статей", "success")
            else:
                add_log(f"[{i+1}] Ошибка генерации", "error")
            
            time.sleep(3)  # Пауза между запросами
        
        state["is_running"] = False
        add_log(f"Пакетная генерация завершена! Всего статей: {generated_count}", "success")
    
    thread = threading.Thread(target=generate_batch)
    thread.daemon = True
    thread.start()
    
    return jsonify({
        "success": True,
        "message": f"Генерация статей для туров {start_index} - {start_index + count}"
    })


@app.route('/api/articles/batch-upload', methods=['POST'])
def api_batch_upload_articles():
    """Пакетная загрузка всех статей на сервер"""
    if not ARTICLES_ENABLED:
        return jsonify({"success": False, "error": "Articles feature not available"})
    
    if not state["turex_token"]:
        return jsonify({"success": False, "error": "Not logged in to Inturex"})
    
    if state["is_running"]:
        return jsonify({"success": False, "error": "Already running"})
    
    state["is_running"] = True
    
    def upload_all_articles():
        uploaded_count = 0
        errors_count = 0
        
        if os.path.exists(TOURS_DIR):
            for country in os.listdir(TOURS_DIR):
                country_path = os.path.join(TOURS_DIR, country)
                if not os.path.isdir(country_path):
                    continue
                    
                for city in os.listdir(country_path):
                    city_path = os.path.join(country_path, city)
                    if not os.path.isdir(city_path):
                        continue
                        
                    for tour_id in os.listdir(city_path):
                        if not state["is_running"]:
                            break
                            
                        tour_path = os.path.join(city_path, tour_id)
                        if not os.path.isdir(tour_path):
                            continue
                        
                        articles_file = os.path.join(tour_path, "articles.json")
                        if not os.path.exists(articles_file):
                            continue
                        
                        with open(articles_file, "r", encoding="utf-8") as f:
                            articles = json.load(f)
                        
                        # Пропускаем если уже загружены
                        if all(a.get("turex_id") for a in articles):
                            continue
                        
                        # Получаем фото тура
                        tour_data = load_tour_data(tour_path)
                        photo_urls = tour_data.get("original", {}).get("photo_urls", []) if tour_data else []
                        
                        for i, article in enumerate(articles):
                            if article.get("turex_id"):
                                continue
                            
                            photo_url = photo_urls[i % len(photo_urls)] if photo_urls else ""
                            
                            add_log(f"Загрузка: {article.get('title', '')[:40]}...", "info")
                            
                            result = upload_article(article, photo_url, state["turex_token"])
                            
                            if result["success"]:
                                article["turex_id"] = result.get("article_id")
                                article["slug"] = result.get("slug")
                                uploaded_count += 1
                                add_log(f"OK: #{result.get('article_id')}", "success")
                            else:
                                errors_count += 1
                                add_log(f"Ошибка: {result.get('error', '')[:50]}", "error")
                            
                            time.sleep(0.5)
                        
                        # Сохраняем обновлённые статьи
                        with open(articles_file, "w", encoding="utf-8") as f:
                            json.dump(articles, f, ensure_ascii=False, indent=2)
        
        state["is_running"] = False
        add_log(f"Загрузка завершена! Успешно: {uploaded_count}, Ошибок: {errors_count}", "success")
    
    thread = threading.Thread(target=upload_all_articles)
    thread.daemon = True
    thread.start()
    
    return jsonify({
        "success": True,
        "message": "Загрузка статей запущена в фоне"
    })


@app.route('/api/articles/delete-all', methods=['POST'])
def api_delete_all_articles():
    """Удаляет ВСЕ статьи с сервера Inturex"""
    if not state["turex_token"]:
        return jsonify({"success": False, "error": "Not logged in to Inturex"})
    
    add_log("Получение списка статей с сервера...", "info")
    
    headers = {
        "Authorization": f"Bearer {state['turex_token']}",
        "Content-Type": "application/json"
    }
    
    try:
        # Получаем все статьи
        response = requests.get(
            f"{TUREX_API_URL}/api/v1/articles/",
            headers=headers,
            params={"limit": 1000},  # Получаем до 1000 статей
            timeout=60
        )
        
        if response.status_code != 200:
            return jsonify({"success": False, "error": f"Не удалось получить статьи: {response.status_code}"})
        
        data = response.json()
        # API возвращает {"articles": [...], "total": N}
        articles = data.get("articles", []) if isinstance(data, dict) else data
        total = len(articles)
        
        if total == 0:
            add_log("Статей на сервере нет", "info")
            return jsonify({"success": True, "deleted": 0, "message": "Статей нет"})
        
        add_log(f"Найдено {total} статей на сервере. Удаляем...", "warning")
        
        deleted = 0
        errors = []
        
        for article in articles:
            article_id = article.get("id")
            if not article_id:
                continue
            
            try:
                del_resp = requests.delete(
                    f"{TUREX_API_URL}/api/v1/articles/{article_id}",
                    headers=headers,
                    timeout=30
                )
                
                if del_resp.status_code in [200, 204]:
                    deleted += 1
                    if deleted % 10 == 0:
                        add_log(f"Удалено {deleted}/{total}...", "info")
                else:
                    errors.append(f"#{article_id}: {del_resp.status_code}")
                    
            except Exception as e:
                errors.append(f"#{article_id}: {str(e)[:30]}")
            
            time.sleep(0.1)  # Небольшая пауза
        
        add_log(f"Удалено {deleted} статей с сервера!", "success")
        
        # Также очищаем локальные turex_id
        if os.path.exists(TOURS_DIR):
            for country in os.listdir(TOURS_DIR):
                country_path = os.path.join(TOURS_DIR, country)
                if not os.path.isdir(country_path):
                    continue
                for city in os.listdir(country_path):
                    city_path = os.path.join(country_path, city)
                    if not os.path.isdir(city_path):
                        continue
                    for tour_id in os.listdir(city_path):
                        tour_path = os.path.join(city_path, tour_id)
                        articles_file = os.path.join(tour_path, "articles.json")
                        if os.path.exists(articles_file):
                            try:
                                with open(articles_file, "r", encoding="utf-8") as f:
                                    local_articles = json.load(f)
                                # Убираем turex_id
                                for a in local_articles:
                                    if "turex_id" in a:
                                        del a["turex_id"]
                                    if "slug" in a:
                                        del a["slug"]
                                with open(articles_file, "w", encoding="utf-8") as f:
                                    json.dump(local_articles, f, ensure_ascii=False, indent=2)
                            except:
                                pass
        
        return jsonify({
            "success": True,
            "deleted": deleted,
            "errors": errors if errors else None,
            "message": f"Удалено {deleted} статей с сервера"
        })
        
    except Exception as e:
        add_log(f"Ошибка удаления: {str(e)}", "error")
        return jsonify({"success": False, "error": str(e)})


@app.route('/api/articles/stats')
def api_articles_stats():
    """Статистика по статьям"""
    total_articles = 0
    uploaded_articles = 0
    tours_with_articles = 0
    
    if os.path.exists(TOURS_DIR):
        for country in os.listdir(TOURS_DIR):
            country_path = os.path.join(TOURS_DIR, country)
            if not os.path.isdir(country_path):
                continue
            for city in os.listdir(country_path):
                city_path = os.path.join(country_path, city)
                if not os.path.isdir(city_path):
                    continue
                for tour_id in os.listdir(city_path):
                    tour_path = os.path.join(city_path, tour_id)
                    if not os.path.isdir(tour_path):
                        continue
                    
                    articles_file = os.path.join(tour_path, "articles.json")
                    if os.path.exists(articles_file):
                        tours_with_articles += 1
                        with open(articles_file, "r", encoding="utf-8") as f:
                            articles = json.load(f)
                        total_articles += len(articles)
                        uploaded_articles += sum(1 for a in articles if a.get("turex_id"))
    
    return jsonify({
        "success": True,
        "total_articles": total_articles,
        "uploaded_articles": uploaded_articles,
        "tours_with_articles": tours_with_articles,
        "articles_enabled": ARTICLES_ENABLED
    })


if __name__ == '__main__':
    print("=" * 60)
    print("Tour Rewriter Pro")
    print("=" * 60)
    print(f"\nТуры сохраняются в: {TOURS_DIR}")
    print("\nОткройте в браузере: http://localhost:5000")
    print("=" * 60)
    app.run(debug=True, port=5000)
