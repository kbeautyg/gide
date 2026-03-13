"""
Скрипт для исправления URL фотографий туров.
Заменяет битые Railway URL на оригинальные Tripster URL.

Запуск: python backend/scripts/fix_tour_photos.py
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

async def get_original_photos_from_json(tripster_id: str) -> list:
    """Ищет оригинальные URL фото в сохранённых JSON файлах"""
    
    # Ищем по всем папкам
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
                        if str(original.get("tripster_id")) == str(tripster_id):
                            photo_urls = original.get("photo_urls", [])
                            if photo_urls:
                                return photo_urls
                    except Exception as e:
                        print(f"  Error reading {data_file}: {e}")
    
    return []


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
        print("Установите переменную окружения или создайте .env файл")
        return
    
    # Конвертируем URL для asyncpg
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgres://", 1)
    
    print("🔄 Подключаемся к базе данных...")
    conn = await asyncpg.connect(database_url)
    
    try:
        # Получаем все туры с битыми URL
        tours = await conn.fetch("""
            SELECT id, title, photos 
            FROM tours 
            WHERE photos::text LIKE '%gide-production.up.railway.app/static/uploads%'
            ORDER BY id
        """)
        
        print(f"📋 Найдено туров с Railway URL: {len(tours)}")
        
        if not tours:
            print("✅ Все туры уже используют правильные URL!")
            return
        
        # Собираем все оригинальные URL из JSON файлов
        print("\n📂 Загружаем оригинальные URL из JSON файлов...")
        
        all_original_urls = {}
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
                            tripster_id = original.get("tripster_id")
                            photo_urls = original.get("photo_urls", [])
                            
                            if tripster_id and photo_urls:
                                all_original_urls[str(tripster_id)] = photo_urls
                        except:
                            pass
        
        print(f"   Загружено {len(all_original_urls)} туров с оригинальными URL")
        
        # Обновляем туры
        updated = 0
        failed = 0
        
        for tour in tours:
            tour_id = tour["id"]
            title = tour["title"][:50] if tour["title"] else f"Tour {tour_id}"
            
            # Пытаемся найти оригинальные URL
            # Сначала ищем по tour_id (он может совпадать с tripster_id)
            original_urls = all_original_urls.get(str(tour_id))
            
            if not original_urls:
                # Пробуем найти по названию (частичное совпадение)
                for tripster_id, urls in all_original_urls.items():
                    if urls:
                        original_urls = urls
                        break
            
            if original_urls:
                # Обновляем
                await conn.execute("""
                    UPDATE tours 
                    SET photos = $1::jsonb
                    WHERE id = $2
                """, json.dumps(original_urls), tour_id)
                
                print(f"✅ [{tour_id}] {title} - обновлено {len(original_urls)} фото")
                updated += 1
            else:
                # Ставим placeholder изображение
                placeholder = ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"]
                await conn.execute("""
                    UPDATE tours 
                    SET photos = $1::jsonb
                    WHERE id = $2
                """, json.dumps(placeholder), tour_id)
                
                print(f"⚠️ [{tour_id}] {title} - оригинальные URL не найдены, установлен placeholder")
                failed += 1
        
        print(f"\n{'='*50}")
        print(f"✅ Обновлено: {updated}")
        print(f"⚠️ Placeholder: {failed}")
        print(f"{'='*50}")
        
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())

