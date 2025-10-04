# FastChange 3.0

> Комплексная платформа для обмена валют и маркетплейс экскурсий в Таиланде

## 🚀 Технологический стек

### Frontend
- **React 18** + TypeScript
- **Vite** - быстрый сборщик
- **TailwindCSS** - стилизация
- **Shadcn/ui** - UI компоненты
- **React Query** - управление серверным состоянием
- **Zustand** - локальный state
- **React Router v6** - маршрутизация
- **React Hook Form** + Zod - формы и валидация

### Backend
- **FastAPI** - Python веб-фреймворк
- **SQLAlchemy 2.0** - ORM
- **Alembic** - миграции
- **Pydantic v2** - валидация данных
- **python-jose** - JWT токены
- **asyncpg** - PostgreSQL драйвер

### Database & Services
- **Supabase** - PostgreSQL + Auth + Realtime + Storage
- **Redis** - кэширование
- **Celery** - фоновые задачи

## 📋 Структура проекта

```
fastchange/
├── frontend/          # React приложение
│   ├── src/
│   │   ├── components/  # UI компоненты
│   │   ├── features/    # Фичи (auth, dashboard, etc)
│   │   ├── lib/         # Утилиты, API клиент
│   │   ├── hooks/       # Custom hooks
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/           # FastAPI приложение
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Конфиги, security
│   │   ├── models/      # SQLAlchemy модели
│   │   ├── schemas/     # Pydantic схемы
│   │   └── services/    # Бизнес-логика
│   ├── requirements.txt
│   └── main.py
│
└── README.md
```

## 🔧 Установка и запуск

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 🌐 Деплой

- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Supabase

## 📝 Переменные окружения

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Backend (.env)
```
DATABASE_URL=postgresql://...
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SECRET_KEY=your_secret_key
```

## 👥 Роли пользователей

- **Admin** (0) - Полный доступ
- **Manager** (1) - Создание ссылок и экскурсий
- **Client** (2) - Оплата и бронирование

## 🎯 Основной функционал

- ✅ Аутентификация по телефону
- ✅ Обмен валюты (RUB ↔ THB/USD)
- ✅ Платежные ссылки с QR-кодами
- ✅ Маркетплейс экскурсий
- ✅ Система бронирования
- ✅ Статистика и отчеты

## 📄 Лицензия

Proprietary - All rights reserved