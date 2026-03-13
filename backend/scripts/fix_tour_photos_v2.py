"""
Скрипт для исправления URL фотографий туров (v2).
Сопоставляет туры по названию из JSON файлов.

Запуск: python backend/scripts/fix_tour_photos_v2.py
"""

import asyncio
import os
import sys
import json
from pathlib import Path

# Фикс кодировки для Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Добавляем путь к backend
sys.path.insert(0, str(Path(__file__).parent.parent))

import asyncpg

# Путь к папке с турами в tour_rewriter
TOURS_DIR = Path(__file__).parent.parent.parent / "tour_rewriter" / "tours"


def normalize_title(title: str) -> str:
    """Нормализует название для сравнения"""
    if not title:
        return ""
    # Убираем лишние пробелы, приводим к нижнему регистру
    return " ".join(title.lower().split())


async def main():
    """Основная функция"""
    
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        # Пробуем загрузить из .env
        env_file = Path(__file__).parent.parent / ".env"
        if env_file.exists():
            with open(env_file) as f:
                for line in f:
                    if line.startswith("DATABASE_URL="):
                        database_url = line.split("=", 1)[1].strip().strip('"')
                        break
    
    if not database_url:
        print("❌ DATABASE_URL не найден!")
        return
    
    # Конвертируем URL для asyncpg
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgres://", 1)
    
    print("🔄 Подключаемся к базе данных...")
    conn = await asyncpg.connect(database_url)
    
    try:
        # Получаем ВСЕ туры
        tours = await conn.fetch("""
            SELECT id, title, photos 
            FROM tours 
            ORDER BY id
        """)
        
        print(f"📋 Всего туров в БД: {len(tours)}")
        
        # Собираем все оригинальные URL из JSON файлов
        print("\n📂 Загружаем оригинальные URL из JSON файлов...")
        
        # Словарь: normalized_title -> photo_urls
        title_to_photos = {}
        # Словарь: tripster_id -> photo_urls  
        tripster_to_photos = {}
        
        for country_dir in TOURS_DIR.iterdir():
            if not country_dir.is_dir():
                continue
            for city_dir in country_dir.iterdir():
                if not city_dir.is_dir():
                    continue
                for tour_dir in city_dir.iterdir():
                    if not tour_dir.is_dir():
                        continue
                    
                    data_file = tour_dir / "data.json"
                    if data_file.exists():
                        try:
                            with open(data_file, "r", encoding="utf-8") as f:
                                data = json.load(f)
                            
                            original = data.get("original", {})
                            rewritten = data.get("rewritten", {})
                            
                            tripster_id = original.get("tripster_id")
                            photo_urls = original.get("photo_urls", [])
                            
                            # Название из rewritten (то что загружено в БД)
                            rewritten_title = rewritten.get("title", "")
                            # Название из original
                            original_title = original.get("title", "")
                            
                            if photo_urls:
                                if tripster_id:
                                    tripster_to_photos[str(tripster_id)] = photo_urls
                                
                                if rewritten_title:
                                    norm_title = normalize_title(rewritten_title)
                                    title_to_photos[norm_title] = photo_urls
                                
                                if original_title:
                                    norm_title = normalize_title(original_title)
                                    if norm_title not in title_to_photos:
                                        title_to_photos[norm_title] = photo_urls
                        except Exception as e:
                            print(f"  Ошибка чтения {data_file}: {e}")
        
        print(f"   Загружено {len(title_to_photos)} уникальных названий")
        print(f"   Загружено {len(tripster_to_photos)} tripster_id")
        
        # Обновляем туры
        updated = 0
        not_found = 0
        
        for tour in tours:
            tour_id = tour["id"]
            title = tour["title"] or ""
            title_short = title[:50] if title else f"Tour {tour_id}"
            
            # Нормализуем название тура из БД
            norm_db_title = normalize_title(title)
            
            # Пытаемся найти по названию
            original_urls = title_to_photos.get(norm_db_title)
            
            if not original_urls:
                # Пробуем частичное совпадение
                for json_title, urls in title_to_photos.items():
                    # Если начало названия совпадает (первые 30 символов)
                    if norm_db_title[:30] == json_title[:30]:
                        original_urls = urls
                        break
            
            if not original_urls:
                # Пробуем по tripster_id = tour_id
                original_urls = tripster_to_photos.get(str(tour_id))
            
            if original_urls:
                # Обновляем
                await conn.execute("""
                    UPDATE tours 
                    SET photos = $1::jsonb
                    WHERE id = $2
                """, json.dumps(original_urls), tour_id)
                
                print(f"✅ [{tour_id}] {title_short} - {len(original_urls)} фото")
                updated += 1
            else:
                not_found += 1
                print(f"⚠️ [{tour_id}] {title_short} - не найдено")
        
        print(f"\n{'='*50}")
        print(f"✅ Обновлено: {updated}")
        print(f"⚠️ Не найдено: {not_found}")
        print(f"{'='*50}")
        
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())

