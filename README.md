# 🏝️ ThaiGuide Pro 3.0

Комплексная платформа для туризма в Таиланде с системой управления финансами для гидов.

## 📋 Описание

**Публичная часть** - Маркетплейс экскурсий (аналог Tripster)  
**Внутренняя часть** - Управление платежами и финансами:
- Обмен валют (RUB ↔ THB/USD) с QR-кодами
- Многоуровневая иерархия пользователей
- Система вывода средств через обменников
- Детальная статистика и отчетность

## 🛠 Технологии

### Frontend
- React 18 + TypeScript + Vite
- TailwindCSS + Shadcn/ui
- React Query + Zustand
- React Router v6

### Backend
- FastAPI + Python 3.11+
- SQLAlchemy 2.0 + Alembic
- Supabase (PostgreSQL)
- Celery + Redis

## 🚀 Быстрый старт

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8081
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📦 Структура проекта

```
thaiguide-pro/
├── backend/              # FastAPI приложение
│   ├── app/
│   │   ├── api/         # API эндпоинты
│   │   ├── core/        # Конфигурация, безопасность
│   │   ├── db/          # База данных
│   │   ├── models/      # SQLAlchemy модели
│   │   ├── schemas/     # Pydantic схемы
│   │   ├── services/    # Бизнес-логика
│   │   └── main.py      # Точка входа
│   ├── alembic/         # Миграции БД
│   └── requirements.txt
├── frontend/            # React приложение
│   ├── src/
│   │   ├── components/  # UI компоненты
│   │   ├── features/    # Фичи (auth, tours, etc)
│   │   ├── lib/         # Утилиты
│   │   ├── hooks/       # Custom hooks
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## 👥 Иерархия пользователей

```
Супер-Админ
    ↓
Админы
    ↓
Супер-Менеджеры
    ↓
Менеджеры (Гиды)
    ↓
Клиенты (Туристы)

+ Обменники (отдельная роль)
```

## 🔑 Переменные окружения

Скопируйте `.env.example` в `.env` и заполните значения.

## 📝 Лицензия

Proprietary - Все права защищены

## 🎯 Версия

3.0 (Tourism First Design) - 2025
