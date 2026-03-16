#!/bin/bash
cat > /etc/nginx/sites-available/static-cdn << 'EOF'
server {
    listen 80;
    server_name cdn.inturex.pro;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl;
    server_name cdn.inturex.pro;
    ssl_certificate /etc/letsencrypt/live/cdn.inturex.pro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cdn.inturex.pro/privkey.pem;
    location /static/ {
        alias /var/www/static/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        sendfile on;
    }
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
EOF
nginx -t && systemctl reload nginx && echo "OK! Проверь: curl -I https://cdn.inturex.pro/health"
