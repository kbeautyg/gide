"""
Скрипт для скачивания фотографий туров с Tripster
Сохраняет изображения локально для использования на нашем сайте
"""

import os
import json
import glob
import requests
import hashlib
from urllib.parse import urlparse
import time

# Папка для сохранения изображений
IMAGES_DIR = "downloaded_images"

# Маппинг стран
COUNTRY_MAP = {
    "thailand": "thailand",
    "vietnam": "vietnam", 
    "china": "china",
    "japan": "japan",
    "indonesia": "indonesia",
    "india": "india",
    "turkey": "turkey",
    "uae": "uae",
    "korea": "korea",
    "singapore": "singapore",
    "malaysia": "malaysia"
}


def get_image_filename(url, tour_id, index):
    """Генерирует имя файла для изображения"""
    # Получаем расширение из URL
    parsed = urlparse(url)
    path = parsed.path
    ext = os.path.splitext(path)[1] or '.jpg'
    
    # Создаём уникальное имя
    return f"tour_{tour_id}_{index}{ext}"


def download_image(url, save_path):
    """Скачивает изображение по URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return True
        else:
            print(f"  Error {response.status_code} for {url}")
            return False
    except Exception as e:
        print(f"  Exception downloading {url}: {e}")
        return False


def extract_images_from_tour(tour_data):
    """Извлекает все URL изображений из данных тура"""
    images = []
    
    # Главное фото
    if 'photo' in tour_data and tour_data['photo']:
        photo = tour_data['photo']
        if isinstance(photo, dict):
            # Берём самое большое изображение
            for size in ['big', 'medium', 'small', 'original']:
                if size in photo and photo[size]:
                    images.append(photo[size])
                    break
        elif isinstance(photo, str):
            images.append(photo)
    
    # Галерея фото
    if 'photos' in tour_data and tour_data['photos']:
        for photo in tour_data['photos']:
            if isinstance(photo, dict):
                for size in ['big', 'medium', 'small', 'original']:
                    if size in photo and photo[size]:
                        images.append(photo[size])
                        break
            elif isinstance(photo, str):
                images.append(photo)
    
    # Убираем дубликаты, сохраняя порядок
    seen = set()
    unique_images = []
    for img in images:
        if img not in seen:
            seen.add(img)
            unique_images.append(img)
    
    return unique_images


def process_json_file(file_path, country_code):
    """Обрабатывает JSON файл и скачивает изображения"""
    print(f"\nProcessing: {file_path}")
    
    # Создаём папку для страны
    country_dir = os.path.join(IMAGES_DIR, country_code)
    os.makedirs(country_dir, exist_ok=True)
    
    # Читаем JSON
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            try:
                data, _ = json.JSONDecoder().raw_decode(content)
            except json.JSONDecodeError:
                start = content.find('{')
                if start != -1:
                    data, _ = json.JSONDecoder().raw_decode(content[start:])
                else:
                    print(f"  Could not parse JSON")
                    return 0, 0
    except Exception as e:
        print(f"  Error reading file: {e}")
        return 0, 0
    
    results = data.get("results", [])
    print(f"  Found {len(results)} tours")
    
    total_images = 0
    downloaded_images = 0
    
    # Файл для маппинга старых URL -> новых путей
    mapping = {}
    
    for tour in results:
        tour_id = tour.get('id', 'unknown')
        images = extract_images_from_tour(tour)
        
        if not images:
            continue
        
        tour_dir = os.path.join(country_dir, str(tour_id))
        os.makedirs(tour_dir, exist_ok=True)
        
        for i, img_url in enumerate(images):
            total_images += 1
            filename = get_image_filename(img_url, tour_id, i)
            save_path = os.path.join(tour_dir, filename)
            
            # Пропускаем если уже скачано
            if os.path.exists(save_path):
                print(f"  [SKIP] {filename} already exists")
                mapping[img_url] = save_path
                downloaded_images += 1
                continue
            
            print(f"  Downloading: {filename}")
            if download_image(img_url, save_path):
                mapping[img_url] = save_path
                downloaded_images += 1
                time.sleep(0.5)  # Пауза между запросами
            else:
                print(f"  [FAIL] Could not download {img_url}")
    
    # Сохраняем маппинг
    mapping_file = os.path.join(country_dir, "url_mapping.json")
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)
    
    return total_images, downloaded_images


def create_master_mapping():
    """Создаёт общий маппинг tripster_id -> локальные пути к фото"""
    master_mapping = {}
    
    for country_dir in os.listdir(IMAGES_DIR):
        country_path = os.path.join(IMAGES_DIR, country_dir)
        if not os.path.isdir(country_path):
            continue
        
        for tour_id in os.listdir(country_path):
            tour_path = os.path.join(country_path, tour_id)
            if not os.path.isdir(tour_path):
                continue
            
            # Собираем все фото тура
            photos = []
            for filename in sorted(os.listdir(tour_path)):
                if filename.endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    photos.append(os.path.join(country_dir, tour_id, filename))
            
            if photos:
                master_mapping[tour_id] = {
                    "country": country_dir,
                    "photos": photos,
                    "main_photo": photos[0] if photos else None
                }
    
    # Сохраняем общий маппинг
    master_file = os.path.join(IMAGES_DIR, "master_mapping.json")
    with open(master_file, 'w', encoding='utf-8') as f:
        json.dump(master_mapping, f, ensure_ascii=False, indent=2)
    
    print(f"\nMaster mapping saved: {master_file}")
    print(f"Total tours with photos: {len(master_mapping)}")
    
    return master_mapping


def main():
    """Главная функция"""
    print("=" * 60)
    print("Tripster Image Downloader")
    print("=" * 60)
    
    # Создаём основную папку
    os.makedirs(IMAGES_DIR, exist_ok=True)
    
    # Определяем пути к JSON файлам
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    data_paths = [
        os.path.join(project_root, "backend", "data", "*.json"),
        os.path.join(script_dir, "data", "*.json"),
    ]
    
    files = []
    for path in data_paths:
        files.extend(glob.glob(path))
    
    if not files:
        print("No JSON files found!")
        return
    
    print(f"Found {len(files)} JSON files")
    
    total_all = 0
    downloaded_all = 0
    
    for file_path in files:
        filename = os.path.basename(file_path).replace(".json", "").lower()
        country_code = COUNTRY_MAP.get(filename, filename)
        
        total, downloaded = process_json_file(file_path, country_code)
        total_all += total
        downloaded_all += downloaded
    
    # Создаём общий маппинг
    master_mapping = create_master_mapping()
    
    print("\n" + "=" * 60)
    print(f"DONE! Downloaded {downloaded_all}/{total_all} images")
    print(f"Images saved to: {os.path.abspath(IMAGES_DIR)}")
    print(f"Use master_mapping.json to find photos by tripster_id")
    print("=" * 60)


if __name__ == "__main__":
    main()

