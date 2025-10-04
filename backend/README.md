# FastChange 3.0 Backend (FastAPI)

## 🚀 Установка

```bash
# Создать виртуальное окружение
python -m venv venv

# Активировать (Windows)
venv\Scripts\activate

# Активировать (Linux/Mac)
source venv/bin/activate

# Установить зависимости
pip install -r requirements.txt
```

## ⚙️ Настройка

1. Скопируйте `.env.example` в `.env`
2. Заполните переменные окружения
3. Подключите Supabase или локальную PostgreSQL

## 🗄️ Инициализация БД

```bash
# Создать таблицы и тестовых пользователей
python init_db.py
```

## 🏃 Запуск

```bash
# Режим разработки
uvicorn app.main:app --reload --port 8000

# Продакшн
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 📚 API документация

После запуска доступна по адресам:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔐 Тестовые пользователи

- **Админ**: +79177445182 / password123
- **Менеджер**: +79111111111 / password123
- **Клиент**: +79999991000 / password123
