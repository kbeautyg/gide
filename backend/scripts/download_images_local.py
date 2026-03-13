import asyncio
import os
import sys
import hashlib
import logging
import httpx
from urllib.parse import urlparse
from sqlalchemy import select

# Add parent directory to path to allow imports
# Assuming this script is in backend/scripts/
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

from app.db.session import async_session
from app.models.tour import Tour

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

STATIC_ROOT = os.path.join(backend_dir, "static")
TOURS_IMAGES_DIR = os.path.join(STATIC_ROOT, "tours")

async def download_image(client, url, tour_id):
    """
    Downloads an image and saves it to static/tours/{tour_id}/
    Returns the new local path or the original URL if failed.
    """
    if not url or not isinstance(url, str):
        return url
        
    if not url.startswith('http'):
        return url
    
    # Create directory structure
    tour_dir = os.path.join(TOURS_IMAGES_DIR, str(tour_id))
    os.makedirs(tour_dir, exist_ok=True)
    
    # Generate filename hash
    url_hash = hashlib.md5(url.encode()).hexdigest()
    
    # Try to guess extension
    path = urlparse(url).path
    ext = os.path.splitext(path)[1]
    if not ext or len(ext) > 5:
        ext = '.jpg' # Default to jpg
        
    filename = f"{url_hash}{ext}"
    local_path = os.path.join(tour_dir, filename)
    relative_path = f"/static/tours/{tour_id}/{filename}"
    
    # Check if already exists
    if os.path.exists(local_path):
        return relative_path
        
    try:
        response = await client.get(url, timeout=15.0, follow_redirects=True)
        if response.status_code == 200:
            with open(local_path, 'wb') as f:
                f.write(response.content)
            logger.info(f"Downloaded {url} -> {relative_path}")
            return relative_path
        else:
            logger.warning(f"Failed to download {url}: Status {response.status_code}")
            return url
    except Exception as e:
        logger.error(f"Error downloading {url}: {e}")
        return url

async def main():
    logger.info("Starting image download process...")
    
    # Ensure static directory exists
    os.makedirs(TOURS_IMAGES_DIR, exist_ok=True)
    
    async with async_session() as session:
        # Get all tours
        result = await session.execute(select(Tour))
        tours = result.scalars().all()
        
        logger.info(f"Found {len(tours)} tours to process.")
        
        async with httpx.AsyncClient() as client:
            count = 0
            for tour in tours:
                if not tour.photos:
                    continue
                
                updated_photos = []
                changed = False
                
                # Process strictly the photos list
                for photo_url in tour.photos:
                    new_url = await download_image(client, photo_url, tour.id)
                    updated_photos.append(new_url)
                    if new_url != photo_url:
                        changed = True
                
                if changed:
                    tour.photos = updated_photos
                    session.add(tour)
                    count += 1
                    if count % 10 == 0:
                        logger.info(f"Processed {count} tours...")
                        await session.commit()
            
            await session.commit()
            logger.info(f"Finished! Updated {count} tours.")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
