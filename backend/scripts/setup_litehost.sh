#!/bin/bash
# === InTurex Pro — установка CDN на чистый Debian 13 ===
# Одна команда: curl -sL URL | bash
set -e

echo "=== InTurex Pro CDN Setup ==="

# 1. Ставим nginx, curl, python3
echo "[1/6] Устанавливаем пакеты..."
apt update -qq && apt install -y -qq nginx curl python3 > /dev/null 2>&1
echo "  OK"

# 2. Создаём директории
echo "[2/6] Создаём директории..."
mkdir -p /var/www/static/static/countries
mkdir -p /var/www/static/static/tours

# 3. Скачиваем картинки стран
echo "[3/6] Скачиваем картинки стран..."
cd /var/www/static/static/countries
for c in cambodia china default_country india indonesia japan malaysia myanmar nepal philippines singapore south_korea srilanka thailand turkey uae vietnam; do
  curl -sL "https://gide-production.up.railway.app/static/countries/${c}.jpg" -o "${c}.jpg" 2>/dev/null && echo "  + ${c}" || echo "  - ${c} (не найден)"
done

# 4. Получаем список фото туров и скачиваем
echo "[4/6] Скачиваем фото туров..."
curl -sL "https://gide-production.up.railway.app/api/v1/tours/?limit=500" -o /tmp/tours.json

python3 -c "
import json
d=json.load(open('/tmp/tours.json'))
urls=set()
for t in d.get('tours',[]):
 for p in t.get('photos',[]):
  if p.startswith('/static/'): urls.add(p)
for u in sorted(urls): print(u)
" > /tmp/urls.txt 2>/dev/null

TOTAL=$(wc -l < /tmp/urls.txt)
echo "  Найдено ${TOTAL} картинок"

COUNT=0
while IFS= read -r url; do
  COUNT=$((COUNT + 1))
  dir="/var/www/static${url%/*}"
  mkdir -p "$dir"
  curl -sL "https://gide-production.up.railway.app${url}" -o "/var/www/static${url}" 2>/dev/null
  if [ $((COUNT % 100)) -eq 0 ]; then
    echo "  ${COUNT}/${TOTAL}..."
  fi
done < /tmp/urls.txt
echo "  Скачано ${COUNT} фото туров"

# 5. Скачиваем фото статей
echo "[5/6] Скачиваем фото статей..."
curl -sL "https://gide-production.up.railway.app/api/v1/articles/?limit=100" -o /tmp/articles.json 2>/dev/null

python3 -c "
import json
d=json.load(open('/tmp/articles.json'))
for a in d.get('articles',[]):
 u=a.get('photo_url','')
 if u.startswith('/static/'): print(u)
" 2>/dev/null | while IFS= read -r url; do
  dir="/var/www/static${url%/*}"
  mkdir -p "$dir"
  curl -sL "https://gide-production.up.railway.app${url}" -o "/var/www/static${url}" 2>/dev/null
  echo "  + ${url}"
done

# 6. Настраиваем nginx
echo "[6/6] Настраиваем nginx..."
cat > /etc/nginx/sites-available/static-cdn << 'NGCONF'
server {
    listen 80;
    server_name _;

    location /static/ {
        alias /var/www/static/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        sendfile on;
        tcp_nopush on;
    }

    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
NGCONF

ln -sf /etc/nginx/sites-available/static-cdn /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Чистим
rm -f /tmp/tours.json /tmp/articles.json /tmp/urls.txt

echo ""
echo "==============================="
echo "  ГОТОВО!"
echo "==============================="
echo "Размер: $(du -sh /var/www/static/ | cut -f1)"
echo "Проверь: curl -I http://91.230.94.240/health"
echo ""
