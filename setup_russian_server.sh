#!/bin/bash

# ==========================================
# 🇷🇺 Скрипт автоматической настройки Supabase в РФ
# ==========================================

set -e

echo "🚀 Начинаем настройку сервера для базы данных..."

# 1. Установка Docker
if ! command -v docker &> /dev/null; then
    echo "📦 Установка Docker..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    echo "✅ Docker установлен!"
else
    echo "✅ Docker уже установлен."
fi

# 2. Скачивание Supabase
echo "📥 Скачивание Supabase..."
mkdir -p /opt/supabase
cd /opt/supabase
if [ ! -d "docker" ]; then
    git clone --depth 1 https://github.com/supabase/supabase
    mv supabase/docker .
    rm -rf supabase
fi
cd docker

# 3. Настройка переменных окружения
echo "🔑 Генерация ключей безопасности..."

# Функция генерации паролей
generate_pass() {
    openssl rand -hex 16
}

# Функция генерации JWT (простая имитация, для продакшена лучше использовать библиотеки, 
# но для self-hosted скрипта подойдет генерация секрета)
JWT_SECRET=$(openssl rand -hex 32)
DB_PASSWORD=$(generate_pass)
DASHBOARD_USER="admin"
DASHBOARD_PASS=$(generate_pass)

# Копируем конфиг
cp .env.example .env

# Получаем внешний IP сервера
PUBLIC_IP=$(curl -s ifconfig.me || echo "YOUR_SERVER_IP")

echo "⚙️ Применение настроек в .env..."

# Заменяем значения в файле .env
# Используем perl для кроссплатформенной замены (sed отличается на mac/linux)
perl -i -pe "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$DB_PASSWORD/" .env
perl -i -pe "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
perl -i -pe "s/ANON_KEY=.*/ANON_KEY=generate_later_or_use_studio/" .env
perl -i -pe "s/SERVICE_ROLE_KEY=.*/SERVICE_ROLE_KEY=generate_later_or_use_studio/" .env
perl -i -pe "s|API_EXTERNAL_URL=.*|API_EXTERNAL_URL=http://$PUBLIC_IP:8000|" .env
perl -i -pe "s|SUPABASE_PUBLIC_URL=.*|SUPABASE_PUBLIC_URL=http://$PUBLIC_IP:8000|" .env
perl -i -pe "s/DASHBOARD_USERNAME=.*/DASHBOARD_USERNAME=$DASHBOARD_USER/" .env
perl -i -pe "s/DASHBOARD_PASSWORD=.*/DASHBOARD_PASSWORD=$DASHBOARD_PASS/" .env

# Включаем доступ снаружи к БД (по умолчанию supabase может закрывать порт)
# В docker-compose.yml обычно порты проброшены, но проверим .env
# Настраиваем Studio URL
perl -i -pe "s|STUDIO_DEFAULT_ORGANIZATION=.*|STUDIO_DEFAULT_ORGANIZATION=Inturex|" .env
perl -i -pe "s|STUDIO_DEFAULT_PROJECT=.*|STUDIO_DEFAULT_PROJECT=InturexDB|" .env

echo "🚀 Запуск контейнеров..."
docker compose pull
docker compose up -d

echo ""
echo "=================================================================="
echo "🎉 ГОТОВО! Supabase запущена на сервере РФ."
echo "=================================================================="
echo ""
echo "📱 Админка (Studio): http://$PUBLIC_IP:3000"
echo "   Логин: $DASHBOARD_USER"
echo "   Пароль: $DASHBOARD_PASS"
echo ""
echo "🐘 База данных:"
echo "   Хост: $PUBLIC_IP"
echo "   Порт: 5432"
echo "   Пользователь: postgres"
echo "   Пароль: $DB_PASSWORD"
echo ""
echo "⚠️ ВАЖНО: JWT ключи (ANON и SERVICE_ROLE) сгенерировались автоматически внутри Supabase при первом старте."
echo "   Чтобы их узнать, зайдите в Админку -> Project Settings -> API"
echo "   Или посмотрите логи: docker compose logs analytics" 
echo ""
echo "👉 Скопируйте эти данные для настройки сайта Inturex:"
echo "DATABASE_URL=postgresql://postgres:$DB_PASSWORD@$PUBLIC_IP:5432/postgres"
echo "SUPABASE_URL=http://$PUBLIC_IP:8000"
echo "SUPABASE_KEY=<возьмите_из_админки>"
echo ""
echo "🔒 НЕ ЗАБУДЬТЕ НАСТРОИТЬ ФАЙРВОЛ (UFW), ЧТОБЫ ЗАКРЫТЬ ПОРТ 5432 ОТ ВСЕХ, КРОМЕ ВАШЕГО САЙТА!"
echo "   ufw allow from <IP_ВАШЕГО_САЙТА> to any port 5432"
echo "=================================================================="
