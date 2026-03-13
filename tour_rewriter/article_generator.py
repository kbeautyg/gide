# -*- coding: utf-8 -*-
"""
Article Generator Pro - Генератор статей для журнала из туров
Модуль для генерации 2-3 статей на каждый тур через ChatGPT

Интегрируется с Tour Rewriter Pro
"""

import json
import os
import asyncio
import re
import requests
from datetime import datetime
from PIL import Image
import io
import openai

# ============ ПРОМПТЫ ДЛЯ ГЕНЕРАЦИИ СТАТЕЙ ============

ARTICLE_TYPES = {
    "guide": {
        "name": "Путеводитель",
        "description": "Подробный гайд по локации",
        "prompt": """Ты — опытный travel-блогер и SEO-копирайтер. Напиши подробную статью-путеводитель на основе данных об экскурсии.

ТРЕБОВАНИЯ К СТАТЬЕ:
1. ЗАГОЛОВОК: Привлекательный, с ключевыми словами (город, страна). 50-80 символов.
2. ПРЕВЬЮ: 150-200 символов. Завлекающее описание для карточки статьи.
3. КОНТЕНТ: Минимум 1500-2000 слов. Структурированный markdown с заголовками ## и списками.
4. СТИЛЬ: Живой, увлекательный, как будто пишет друг-путешественник.

СТРУКТУРА КОНТЕНТА:
- Вступление (2-3 абзаца): почему стоит посетить это место
- ## Что посмотреть: основные достопримечательности из экскурсии
- ## Лучшее время для посещения: когда ехать
- ## Практические советы: что взять, как добраться
- ## Местная кухня: что попробовать
- ## Заключение: краткий итог

ПРАВИЛА:
- НЕ упоминай цены, стоимость
- НЕ рекламируй напрямую экскурсию
- Пиши от первого лица множественного ("мы советуем", "вы увидите")
- Используй эмодзи умеренно (1-2 на раздел максимум)
- Добавляй интересные факты и лайфхаки

ДАННЫЕ ОБ ЭКСКУРСИИ:
{tour_data}

Верни JSON (без ```json):
{{
    "title": "SEO-заголовок статьи",
    "preview_text": "Превью 150-200 символов для карточки",
    "content": "Полный текст статьи в markdown",
    "read_time": 8,
    "category": "Путеводители"
}}"""
    },
    
    "tips": {
        "name": "Советы путешественникам",
        "description": "Практические советы и лайфхаки",
        "prompt": """Ты — опытный путешественник, который делится лайфхаками. Напиши статью с практическими советами на основе данных об экскурсии.

ТРЕБОВАНИЯ К СТАТЬЕ:
1. ЗАГОЛОВОК: Формат "X советов для путешествия в [Город/Страна]" или "Что нужно знать перед поездкой в [Город]"
2. ПРЕВЬЮ: 150-200 символов. Обещание полезной информации.
3. КОНТЕНТ: Минимум 1200-1500 слов. Список советов с пояснениями.
4. СТИЛЬ: Дружеский, как совет от бывалого путешественника.

СТРУКТУРА КОНТЕНТА:
- Вступление: почему эти советы важны
- ## Совет 1-10 (или больше): практические рекомендации
- Каждый совет: заголовок + 2-3 абзаца объяснения
- ## Бонус: секретный совет от местных
- Заключение: пожелание удачного путешествия

ТЕМЫ СОВЕТОВ (выбери релевантные):
- Когда лучше ехать
- Что взять с собой
- Как добраться
- Где остановиться (без конкретных отелей)
- Местный транспорт
- Безопасность
- Культурные особенности
- Что попробовать
- Сувениры
- Фото-локации

ДАННЫЕ ОБ ЭКСКУРСИИ:
{tour_data}

Верни JSON (без ```json):
{{
    "title": "SEO-заголовок статьи",
    "preview_text": "Превью 150-200 символов для карточки",
    "content": "Полный текст статьи в markdown",
    "read_time": 6,
    "category": "Советы"
}}"""
    },
    
    "culture": {
        "name": "Культура и традиции",
        "description": "Погружение в местную культуру",
        "prompt": """Ты — культуролог и travel-журналист. Напиши увлекательную статью о культуре и традициях места на основе данных об экскурсии.

ТРЕБОВАНИЯ К СТАТЬЕ:
1. ЗАГОЛОВОК: Интригующий, про культуру/историю. Примеры: "Тайны храмов [Город]", "Погружение в культуру [Страна]"
2. ПРЕВЬЮ: 150-200 символов. Обещание культурного открытия.
3. КОНТЕНТ: Минимум 1500-2000 слов. Исторический и культурный контекст.
4. СТИЛЬ: Познавательный, но не скучный. Как документальный фильм.

СТРУКТУРА КОНТЕНТА:
- Вступление: что делает это место уникальным
- ## История: краткий исторический экскурс
- ## Традиции: местные обычаи и праздники
- ## Архитектура/Искусство: что отражает культуру
- ## Люди: характер местных жителей
- ## Как прикоснуться к культуре: что сделать туристу
- Заключение: почему это меняет восприятие

ПРАВИЛА:
- Используй интересные исторические факты
- Добавляй цитаты мудрецов или поговорки
- Описывай атмосферу и ощущения
- Связывай прошлое с настоящим

ДАННЫЕ ОБ ЭКСКУРСИИ:
{tour_data}

Верни JSON (без ```json):
{{
    "title": "SEO-заголовок статьи",
    "preview_text": "Превью 150-200 символов для карточки",
    "content": "Полный текст статьи в markdown",
    "read_time": 10,
    "category": "Культура"
}}"""
    },
    
    "food": {
        "name": "Гастрономия",
        "description": "Местная кухня и рестораны",
        "prompt": """Ты — гастрономический критик и food-блогер. Напиши аппетитную статью о местной кухне на основе данных об экскурсии.

ТРЕБОВАНИЯ К СТАТЬЕ:
1. ЗАГОЛОВОК: Аппетитный, про еду. Примеры: "Что попробовать в [Город]: гастрономический гид", "Вкусы [Страна]: путешествие для гурманов"
2. ПРЕВЬЮ: 150-200 символов. Описание, вызывающее аппетит.
3. КОНТЕНТ: Минимум 1200-1500 слов. Описание блюд и кулинарных традиций.
4. СТИЛЬ: Чувственный, с описанием вкусов и ароматов.

СТРУКТУРА КОНТЕНТА:
- Вступление: чем уникальна местная кухня
- ## Главные блюда: топ-5-10 must-try
- ## Уличная еда: что попробовать на рынках
- ## Напитки: от чая до алкоголя
- ## Десерты: сладкое завершение
- ## Где есть: типы заведений (без конкретных названий)
- ## Советы гурманам: как заказывать, что избегать
- Заключение: как еда раскрывает культуру

ПРАВИЛА:
- Описывай текстуры, ароматы, вкусы
- Добавляй историю происхождения блюд
- Упоминай локальные ингредиенты
- НЕ указывай конкретные рестораны и цены

ДАННЫЕ ОБ ЭКСКУРСИИ:
{tour_data}

Верни JSON (без ```json):
{{
    "title": "SEO-заголовок статьи",
    "preview_text": "Превью 150-200 символов для карточки",
    "content": "Полный текст статьи в markdown",
    "read_time": 7,
    "category": "Гастрономия"
}}"""
    },
    
    "top_places": {
        "name": "Топ мест",
        "description": "Список лучших мест для посещения",
        "prompt": """Ты — travel-эксперт. Напиши статью-подборку лучших мест на основе данных об экскурсии.

ТРЕБОВАНИЯ К СТАТЬЕ:
1. ЗАГОЛОВОК: Формат "Топ-X мест в [Город]", "X достопримечательностей [Страна], которые нельзя пропустить"
2. ПРЕВЬЮ: 150-200 символов. Обещание открытий.
3. КОНТЕНТ: Минимум 1500-2000 слов. Список мест с подробным описанием.
4. СТИЛЬ: Вдохновляющий, с личными впечатлениями.

СТРУКТУРА КОНТЕНТА:
- Вступление: почему эти места особенные
- ## 1. [Место]: описание, почему стоит посетить, лучшее время, советы
- ## 2. [Место]: ...
- ... (8-12 мест)
- ## Бонус: секретное место, о котором мало кто знает
- Заключение: как спланировать маршрут

ПРАВИЛА:
- Каждое место: 100-150 слов
- Добавляй практические советы
- Упоминай лучшее время для фото
- Описывай атмосферу

ДАННЫЕ ОБ ЭКСКУРСИИ:
{tour_data}

Верни JSON (без ```json):
{{
    "title": "SEO-заголовок статьи",
    "preview_text": "Превью 150-200 символов для карточки",
    "content": "Полный текст статьи в markdown",
    "read_time": 12,
    "category": "Путеводители"
}}"""
    }
}


