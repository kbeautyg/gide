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

# АВТОМАТИЧЕСКОЕ СОЗДАНИЕ ТУРОВ ПРИ ПЕРВОМ ЗАПУСКЕ
echo "🌱 Проверяем наличие туров..."
python init_production_data.py || echo "⚠️ Инициализация пропущена (возможно уже есть данные)"

echo "🚀 Запускаем сервер..."
python3 -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
