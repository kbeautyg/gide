#!/bin/bash
# Скрипт запуска с инициализацией БД

# Полный сброс БД только при FORCE_RESET=true
if [ "$FORCE_RESET" = "true" ]; then
  echo "🔄 ПОЛНЫЙ СБРОС БАЗЫ ДАННЫХ..."
  python reset_db.py || echo "⚠️ Сброс не прошел, продолжаем..."
fi

echo "🔄 Применяем миграции Alembic..."
python -m alembic upgrade head || echo "⚠️ Миграции не применены (возможно уже применены)"

echo "🔧 Инициализируем БД..."
python init_db.py || echo "⚠️ Инициализация не прошла (возможно уже есть)"

# АВТОМАТИЧЕСКОЕ СОЗДАНИЕ ТУРОВ ПРИ ПЕРВОМ ЗАПУСКЕ (только если не RESET_DB)
if [ "$RESET_DB" != "true" ]; then
  echo "🌱 Проверяем наличие туров..."
  python init_production_data.py || echo "⚠️ Инициализация пропущена (возможно уже есть данные)"
fi

# Автоматический сброс данных гида при RESET_DB=true (в самом конце!)
if [ "$RESET_DB" = "true" ]; then
  echo "🧹 ОЧИСТКА ДАННЫХ ГИДА (туры, заявки, расписание)..."
  python reset_guide_data.py || echo "⚠️ Очистка не прошла, продолжаем..."
  echo "✅ Данные очищены! Перезапустите приложение без RESET_DB=true"
fi

echo "🚀 Запускаем сервер..."
python3 -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
