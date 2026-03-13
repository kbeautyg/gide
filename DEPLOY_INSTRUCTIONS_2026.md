# 🚀 Инструкция по развертыванию Gide (Inturex)
**Дата обновления:** 13.01.2026
**Статус:** Исправлено и протестировано

---

## 1. Подготовка сервера

Убедитесь, что установлены Docker и Docker Compose.

---

## 2. Развертывание Production (inturex.pro)

### Папка проекта: `/var/www/gide` (или `/opt/gide`)

1.  **Обновление кода:**
    ```bash
    cd /var/www/gide
    git pull origin main
    ```

2.  **Настройка .env:**
    Проверьте, что в файле `.env` указан продакшн домен:
    ```env
    BACKEND_CORS_ORIGINS=["https://inturex.pro"]
    APP_BACKEND_URL=https://inturex.pro/api
    VITE_API_URL=https://inturex.pro/api/v1
    ```

3.  **Запуск:**
    ```bash
    # Сборка без BuildKit (если зависает)
    export DOCKER_BUILDKIT=0
    export COMPOSE_DOCKER_CLI_BUILD=0
    
    docker-compose -f docker-compose.prod.yml up --build -d
    ```
    
    *Порты контейнеров: Nginx: 8080, Webhook: 9000*

---

## 3. Развертывание Dev/Staging (dev.inturex.pro)

Чтобы запустить вторую версию сайта для тестов на том же сервере:

1.  **Создайте отдельную папку:**
    ```bash
    mkdir -p /var/www/gide-dev
    cd /var/www/gide-dev
    # Клонируем тот же репозиторий
    git clone https://github.com/kbeautyg/gide.git .
    ```

2.  **Настройка .env для Dev:**
    Создайте `.env` и укажите dev-домен:
    ```env
    # ... (база данных может быть та же или отдельная dev-база) ...
    BACKEND_CORS_ORIGINS=["https://dev.inturex.pro"]
    APP_BACKEND_URL=https://dev.inturex.pro/api
    VITE_API_URL=https://dev.inturex.pro/api/v1
    ```

3.  **Запуск Dev-окружения:**
    Используем специальный файл `docker-compose.dev.yml` (он меняет порты на 8081 и 9001):
    
    ```bash
    docker-compose -f docker-compose.prod.yml -f docker-compose.dev.yml up --build -d
    ```
    
    *Порты Dev-контейнеров: Nginx: 8081, Webhook: 9001*

---

## 4. Настройка системного Nginx (Прокси)

Отредактируйте конфиг `/etc/nginx/sites-available/gide.conf`. Добавьте два блока `server`:

```nginx
# --- PRODUCTION ---
server {
    listen 80;
    server_name inturex.pro www.inturex.pro;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /webhook {
        proxy_pass http://127.0.0.1:9000/webhook;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# --- DEVELOPMENT ---
server {
    listen 80;
    server_name dev.inturex.pro;

    location / {
        proxy_pass http://127.0.0.1:8081; # Порт Dev версии
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /webhook {
        proxy_pass http://127.0.0.1:9001/webhook; # Порт Dev вебхука
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Не забудьте получить SSL сертификаты для обоих доменов:
```bash
certbot --nginx -d inturex.pro -d dev.inturex.pro
```
