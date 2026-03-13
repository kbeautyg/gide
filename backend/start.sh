#!/bin/bash
# Скрипт запуска с инициализацией БД

# Автоматический сброс данных гида при RESET_DB=true (ПЕРЕД инициализацией)
if [ "$RESET_DB" = "true" ]; then
  echo "🧹 ПОЛНАЯ ОЧИСТКА ЛИЧНОГО КАБИНЕТА..."
  python clear_dashboard.py || echo "⚠️ Очистка не прошла, продолжаем..."
fi

# Полный сброс БД только при FORCE_RESET=true
if [ "$FORCE_RESET" = "true" ]; then
  echo "🔄 ПОЛНЫЙ СБРОС БАЗЫ ДАННЫХ..."
  python reset_db.py || echo "⚠️ Сброс не прошел, продолжаем..."
fi

echo "🔄 Применяем миграции Alembic..."
# Пропускаем автомиграции - таблицы уже созданы в Supabase вручную
# python -m alembic upgrade head || echo "⚠️ Миграции не применены (возможно уже применены)"
echo "⏭️ Пропускаем Alembic миграции - используем ручное управление через Supabase SQL"

echo "🔧 Проверяю и применяю миграцию 009 вручную..."
python apply_migration_009.py || echo "⚠️ Миграция 009 уже применена или ошибка"

echo "🔧 Применяю миграцию 014 (создание таблицы articles)..."
python apply_migration_014.py || echo "⚠️ Миграция 014 уже применена или ошибка"

echo "🔧 Применяю миграцию 015 (is_public=True для всех туров)..."
python apply_migration_015.py || echo "⚠️ Миграция 015 уже применена или ошибка"

echo "🔧 Применяю миграцию guide_status..."
python apply_migration_guide_status.py || echo "⚠️ Миграция guide_status уже применена или ошибка"

echo "🔧 Применяю миграцию username..."
python apply_migration_username.py || echo "⚠️ Миграция username уже применена или ошибка"

echo "💬 Создаю таблицу messages (если нет)..."
python apply_migration_messages.py || echo "⚠️ Миграция messages уже применена или ошибка"

echo "🔔 Создаю таблицу notifications (если нет)..."
python apply_migration_notifications.py || echo "⚠️ Миграция notifications уже применена или ошибка"

echo "👑 Назначаю права администратора пользователю @gxyxw..."
python set_admin_gxyxw.py || echo "⚠️ Не удалось назначить админа (пользователь не найден?)"

echo "🗑️ Удаляем туры-заглушки 701, 702, 703..."
python cleanup_stub_tours.py || echo "⚠️ Очистка заглушек не прошла"

echo "🌍 Исправляем привязки город→страна (Бангкок→Таиланд и т.д.)..."
python fix_city_country.py || echo "⚠️ Исправление привязок не прошло"

echo "🔗 Генерируем share_code для туров без него..."
python fix_share_codes.py || echo "⚠️ Генерация share_code не прошла"

echo "🔧 ПРИНУДИТЕЛЬНО устанавливаем is_public=True для всех туров..."
python -c "
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv('DATABASE_URL', '').replace('postgresql://', 'postgresql+asyncpg://')
if DATABASE_URL:
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async def fix_tours():
        async with async_session() as session:
            result = await session.execute(text('UPDATE tours SET is_public = TRUE WHERE is_public = FALSE'))
            await session.commit()
            print(f'   Обновлено {result.rowcount} туров на is_public=TRUE')
    
    asyncio.run(fix_tours())
" || echo "⚠️ Не удалось обновить туры"

echo "📊 Проверяю состояние туров в БД..."
python check_tours_db.py || echo "⚠️ Проверка не прошла"

echo "🔧 Инициализируем БД..."
python init_db.py || echo "⚠️ Инициализация не прошла (возможно уже есть)"

# АВТОМАТИЧЕСКОЕ СОЗДАНИЕ ТУРОВ ПРИ ПЕРВОМ ЗАПУСКЕ
echo "🌱 Проверяем наличие туров..."
python init_production_data.py || echo "⚠️ Инициализация пропущена (возможно уже есть данные)"

echo "🚀 Запускаем сервер..."
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
