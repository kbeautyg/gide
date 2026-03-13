# 📘 Inturex — Техническая Документация Проекта

## 1. Обзор Проекта
**Inturex** — это SaaS-платформа (маркетплейс) для поиска и бронирования авторских экскурсий по Азии (Таиланд, Вьетнам, Бали и др.).

### Ключевая логика работы:
*   **Клиенты** ищут туры (список/карта), добавляют в избранное, пишут гидам и бронируют.
*   **Гиды (Менеджеры)** создают туры, управляют календарем занятости, принимают заявки и получают уведомления.
*   **Администраторы** видят всю статистику, управляют пользователями и контентом.

---

## 2. Стек Технологий

### Frontend (Клиентская часть)
*   **Framework**: React 18 + Vite
*   **Язык**: TypeScript
*   **Стили**: Tailwind CSS
*   **UI Kit**: Shadcn UI (Radix Primitives)
*   **Карты**: React Leaflet (OpenStreetMap)
*   **Анимации**: Framer Motion
*   **State Management**: Zustand (глобальный стор) + TanStack Query (серверный стейт)
*   **Роутинг**: React Router v6

### Backend (Серверная часть)
*   **Framework**: FastAPI (Python 3.10+)
*   **ORM**: SQLAlchemy (Async)
*   **Валидация**: Pydantic v2
*   **Auth**: JWT (OAuth2)
*   **Хеширование**: Passlib (bcrypt)

### Database (База данных)
*   **СУБД**: PostgreSQL 15+
*   **Миграции**: Alembic

---

## 3. Архитектура и Структура

Проект построен по архитектуре **Client-Server**.

### Структура репозитория
```bash
/
├── backend/               # Серверная часть
│   ├── app/
│   │   ├── api/           # Эндпоинты (REST)
│   │   ├── core/          # Конфиг, безопасность
│   │   ├── db/            # Подключение к БД
│   │   ├── models/        # SQLAlchemy модели
│   │   ├── schemas/       # Pydantic схемы (DTO)
│   │   └── services/      # Бизнес-логика
│   ├── alembic/           # Миграции БД
│   ├── scripts/           # Скрипты (сид данных, очистка)
│   └── requirements.txt   # Зависимости Python
│
├── frontend/              # Клиентская часть
│   ├── src/
│   │   ├── components/    # Переиспользуемые компоненты
│   │   ├── pages/         # Страницы (Public & Dashboard)
│   │   ├── hooks/         # Кастомные хуки
│   │   ├── lib/           # Утилиты (API axios instance)
│   │   └── types/         # TypeScript интерфейсы
│   └── package.json       # Зависимости Node.js
```

---

## 4. Подготовка к Развертыванию (Environment Variables)

Для работы проекта необходимо настроить переменные окружения.

### Backend (`.env` в папке backend)
```ini
# База данных
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/turex_db

# Безопасность
SECRET_KEY=ВАШ_СЕКРЕТНЫЙ_КЛЮЧ_ДЛЯ_JWT
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS (разрешенные домены фронтенда)
BACKEND_CORS_ORIGINS=["http://localhost:5173","https://your-domain.com"]

# Настройки проекта
PROJECT_NAME=Inturex
```

### Frontend (`.env` в папке frontend)
```ini
# URL бэкенда (API)
VITE_API_URL=https://api.your-domain.com/api/v1
```

---

## 5. Инструкция по Развертыванию (Docker / VPS)

Рекомендуемый способ развертывания — через **Docker Compose**.

### Шаг 1: Создайте `docker-compose.yml` в корне проекта

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=turex_user
      - POSTGRES_PASSWORD=secure_password
      - POSTGRES_DB=turex_db
    restart: always

  backend:
    build: ./backend
    command: bash -c "alembic upgrade head && python scripts/init_production_data.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql+asyncpg://turex_user:secure_password@db:5432/turex_db
      - SECRET_KEY=changeme_in_prod
    depends_on:
      - db
    ports:
      - "8000:8000"
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    restart: always

volumes:
  postgres_data:
```

### Шаг 2: Dockerfile для Backend (`backend/Dockerfile`)
```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Шаг 3: Dockerfile для Frontend (`frontend/Dockerfile`)
*Для продакшна мы используем Nginx для раздачи статики.*

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Опционально: скопировать кастомный nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Шаг 4: Запуск
```bash
docker-compose up --build -d
```

---

## 6. Ручное развертывание (без Docker)

Если вы используете PaaS (Railway, Render, Vercel) или настраиваете сервер вручную.

### Backend
1.  Установите Python 3.10+.
2.  Установите зависимости: `pip install -r requirements.txt`.
3.  Примените миграции: `alembic upgrade head`.
4.  Заполните начальные данные (категории, админ): `python scripts/init_production_data.py`.
5.  Запустите сервер: `uvicorn app.main:app --host 0.0.0.0 --port 8000`.

### Frontend
1.  Установите Node.js 18+.
2.  Установите зависимости: `npm install`.
3.  Создайте билд: `npm run build`.
4.  Содержимое папки `dist` — это готовый статический сайт. Загрузите его на хостинг (Vercel/Netlify) или раздавайте через Nginx.

---

## 7. Демо-Аккаунты и Проверка

После развертывания база данных будет пустой. Для создания тестового окружения (пользователи, туры, заказы) запустите скрипт:

```bash
python backend/scripts/create_demo_users.py
```

После этого станут доступны следующие аккаунты (пароль везде `password`):

| Роль | Логин (Телефон) | Описание возможностей |
| :--- | :--- | :--- |
| **Админ** | `79000000000` | Доступ к админ-панели, статистике, управлению контентом. |
| **Гид** | `79111111111` | Создание туров, календарь занятости, просмотр доходов. |
| **Клиент** | `79222222222` | Поиск на карте, избранное, бронирование, чат. |

---

## 8. Важные особенности

1.  **Карты**: Используется OpenStreetMap (бесплатно). API ключи не нужны.
2.  **Изображения**: В текущей версии ссылки на изображения хранятся в БД как URL (внешние хостинги или Unsplash). Для продакшна рекомендуется подключить S3 (AWS/Minio) для загрузки файлов.
3.  **WebSocket**: В проекте есть заготовки для WebSocket (автообновление статусов), но пока используется Polling (автоматический опрос API раз в 15 сек) для простоты деплоя.

---

**Контакты разработчика:**
[Ваше Имя/Контакты]


