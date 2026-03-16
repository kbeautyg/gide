"""
Скрипт миграции URL картинок в БД: /static/... → http://91.230.94.240/static/...
Запускать ПОСЛЕ загрузки файлов на LiteHost.

Использование:
    python3 scripts/update_db_image_urls.py

Переменные окружения:
    DATABASE_URL — строка подключения к PostgreSQL
    CDN_BASE_URL — базовый URL CDN (по умолчанию http://91.230.94.240)
"""
import os
import sys
import json
import asyncio

# Добавляем путь к приложению
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# === НАСТРОЙКИ ===
CDN_BASE_URL = os.getenv("CDN_BASE_URL", "http://91.230.94.240")
DATABASE_URL = os.getenv("DATABASE_URL", "")

if not DATABASE_URL:
    # Пробуем из .env или Railway
    try:
        from app.core.config import settings
        DATABASE_URL = settings.DATABASE_URL
    except Exception:
        print("❌ DATABASE_URL не задан. Укажи через переменную окружения:")
        print('   DATABASE_URL="postgresql+asyncpg://user:pass@host/db" python3 scripts/update_db_image_urls.py')
        sys.exit(1)

# Преобразуем URL для asyncpg
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)


async def migrate_urls():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # === 1. Обновляем photos в таблице tours ===
        print(f"\n🔄 Обновляем фото туров...")
        print(f"   CDN: {CDN_BASE_URL}")

        result = await session.execute(
            text("SELECT id, title, photos FROM tours WHERE photos IS NOT NULL")
        )
        tours = result.fetchall()

        tours_updated = 0
        photos_updated = 0

        for tour_id, title, photos in tours:
            if not photos:
                continue

            new_photos = []
            changed = False

            for photo_url in photos:
                if isinstance(photo_url, str) and photo_url.startswith("/static/"):
                    new_url = f"{CDN_BASE_URL}{photo_url}"
                    new_photos.append(new_url)
                    changed = True
                    photos_updated += 1
                else:
                    new_photos.append(photo_url)

            if changed:
                await session.execute(
                    text("UPDATE tours SET photos = :photos WHERE id = :id"),
                    {"photos": json.dumps(new_photos), "id": tour_id}
                )
                tours_updated += 1
                print(f"   ✓ Тур #{tour_id}: {title} ({len([p for p in photos if isinstance(p, str) and p.startswith('/static/')])} фото)")

        print(f"   → Обновлено {tours_updated} туров, {photos_updated} ссылок на фото")

        # === 2. Обновляем photo_url в таблице articles ===
        print(f"\n🔄 Обновляем фото статей...")

        result = await session.execute(
            text("SELECT id, title, photo_url FROM articles WHERE photo_url LIKE '/static/%'")
        )
        articles = result.fetchall()

        for article_id, title, photo_url in articles:
            new_url = f"{CDN_BASE_URL}{photo_url}"
            await session.execute(
                text("UPDATE articles SET photo_url = :url WHERE id = :id"),
                {"url": new_url, "id": article_id}
            )
            print(f"   ✓ Статья #{article_id}: {title}")

        print(f"   → Обновлено {len(articles)} статей")

        # === 3. Обновляем аватары пользователей ===
        print(f"\n🔄 Обновляем аватары пользователей...")

        result = await session.execute(
            text("SELECT id, name, avatar FROM users WHERE avatar LIKE '/static/%'")
        )
        users = result.fetchall()

        for user_id, name, avatar in users:
            new_url = f"{CDN_BASE_URL}{avatar}"
            await session.execute(
                text("UPDATE users SET avatar = :url WHERE id = :id"),
                {"url": new_url, "id": user_id}
            )
            print(f"   ✓ Пользователь #{user_id}: {name}")

        print(f"   → Обновлено {len(users)} аватаров")

        # === 4. Обновляем category_image в categories ===
        print(f"\n🔄 Обновляем картинки категорий...")

        try:
            result = await session.execute(
                text("SELECT id, name, image_url FROM categories WHERE image_url LIKE '/static/%'")
            )
            categories = result.fetchall()

            for cat_id, name, image_url in categories:
                new_url = f"{CDN_BASE_URL}{image_url}"
                await session.execute(
                    text("UPDATE categories SET image_url = :url WHERE id = :id"),
                    {"url": new_url, "id": cat_id}
                )
                print(f"   ✓ Категория #{cat_id}: {name}")

            print(f"   → Обновлено {len(categories)} категорий")
        except Exception as e:
            print(f"   ⚠ Таблица categories не найдена или другая ошибка: {e}")

        # Коммитим все изменения
        await session.commit()

        print(f"\n{'='*50}")
        print(f"✅ МИГРАЦИЯ ЗАВЕРШЕНА!")
        print(f"{'='*50}")
        print(f"Всего обновлено:")
        print(f"  • {tours_updated} туров ({photos_updated} фото)")
        print(f"  • {len(articles)} статей")
        print(f"  • {len(users)} аватаров")
        print(f"\nCDN URL: {CDN_BASE_URL}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(migrate_urls())