# ============ ФУНКЦИИ ГЕНЕРАЦИИ ============

async def generate_article(tour_data: dict, article_type: str, api_key: str, model: str = "gpt-4o-mini") -> dict:
    """Генерирует статью определённого типа для тура"""
    
    if article_type not in ARTICLE_TYPES:
        return {"success": False, "error": f"Unknown article type: {article_type}"}
    
    article_config = ARTICLE_TYPES[article_type]
    
    # Подготавливаем данные тура (без фоток для GPT)
    tour_for_gpt = {
        "title": tour_data.get("title", ""),
        "location": tour_data.get("location", ""),
        "country": tour_data.get("country", ""),
        "city": tour_data.get("city", ""),
        "description": tour_data.get("description", tour_data.get("annotation", "")),
        "what_to_expect": tour_data.get("what_to_expect", ""),
        "landmarks": tour_data.get("landmarks", []),
        "tags": tour_data.get("tags", []),
        "themes": tour_data.get("themes", []),
    }
    
    tour_json = json.dumps(tour_for_gpt, ensure_ascii=False, indent=2)
    prompt = article_config["prompt"].format(tour_data=tour_json)
    
    client = openai.AsyncOpenAI(api_key=api_key)
    
    try:
        use_new_param = any(x in model.lower() for x in ["gpt-5", "gpt-4.1", "o1", "o3", "o4", "chatgpt"])
        
        params = {
            "model": model,
            "messages": [
                {"role": "system", "content": "Ты профессиональный travel-копирайтер. Отвечай только валидным JSON."},
                {"role": "user", "content": prompt}
            ],
        }
        
        if use_new_param:
            params["max_completion_tokens"] = 16000
        else:
            params["temperature"] = 0.8  # Больше креативности для статей
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
        
        # Добавляем метаданные
        result["article_type"] = article_type
        result["country_tag"] = tour_data.get("country", "")
        result["tour_title"] = tour_data.get("title", "")
        result["generated_at"] = datetime.now().isoformat()
        
        return {"success": True, "data": result}
        
    except json.JSONDecodeError as e:
        return {"success": False, "error": f"JSON parse error: {e}", "raw": content[:500] if 'content' in dir() else ""}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def generate_articles_for_tour(tour_data: dict, api_key: str, model: str = "gpt-4o-mini", count: int = 2) -> list:
    """Генерирует несколько статей для одного тура"""
    
    # Выбираем типы статей в зависимости от тегов тура
    tags = tour_data.get("tags", [])
    themes = tour_data.get("themes", [])
    
    # Приоритет типов статей
    article_types_priority = []
    
    # Всегда добавляем путеводитель
    article_types_priority.append("guide")
    
    # В зависимости от тематики
    if any(t in str(tags + themes).lower() for t in ["храм", "музей", "история", "культура", "традиции", "буддизм"]):
        article_types_priority.append("culture")
    
    if any(t in str(tags + themes).lower() for t in ["еда", "гастрономия", "кухня", "рынок", "ресторан"]):
        article_types_priority.append("food")
    
    # Советы подходят всегда
    article_types_priority.append("tips")
    
    # Топ мест для обзорных экскурсий
    if any(t in str(tags + themes).lower() for t in ["обзорная", "город", "достопримечательности", "панорама"]):
        article_types_priority.append("top_places")
    
    # Убираем дубликаты и берём нужное количество
    seen = set()
    unique_types = []
    for t in article_types_priority:
        if t not in seen:
            seen.add(t)
            unique_types.append(t)
    
    selected_types = unique_types[:count]
    
    # Генерируем статьи
    articles = []
    for article_type in selected_types:
        print(f"    Generating {article_type} article...")
        result = await generate_article(tour_data, article_type, api_key, model)
        if result["success"]:
            articles.append(result["data"])
            print(f"      OK: {result['data'].get('title', '')[:50]}...")
        else:
            print(f"      ERROR: {result.get('error', 'Unknown')[:50]}")
    
    return articles


