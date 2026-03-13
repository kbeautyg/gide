import asyncio
import os
import sys
from sqlalchemy import text
from sqlalchemy.exc import ProgrammingError

# Добавляем путь к приложению
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import async_session

async def apply_migration():
    """Добавляет guide_status в таблицу users"""
    print("🔄 Начинаем миграцию guide_status...")
    
    async with async_session() as session:
        try:
            # 1. Проверяем существование колонки
            print("🔍 Проверяем колонку guide_status...")
            result = await session.execute(text(
                "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='guide_status'"
            ))
            if result.scalar():
                print("✅ Колонка guide_status уже существует. Миграция не требуется.")
                return

            # 2. Проверяем тип
            print("🔍 Проверяем тип guidestatus...")
            
            # Проверяем, существует ли тип и какие у него значения
            try:
                result = await session.execute(text(
                    "SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'guidestatus'"
                ))
                existing_labels = {row[0] for row in result.fetchall()}
                
                if existing_labels:
                    print(f"ℹ️  Найден существующий тип guidestatus со значениями: {existing_labels}")
                    required_labels = {'none', 'pending', 'approved', 'rejected'}
                    
                    if not required_labels.issubset(existing_labels):
                        print("⚠️ Тип существует, но отсутствуют некоторые значения или они отличаются.")
                        # Если тип не используется, проще его пересоздать
                        # Попытаемся удалить тип
                        try:
                            print("🔄 Пытаемся удалить старый тип (DROP TYPE)...")
                            # CASCADE удалит и колонки, использующие этот тип, если они есть!
                            # Но мы знаем, что колонки guide_status нет (проверка выше).
                            # Если есть другие колонки - мы их сломаем. Поэтому без CASCADE безопаснее, 
                            # если упадет - значит используется.
                            await session.execute(text("DROP TYPE guidestatus"))
                            print("✅ Старый тип удален.")
                            existing_labels = None # Force recreate
                        except Exception as drop_err:
                            print(f"⚠️ Не удалось удалить тип (возможно используется): {drop_err}")
                            # Здесь мы не можем использовать ALTER TYPE ADD VALUE внутри транзакции.
                            # Надеемся, что имеющиеся значения совместимы (например 'NONE' vs 'none' - это плохо)
                else:
                    # Тип не найден в pg_enum (или пустой)
                    existing_labels = None
                    
            except Exception as e:
                print(f"ℹ️  Ошибка при проверке типа (возможно его нет): {e}")
                existing_labels = None

            # 3. Создаем тип если нужно
            if not existing_labels:
                print("🔄 Создаем тип guidestatus...")
                try:
                    await session.execute(text("CREATE TYPE guidestatus AS ENUM ('none', 'pending', 'approved', 'rejected')"))
                    print("✅ Создан тип guidestatus")
                except Exception as e:
                    print(f"⚠️ Ошибка создания типа (возможно уже есть): {e}")

            # 4. Добавляем колонку
            print("🔄 Добавляем колонку guide_status...")
            try:
                # Используем SQL с явным приведением типа
                await session.execute(text("ALTER TABLE users ADD COLUMN guide_status guidestatus NOT NULL DEFAULT 'none'"))
                await session.commit()
                print("✅ Колонка guide_status успешно добавлена")
            except Exception as e:
                print(f"❌ Ошибка при добавлении колонки: {e}")
                await session.rollback()
                sys.exit(1) # Fail fast

        except Exception as e:
            print(f"❌ Общая ошибка миграции: {e}")
            await session.rollback()
            sys.exit(1)

if __name__ == "__main__":
    try:
        asyncio.run(apply_migration())
    except Exception as e:
        print(f"💥 Фатальная ошибка скрипта: {e}")
        sys.exit(1)
