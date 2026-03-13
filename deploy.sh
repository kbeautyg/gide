#!/bin/bash

# Остановка при ошибке
set -e

# Директория проекта (измените на вашу)
PROJECT_DIR="/var/www/gide"

echo "🚀 Starting deployment..."

# Переходим в папку
cd $PROJECT_DIR

# Получаем свежий код
echo "📥 Pulling latest changes..."
git pull origin main

# Пересборка и запуск контейнеров в фоне
echo "🐳 Rebuilding and restarting containers..."
docker-compose -f docker-compose.prod.yml up --build -d

# Очистка неиспользуемых образов (чтобы не забить диск)
docker image prune -f

echo "✅ Deployment finished successfully!"


