#!/bin/bash
# Скрипт запуска с инициализацией БД

# Автоматический сброс БД при первом запуске или по запросу
if [ "$RESET_DB" = "true" ] || [ "$FORCE_RESET" = "true" ]; then
  echo "Resetting database..."
  python reset_db.py || echo "WARNING: Reset failed, continuing..."
fi

echo "Applying Alembic migrations..."
python -m alembic upgrade head || echo "WARNING: Migrations not applied (may already be applied)"

echo "Initializing database..."
python init_db.py || echo "WARNING: Initialization failed (may already exist)"

echo "Creating test data..."
python seed_data.py || echo "WARNING: Test data not created (may already exist)"

echo "Starting server..."
python3 -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
