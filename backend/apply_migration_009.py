#!/usr/bin/env python3
"""
Принудительное применение миграции 009 на Railway
Добавляет поля: is_archived, client_name, client_phone, client_email в таблицу tours
"""
import asyncio
import os
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

async def apply_migration():
    print("=" * 80)
    print("🔧 ЗАПУСК СКРИПТА МИГРАЦИИ 009")
    print("=" * 80)
    
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL не найден!")
        sys.exit(1)
    
    print(f"✓ DATABASE_URL найден: {database_url[:30]}...")
    
    # Преобразуем postgresql:// в postgresql+asyncpg://
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        print("✓ Преобразован в asyncpg URL")
    
    # Создаём движок
    print("🔄 Создаю подключение к базе...")
    engine = create_async_engine(database_url, echo=False)  # Отключил echo для чистоты логов
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    print("✓ Подключение создано")
    
    async with async_session() as session:
        print("🔄 Применяю миграцию 009...")
        
        try:
            # Проверяем существуют ли поля
            result = await session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'tours' 
                AND column_name IN ('is_archived', 'client_name', 'client_phone', 'client_email')
            """))
            existing_columns = [row[0] for row in result.fetchall()]
            
            if len(existing_columns) == 4:
                print("✅ Миграция 009 уже применена! Все поля существуют.")
                return
            
            print(f"📋 Найдено полей: {existing_columns}")
            
            # Добавляем недостающие поля (с проверкой на существование)
            if 'is_archived' not in existing_columns:
                print("➕ Добавляю is_archived...")
                await session.execute(text("""
                    ALTER TABLE tours 
                    ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE
                """))
                await session.execute(text("""
                    CREATE INDEX IF NOT EXISTS ix_tours_is_archived ON tours (is_archived)
                """))
            
            if 'client_name' not in existing_columns:
                print("➕ Добавляю client_name...")
                await session.execute(text("""
                    ALTER TABLE tours 
                    ADD COLUMN IF NOT EXISTS client_name VARCHAR
                """))
            
            if 'client_phone' not in existing_columns:
                print("➕ Добавляю client_phone...")
                await session.execute(text("""
                    ALTER TABLE tours 
                    ADD COLUMN IF NOT EXISTS client_phone VARCHAR
                """))
            
            if 'client_email' not in existing_columns:
                print("➕ Добавляю client_email...")
                await session.execute(text("""
                    ALTER TABLE tours 
                    ADD COLUMN IF NOT EXISTS client_email VARCHAR
                """))
            
            await session.commit()
            print("✅ Миграция 009 успешно применена!")
            
            # Пытаемся обновить alembic_version (если таблица существует)
            try:
                print("🔄 Обновляю alembic_version...")
                await session.execute(text("""
                    UPDATE alembic_version SET version_num = '009' WHERE EXISTS (SELECT 1 FROM alembic_version)
                """))
                await session.commit()
                print("✅ alembic_version обновлён на 009")
            except Exception as e:
                print(f"⚠️ Не удалось обновить alembic_version: {e}")
            
        except Exception as e:
            print(f"❌ Ошибка при применении миграции: {e}")
            await session.rollback()
            raise

if __name__ == "__main__":
    try:
        asyncio.run(apply_migration())
    except Exception as e:
        print(f"❌ КРИТИЧЕСКАЯ ОШИБКА В СКРИПТЕ МИГРАЦИИ: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

