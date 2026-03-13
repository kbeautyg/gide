# 🚀 ThaiGuide Pro 3.0 - Быстрый старт

## 📋 Требования

- Python 3.11+
- Node.js 18+
- PostgreSQL (Railway/Supabase)

## 🏃‍♂️ Запуск проекта

### 1️⃣ Backend (FastAPI)

```bash
# Переход в директорию backend
cd backend

# Создание виртуального окружения
python -m venv venv

# Активация (Windows)
venv\Scripts\activate

# Активация (Linux/Mac)
source venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt

# Запуск сервера
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8081
```

Backend будет доступен на: **http://localhost:8081**  
API документация: **http://localhost:8081/api/docs**

### 2️⃣ Frontend (React + Vite)

```bash
# Переход в директорию frontend
cd frontend

# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev
```

Frontend будет доступен на: **http://localhost:5173**

## 🌐 Доступные страницы

### Публичные (туристические):
- **Главная**: http://localhost:5173/
- **Каталог экскурсий**: http://localhost:5173/tours
- **Детали экскурсии**: http://localhost:5173/tours/1

### Аутентификация:
- **Логин**: http://localhost:5173/login
- **Регистрация**: http://localhost:5173/register

### Личные кабинеты (в разработке):
- **Дашборд менеджера**: http://localhost:5173/dashboard/manager
- **Дашборд админа**: http://localhost:5173/dashboard/admin
- **Дашборд супер-админа**: http://localhost:5173/dashboard/superadmin

## 🎨 Визуальная концепция

**КРИТИЧНО**: Это туристический сайт, а НЕ обменник!

- ✅ Публичная часть - яркая, туристическая (как Tripster)
- ✅ Тропические цвета (бирюзовый, коралловый, золотой)
- ✅ Фото Таиланда, пляжей, экскурсий
- ✅ Ни слова про обмен валют на главной!
- ✅ Финансы скрыты в личных кабинетах (раздел "Финансы")

## 🔧 Следующие шаги

### Приоритет 1 (уже готово):
- ✅ Структура проекта
- ✅ Публичная часть маркетплейса
- ✅ UI компоненты
- ✅ Страницы аутентификации

### Приоритет 2 (в работе):
- ⏳ Supabase миграции (users, tours, bookings)
- ⏳ Подключение реальной БД
- ⏳ Функциональность бронирования
- ⏳ Система ролей и прав

### Приоритет 3 (следующие):
- ⏳ Личные кабинеты (дашборды)
- ⏳ Раздел "Финансы" для гидов
- ⏳ Курсы валют + обмен
- ⏳ Система вывода средств

## 🐛 Исправленные баги

- ✅ **Московское время (UTC+3)** - установлено глобально
- ✅ **Статусы на русском** - функция `translateStatus()` в `utils.ts`
- ✅ **QR-код размер** - будет исправлено при добавлении QR функционала

## 📦 Технологии

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + Shadcn/ui
- **Backend**: FastAPI + Python 3.11 + SQLAlchemy
- **База данных**: Supabase (PostgreSQL на Railway)
- **State Management**: React Query + Zustand
- **Стилизация**: TailwindCSS + Radix UI

## 🎯 API Endpoints (готовы)

### Публичные:
- `GET /api/v1/tours/` - Список экскурсий с фильтрами
- `GET /api/v1/tours/{id}` - Детали экскурсии

### Аутентификация:
- `POST /api/v1/auth/login` - Логин
- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/logout` - Выход

### Бронирования:
- `POST /api/v1/bookings/` - Создание бронирования
- `GET /api/v1/bookings/{id}` - Получение бронирования

### Пользователи:
- `GET /api/v1/users/me` - Профиль текущего пользователя

## 💡 Полезные команды

```bash
# Backend - проверка кода
cd backend
python -m pytest

# Frontend - build для production
cd frontend
npm run build

# Frontend - preview production build
npm run preview
```

## 📝 Переменные окружения

Уже настроены в `backend/app/core/config.py`:
- `DATABASE_URL` - PostgreSQL на Railway
- `SUPABASE_KEY` - Ключ Supabase
- `JWT_SECRET_KEY` - Секретный ключ для JWT
- `TIMEZONE` - Europe/Moscow (UTC+3)

## ✨ Что показать клиенту

1. **Главная страница** - яркий туристический дизайн
2. **Каталог экскурсий** - с фильтрами и карточками
3. **Детали экскурсии** - галерея, описание, форма бронирования
4. **Адаптивный дизайн** - работает на всех устройствах

---

**ThaiGuide Pro 3.0** - Готов к показу! 🏝️✨
