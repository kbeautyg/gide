"""
Скрипт для генерации share_code для всех туров, у которых его нет.
Это исправит проблему с некорректными URL для шаринга.
"""
import asyncio
import uuid
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, text

DATABASE_URL = os.environ.get("DATABASE_URL", "")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://") and "+asyncpg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)


async def fix_share_codes():
    if not DATABASE_URL:
        print("⚠️ DATABASE_URL не задан, пропускаем")
        return

    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Найти все туры без share_code
        result = await session.execute(
            text("SELECT id FROM tours WHERE share_code IS NULL OR share_code = ''")
        )
        tours_without_code = result.fetchall()

        if not tours_without_code:
            print("✅ Все туры уже имеют share_code")
            return

        print(f"🔧 Найдено {len(tours_without_code)} туров без share_code")

        # Получить все существующие share_codes для проверки уникальности
        existing_result = await session.execute(
            text("SELECT share_code FROM tours WHERE share_code IS NOT NULL AND share_code != ''")
        )
        existing_codes = {row[0] for row in existing_result.fetchall()}

        updated = 0
        for (tour_id,) in tours_without_code:
            # Генерируем уникальный код
            new_code = uuid.uuid4().hex[:8]
            while new_code in existing_codes:
                new_code = uuid.uuid4().hex[:8]

            existing_codes.add(new_code)

            await session.execute(
                text("UPDATE tours SET share_code = :code WHERE id = :id"),
                {"code": new_code, "id": tour_id}
            )
            updated += 1

        await session.commit()
        print(f"✅ Обновлено {updated} туров с новыми share_code")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(fix_share_codes())
