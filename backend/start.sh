#!/bin/bash
# Скрипт запуска с инициализацией БД

# ОДИН РАЗ: Сбросить БД если схема не совпадает
if [ "$RESET_DB" = "true" ]; then
  echo "🔄 Сброс базы данных..."
  python reset_db.py || echo "⚠️ Сброс не прошел"
fi

echo "🔄 Применяем миграции Alembic..."
alembic upgrade head || echo "⚠️ Миграции не применены (возможно уже применены)"

echo "🔧 Инициализируем БД..."
python init_db.py || echo "⚠️ Инициализация не прошла (возможно уже есть)"

echo "🌱 Создаем тестовые данные..."
python seed_data.py || echo "⚠️ Тестовые данные не созданы (возможно уже есть)"

echo "🚀 Запускаем сервер..."
python3 -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
