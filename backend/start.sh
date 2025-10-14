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
python -m alembic upgrade head || echo "⚠️ Миграции не применены (возможно уже применены)"

echo "🔧 Инициализируем БД..."
python init_db.py || echo "⚠️ Инициализация не прошла (возможно уже есть)"

# АВТОМАТИЧЕСКОЕ СОЗДАНИЕ ТУРОВ ПРИ ПЕРВОМ ЗАПУСКЕ
echo "🌱 Проверяем наличие туров..."
python init_production_data.py || echo "⚠️ Инициализация пропущена (возможно уже есть данные)"

echo "🚀 Запускаем сервер..."
python3 -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
