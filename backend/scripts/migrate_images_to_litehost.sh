#!/bin/bash
# ============================================================
# МИГРАЦИЯ КАРТИНОК: Railway → LiteHost (91.230.94.240)
# ============================================================
# Этот скрипт выполняется ЛОКАЛЬНО на твоём компьютере
# Он скачивает картинки с Railway и загружает на LiteHost
# ============================================================

set -e

# === НАСТРОЙКИ ===
RAILWAY_URL="https://gide-production.up.railway.app"
LITEHOST_IP="91.230.94.240"
LITEHOST_USER="root"  # замени если другой пользователь
LITEHOST_PATH="/var/www/static"
CDN_DOMAIN="91.230.94.240"  # позже можешь заменить на домен

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Миграция картинок InTurex Pro ===${NC}"
echo -e "Railway: ${RAILWAY_URL}"
echo -e "LiteHost: ${LITEHOST_IP}"
echo ""

# ШАГ 1: Создаём временную папку
WORK_DIR="/tmp/inturex-images"
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR"

echo -e "${YELLOW}[1/4] Скачиваем картинки с Railway...${NC}"

# Скачиваем все картинки стран
mkdir -p "$WORK_DIR/countries"
for country in cambodia china default_country india indonesia japan malaysia myanmar nepal philippines singapore south_korea srilanka thailand turkey uae vietnam; do
    echo "  → countries/${country}.jpg"
    curl -sL "${RAILWAY_URL}/static/countries/${country}.jpg" -o "$WORK_DIR/countries/${country}.jpg" 2>/dev/null || echo "    ⚠ не найден"
done

# Скачиваем все картинки туров
# Сначала получаем список туров через API
echo ""
echo "  Получаем список туров..."
TOURS_JSON=$(curl -sL "${RAILWAY_URL}/api/v1/tours/?limit=500" 2>/dev/null)

# Извлекаем все фото-URL которые начинаются с /static/
echo "$TOURS_JSON" | python3 -c "
import json, sys
data = json.load(sys.stdin)
tours = data.get('tours', [])
urls = set()
for tour in tours:
    for photo in tour.get('photos', []):
        if photo.startswith('/static/'):
            urls.add(photo)
for url in sorted(urls):
    print(url)
" > "$WORK_DIR/photo_urls.txt" 2>/dev/null || echo "  ⚠ Не удалось получить список из API"

TOTAL=$(wc -l < "$WORK_DIR/photo_urls.txt" 2>/dev/null || echo "0")
echo "  Найдено ${TOTAL} локальных картинок в API"

# Скачиваем каждую
COUNT=0
while IFS= read -r url; do
    COUNT=$((COUNT + 1))
    # Создаём директорию
    DIR=$(dirname "$WORK_DIR${url}")
    mkdir -p "$DIR"

    # Скачиваем
    if [ $((COUNT % 50)) -eq 0 ]; then
        echo "  → ${COUNT}/${TOTAL}..."
    fi
    curl -sL "${RAILWAY_URL}${url}" -o "$WORK_DIR${url}" 2>/dev/null || true
done < "$WORK_DIR/photo_urls.txt"

echo -e "${GREEN}  ✓ Скачано ${COUNT} картинок${NC}"

# Также скачиваем статьи (article photos)
echo ""
echo "  Проверяем фото статей..."
ARTICLES_JSON=$(curl -sL "${RAILWAY_URL}/api/v1/articles/?limit=100" 2>/dev/null)
echo "$ARTICLES_JSON" | python3 -c "
import json, sys
data = json.load(sys.stdin)
articles = data.get('articles', [])
for a in articles:
    url = a.get('photo_url', '')
    if url.startswith('/static/'):
        print(url)
" >> "$WORK_DIR/photo_urls.txt" 2>/dev/null || true

# ШАГ 2: Архивируем
echo ""
echo -e "${YELLOW}[2/4] Архивируем...${NC}"
cd "$WORK_DIR"
tar czf /tmp/inturex-static.tar.gz static/ countries/ 2>/dev/null || tar czf /tmp/inturex-static.tar.gz . --exclude='photo_urls.txt'
SIZE=$(du -sh /tmp/inturex-static.tar.gz | cut -f1)
echo -e "${GREEN}  ✓ Архив: ${SIZE}${NC}"

# ШАГ 3: Загружаем на LiteHost
echo ""
echo -e "${YELLOW}[3/4] Загружаем на LiteHost (${LITEHOST_IP})...${NC}"
echo "  Введи пароль SSH когда попросят:"

# Создаём директорию на сервере
ssh "${LITEHOST_USER}@${LITEHOST_IP}" "mkdir -p ${LITEHOST_PATH}" 2>/dev/null || true

# Загружаем архив
scp /tmp/inturex-static.tar.gz "${LITEHOST_USER}@${LITEHOST_IP}:/tmp/"

# Распаковываем на сервере
ssh "${LITEHOST_USER}@${LITEHOST_IP}" "cd ${LITEHOST_PATH} && tar xzf /tmp/inturex-static.tar.gz && rm /tmp/inturex-static.tar.gz"

echo -e "${GREEN}  ✓ Файлы загружены в ${LITEHOST_PATH}${NC}"

# ШАГ 4: Настраиваем nginx
echo ""
echo -e "${YELLOW}[4/4] Настраиваем nginx на LiteHost...${NC}"

ssh "${LITEHOST_USER}@${LITEHOST_IP}" bash << 'REMOTE_SCRIPT'
# Устанавливаем nginx если нет
apt-get update -qq && apt-get install -y -qq nginx > /dev/null 2>&1

# Создаём конфиг
cat > /etc/nginx/sites-available/static-cdn << 'NGINX_CONF'
server {
    listen 80;
    server_name _;

    # Статические файлы
    location /static/ {
        alias /var/www/static/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";

        # Оптимизация
        sendfile on;
        tcp_nopush on;
        tcp_nodelay on;

        # Gzip для SVG
        gzip on;
        gzip_types image/svg+xml;
    }

    location /countries/ {
        alias /var/www/static/countries/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        sendfile on;
    }

    # Healthcheck
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
NGINX_CONF

# Включаем сайт
ln -sf /etc/nginx/sites-available/static-cdn /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Тестируем и перезапускаем
nginx -t && systemctl restart nginx

echo "✓ nginx настроен и запущен"
REMOTE_SCRIPT

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  МИГРАЦИЯ ЗАВЕРШЕНА!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "CDN URL: http://${CDN_DOMAIN}"
echo "Пример: http://${CDN_DOMAIN}/static/tours/1/photo.jpg"
echo ""
echo "Теперь запусти скрипт обновления БД:"
echo "  python3 scripts/update_db_image_urls.py"
echo ""

# Чистим
rm -rf "$WORK_DIR"
rm -f /tmp/inturex-static.tar.gz
