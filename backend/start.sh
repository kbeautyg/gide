#!/bin/bash
# Скрипт запуска с инициализацией БД

# Автоматический сброс БД при первом запуске или по запросу
if [ "$RESET_DB" = "true" ] || [ "$FORCE_RESET" = "true" ]; then
  echo "🔄 СБРОС БАЗЫ ДАННЫХ..."
  python reset_db.py || echo "⚠️ Сброс не прошел, продолжаем..."
fi

echo "🔄 Применяем миграции Alembic..."
python -m alembic upgrade head || echo "⚠️ Миграции не применены (возможно уже применены)"

echo "🔧 Инициализируем БД..."
python init_db.py || echo "⚠️ Инициализация не прошла (возможно уже есть)"

# УДАЛЕНИЕ И СОЗДАНИЕ ТУРОВ ОТКЛЮЧЕНО - делаем вручную через Railway CLI
# echo "🗑️  УДАЛЯЕМ ВСЕ СТАРЫЕ ТУРЫ..."
# python delete_all_tours.py || echo "⚠️ Удаление не прошло"
# echo "🌱 Создаем 140 азиатских туров..."
# python seed_data.py || echo "⚠️ Создание не прошло"

echo "🚀 Запускаем сервер..."
python3 -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
