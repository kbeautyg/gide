"""
Проверка состояния туров в базе данных
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.db.session import async_session
from app.core.config import settings


async def check_tours():
    """Проверяет туры в базе"""
    # Показываем какой DATABASE_URL используется (без пароля)
    db_url = settings.DATABASE_URL
    if "@" in db_url:
        host_part = db_url.split("@")[1] if "@" in db_url else db_url
        print(f"🔗 DATABASE_URL: ...@{host_part}")
    else:
        print(f"🔗 DATABASE_URL: {db_url[:50]}...")
    
    async with async_session() as session:
        try:
            # Общее количество туров
            result = await session.execute(text("SELECT COUNT(*) FROM tours"))
            total = result.scalar()
            print(f"📊 Всего туров в БД: {total}")
            
            if total == 0:
                print("⚠️ Туров НЕТ! Нужно загрузить туры через Tour Rewriter.")
                return
            
            # По статусам
            result = await session.execute(text(
                "SELECT is_public, active, COUNT(*) FROM tours GROUP BY is_public, active"
            ))
            rows = result.fetchall()
            print("\n📋 По статусам:")
            for row in rows:
                is_public, active, count = row
                status = f"{'Публичный' if is_public else 'Приватный'}, {'Активный' if active else 'Неактивный'}"
                print(f"   {status}: {count}")
            
            # По странам
            result = await session.execute(text(
                "SELECT location, COUNT(*) FROM tours WHERE is_public = TRUE AND active = TRUE GROUP BY location ORDER BY COUNT(*) DESC LIMIT 10"
            ))
            rows = result.fetchall()
            print("\n🌍 Публичные туры по локациям:")
            for row in rows:
                location, count = row
                print(f"   {location}: {count}")
            
            # Проверка статей
            try:
                result = await session.execute(text("SELECT COUNT(*) FROM articles"))
                articles_count = result.scalar()
                print(f"\n📰 Всего статей в БД: {articles_count}")
            except Exception as e:
                print(f"\n📰 Таблица articles: {e}")
                
        except Exception as e:
            print(f"❌ Ошибка: {e}")


if __name__ == "__main__":
    asyncio.run(check_tours())

