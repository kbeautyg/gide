import asyncio
import os
import sys
import httpx
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Define paths
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
STATIC_ROOT = os.path.join(backend_dir, "static")
COUNTRIES_DIR = os.path.join(STATIC_ROOT, "countries")

# Country Meta Data (Copied from destinations.py)
COUNTRY_META = {
    'Таиланд': 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&h=600&fit=crop',
    'ОАЭ': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
    'Турция': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop',
    'Япония': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop',
    'Южная Корея': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&h=600&fit=crop',
    'Индонезия': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop',
    'Вьетнам': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop',
    'Сингапур': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
    'Китай': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=600&fit=crop',
    'Индия': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop',
    'Малайзия': 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&h=600&fit=crop',
    'Шри-Ланка': 'https://images.unsplash.com/photo-1588258524675-c63d650d0a7a?w=800&h=600&fit=crop',
    'Камбоджа': 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&h=600&fit=crop',
    'Мьянма': 'https://images.unsplash.com/photo-1558862107-d49ef2a04d72?w=800&h=600&fit=crop',
    'Филиппины': 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&h=600&fit=crop',
    'Непал': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop',
    'default': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop'
}

# Mapping English filenames
FILENAME_MAP = {
    'Таиланд': 'thailand.jpg',
    'ОАЭ': 'uae.jpg',
    'Турция': 'turkey.jpg',
    'Япония': 'japan.jpg',
    'Южная Корея': 'south_korea.jpg',
    'Индонезия': 'indonesia.jpg',
    'Вьетнам': 'vietnam.jpg',
    'Сингапур': 'singapore.jpg',
    'Китай': 'china.jpg',
    'Индия': 'india.jpg',
    'Малайзия': 'malaysia.jpg',
    'Шри-Ланка': 'srilanka.jpg',
    'Камбоджа': 'cambodia.jpg',
    'Мьянма': 'myanmar.jpg',
    'Филиппины': 'philippines.jpg',
    'Непал': 'nepal.jpg',
    'default': 'default_country.jpg'
}

async def download_image(client, url, filename):
    filepath = os.path.join(COUNTRIES_DIR, filename)
    
    if os.path.exists(filepath):
        logger.info(f"Skipping {filename} (already exists)")
        return
        
    try:
        response = await client.get(url, follow_redirects=True, timeout=30.0)
        if response.status_code == 200:
            with open(filepath, 'wb') as f:
                f.write(response.content)
            logger.info(f"Downloaded {filename}")
        else:
            logger.error(f"Failed to download {url}: {response.status_code}")
    except Exception as e:
        logger.error(f"Error downloading {filename}: {e}")

async def main():
    os.makedirs(COUNTRIES_DIR, exist_ok=True)
    
    async with httpx.AsyncClient() as client:
        tasks = []
        for country, url in COUNTRY_META.items():
            filename = FILENAME_MAP.get(country, 'unknown.jpg')
            tasks.append(download_image(client, url, filename))
        
        await asyncio.gather(*tasks)
    
    logger.info("All country images processed.")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
