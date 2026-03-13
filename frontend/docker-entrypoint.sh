#!/bin/sh
set -e

# Если PORT не задан, используем 80
export PORT=${PORT:-80}

echo "Starting Nginx on port $PORT..."

# Заменяем переменную в конфиге
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Запускаем Nginx
exec nginx -g 'daemon off;'
