# 🗄️ Настройка базы данных

## ✅ Что создано:

1. **Модели SQLAlchemy**:
   - `User` - пользователи с иерархией и ролями
   - `Tour` - экскурсии
   - `Booking` - бронирования

2. **Alembic миграции**:
   - Настроен Alembic
   - Создана первая миграция `001_initial_schema`
   - Московское время (UTC+3)

3. **Enum типы**:
   - `UserRole` - роли (super_admin, admin, manager, guide, client, exchanger)
   - `BookingStatus` - статусы бронирований
   - `PaymentStatus` - статусы оплаты

---

## 🚀 Инициализация БД (локально)

### 1. Применить миграции:

```bash
cd backend
alembic upgrade head
```

### 2. Создать супер-админа:

```bash
python init_db.py
```

Создастся супер-админ с данными:
- Телефон: `+79177445182` (из env)
- Пароль: `admin123` ⚠️ **ИЗМЕНИТЕ!**
- Роль: super_admin

---

## 🚂 Инициализация БД на Railway

### Вариант 1: Через Railway CLI

```bash
# Установите Railway CLI
npm install -g @railway/cli

# Логин
railway login

# Подключитесь к проекту
railway link

# Подключитесь к backend сервису
railway service

# Выполните миграцию
railway run alembic upgrade head

# Создайте супер-админа
railway run python init_db.py
```

### Вариант 2: Через Web терминал Railway

1. Откройте backend сервис в Railway
2. Перейдите в **Settings** → **Service**
3. Найдите **Connect** (может быть в разделе Database)
4. Откройте Web Shell
5. Выполните:
   ```bash
   cd /app
   alembic upgrade head
   python init_db.py
   ```

### Вариант 3: Автоматически при деплое

Добавьте в `backend/railway.toml`:

```toml
[deploy]
startCommand = "alembic upgrade head && python init_db.py && python3 -m uvicorn app.main:app --host 0.0.0.0 --port $PORT"
```

⚠️ **Внимание**: Это будет выполняться при каждом deploy!

---

## 📊 Структура БД:

```
users
├── id (PK)
├── phone (unique)
├── email (unique, nullable)
├── role (enum)
├── parent_id (FK → users.id)  ← Иерархия!
├── balance_rub, balance_usd, balance_thb
└── created_at, updated_at

tours
├── id (PK)
├── guide_id (FK → users.id)
├── title, description
├── price, duration
├── location, category
├── photos (JSON array)
├── rating, reviews_count
└── active, created_at

bookings
├── id (PK)
├── tour_id (FK → tours.id)
├── client_id (FK → users.id)
├── date, participants_count
├── total_price
├── status, payment_status
├── client_name, client_phone, client_email
└── created_at, updated_at
```

---

## 🎯 Следующие шаги:

1. ✅ Модели созданы
2. ✅ Миграция создана
3. ⏳ Применить миграцию на Railway
4. ⏳ Обновить API endpoints для работы с БД
5. ⏳ Добавить CRUD операции

---

## 💡 Полезные команды:

```bash
# Создать новую миграцию
alembic revision --autogenerate -m "description"

# Применить миграции
alembic upgrade head

# Откатить последнюю миграцию
alembic downgrade -1

# Показать текущую версию БД
alembic current

# История миграций
alembic history
```

---

**База данных готова к использованию!** 🎉
