#!/bin/bash
# Настройка HTTPS для cdn.inturex.pro на LiteHost
set -e

DOMAIN="cdn.inturex.pro"

echo "=== Настройка HTTPS для ${DOMAIN} ==="

# 1. Проверяем DNS
echo "[1/3] Проверяем DNS..."
IP=$(dig +short ${DOMAIN} 2>/dev/null || host ${DOMAIN} 2>/dev/null | grep -oP '\d+\.\d+\.\d+\.\d+' | head -1)
if [ -z "$IP" ]; then
  apt install -y -qq dnsutils > /dev/null 2>&1
  IP=$(dig +short ${DOMAIN} 2>/dev/null)
fi

if [ -z "$IP" ]; then
  echo "  DNS ещё не обновился. Подожди 5-10 минут и запусти снова."
  exit 1
fi
echo "  OK: ${DOMAIN} -> ${IP}"

# 2. Ставим certbot
echo "[2/3] Устанавливаем certbot..."
apt install -y -qq certbot python3-certbot-nginx > /dev/null 2>&1
echo "  OK"

# 3. Обновляем nginx конфиг с доменом
echo "[3/3] Настраиваем nginx + SSL..."
cat > /etc/nginx/sites-available/static-cdn << NGCONF
server {
    listen 80;
    server_name ${DOMAIN};

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

nginx -t && systemctl reload nginx

# Получаем сертификат
certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email hello@inturex.pro --redirect

echo ""
echo "==============================="
echo "  HTTPS ГОТОВ!"
echo "==============================="
echo "URL: https://${DOMAIN}/health"
echo "Проверь: curl -I https://${DOMAIN}/health"