# ============ КОНВЕРТАЦИЯ ИЗОБРАЖЕНИЙ В WEBP ============

def convert_to_webp(input_path: str, output_path: str = None, quality: int = 85) -> str:
    """Конвертирует изображение в WebP формат"""
    try:
        if output_path is None:
            base = os.path.splitext(input_path)[0]
            output_path = f"{base}.webp"
        
        with Image.open(input_path) as img:
            # Конвертируем в RGB если нужно
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Оптимизируем размер для веба
            max_size = 1920
            if img.width > max_size or img.height > max_size:
                img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            img.save(output_path, 'WEBP', quality=quality, method=6)
        
        return output_path
    except Exception as e:
        print(f"Error converting to WebP: {e}")
        return None


def convert_tour_images_to_webp(tour_folder: str) -> list:
    """Конвертирует все изображения тура в WebP"""
    images_dir = os.path.join(tour_folder, "images")
    if not os.path.exists(images_dir):
        return []
    
    webp_dir = os.path.join(tour_folder, "images_webp")
    os.makedirs(webp_dir, exist_ok=True)
    
    converted = []
    for filename in os.listdir(images_dir):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            input_path = os.path.join(images_dir, filename)
            output_filename = os.path.splitext(filename)[0] + '.webp'
            output_path = os.path.join(webp_dir, output_filename)
            
            # Пропускаем если уже конвертировано
            if os.path.exists(output_path):
                converted.append(output_path)
                continue
            
            result = convert_to_webp(input_path, output_path)
            if result:
                converted.append(result)
                print(f"    Converted: {filename} -> {output_filename}")
    
    return converted


