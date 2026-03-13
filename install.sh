#!/bin/bash

# ==========================================
# 🇷🇺 УСТАНОВКА SUPABASE (для РФ)
# ==========================================

set -e

echo "🚀 Начинаем настройку сервера..."

# 1. Установка Docker (через зеркало Яндекс)
if ! command -v docker &> /dev/null; then
    echo "📦 Установка Docker..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg
    
    sudo install -m 0755 -d /etc/apt/keyrings
    # Пытаемся скачать ключ
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg || \
    curl -fsSL https://mirror.yandex.ru/mirrors/docker-ce/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    echo \
      "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://mirror.yandex.ru/mirrors/docker-ce/linux/ubuntu \
      "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
      
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
else
    echo "✅ Docker уже стоит."
fi

# 2. Установка Supabase
echo "📥 Скачивание Supabase..."
rm -rf /opt/supabase
mkdir -p /opt/supabase
cd /opt/supabase

git clone --depth 1 https://github.com/supabase/supabase
mv supabase/docker .
rm -rf supabase
cd docker

# 3. Настройка
echo "🔑 Генерация ключей..."
cp .env.example .env

PASS=$(openssl rand -hex 16)
JWT=$(openssl rand -hex 32)
IP=$(curl -s https://api.ipify.org || curl -s ifconfig.me)

sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$PASS/" .env
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT/" .env
sed -i "s/ANON_KEY=.*/ANON_KEY=generate_later/" .env
sed -i "s/SERVICE_ROLE_KEY=.*/SERVICE_ROLE_KEY=generate_later/" .env
sed -i "s|API_EXTERNAL_URL=.*|API_EXTERNAL_URL=http://$IP:8000|" .env
sed -i "s|SUPABASE_PUBLIC_URL=.*|SUPABASE_PUBLIC_URL=http://$IP:8000|" .env

echo "🚀 Запуск..."
docker compose pull
docker compose up -d

echo ""
echo "=================================================================="
echo "🎉 ГОТОВО!"
echo "=================================================================="
echo "DATABASE_URL=postgresql://postgres:$PASS@$IP:5432/postgres"
echo "SUPABASE_URL=http://$IP:8000"
echo "SUPABASE_KEY=<ВОЗЬМИТЕ В АДМИНКЕ: http://$IP:3000>"
echo "=================================================================="