# ============ ЗАГРУЗКА СТАТЕЙ НА СЕРВЕР ============

TUREX_API_URL = "https://gide-production.up.railway.app"

def upload_article(article_data: dict, photo_url: str, token: str) -> dict:
    """Загружает статью на сервер Turex"""
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json; charset=utf-8"
    }
    
    # slug генерируется автоматически на сервере
    payload = {
        "title": article_data.get("title", "Без названия"),
        "preview_text": article_data.get("preview_text", ""),
        "content": article_data.get("content", ""),
        "photo_url": photo_url or "",
        "read_time": article_data.get("read_time", 5),
        "country_tag": article_data.get("country_tag", "")
    }
    
    try:
        response = requests.post(
            f"{TUREX_API_URL}/api/v1/articles/",
            json=payload,
            headers=headers,
            timeout=60
        )
        
        if response.status_code in [200, 201]:
            result = response.json()
            return {"success": True, "article_id": result.get("id"), "slug": result.get("slug")}
        else:
            return {"success": False, "error": f"Upload failed: {response.status_code} - {response.text[:200]}"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}


def upload_articles_for_tour(articles: list, tour_data: dict, token: str) -> list:
    """Загружает все статьи для тура"""
    
    results = []
    photo_urls = tour_data.get("photo_urls", [])
    
    for i, article in enumerate(articles):
        # Используем разные фото для разных статей
        photo_url = photo_urls[i % len(photo_urls)] if photo_urls else ""
        
        print(f"    Uploading article: {article.get('title', '')[:50]}...")
        result = upload_article(article, photo_url, token)
        
        if result["success"]:
            print(f"      OK: Article #{result['article_id']} uploaded")
            article["turex_id"] = result["article_id"]
            article["slug"] = result["slug"]
        else:
            print(f"      ERROR: {result.get('error', 'Unknown')[:50]}")
        
        results.append(result)
    
    return results


# ============ ТЕСТИРОВАНИЕ ============

if __name__ == "__main__":
    # Тест генерации статьи
    test_tour = {
        "title": "Обзорная экскурсия по Бангкоку",
        "location": "Бангкок, Таиланд",
        "country": "Таиланд",
        "city": "Бангкок",
        "description": "Откройте для себя столицу Таиланда: величественные храмы, шумные рынки и вкуснейшую уличную еду.",
        "what_to_expect": "Посещение Большого дворца, храма Ват Арун, плавучего рынка",
        "landmarks": ["Большой дворец", "Храм Ват Арун", "Храм Ват Пхо", "Река Чаопрайя"],
        "tags": ["Храмы", "История", "Культура", "Гастрономия"],
        "themes": ["История и Культура", "Гастрономия"]
    }
    
    print("Article Generator Pro - Test Mode")
    print("=" * 50)
    print(f"Tour: {test_tour['title']}")
    print("=" * 50)
    
    # Показываем доступные типы статей
    for key, config in ARTICLE_TYPES.items():
        print(f"  - {key}: {config['name']} - {config['description']}")

