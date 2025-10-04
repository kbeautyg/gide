# 🚀 FastChange 3.0

**Комплексная платформа для обмена валют и маркетплейса экскурсий в Таиланде**

## 📋 Функционал

- ✅ **Обмен валют** (RUB ↔ THB/USD) с QR-кодами
- ✅ **Иерархия пользователей** (Супер-Админ → Админы → Супер-Менеджеры → Менеджеры → Клиенты)
- ✅ **Система вывода средств** через обменников с управлением долгами
- ✅ **Объемные курсы** с автоматическим применением
- ✅ **Статичные платежные формы** (100+ одновременных оплат)
- ✅ **Маркетплейс экскурсий** (аналог Tripster для Таиланда)
- ✅ **Система бронирования** с календарем доступности
- ✅ **Кэшбук-карты** для клиентов
- ✅ **Отзывы и рейтинги** для туров
- ✅ **Детальная статистика** для каждой роли

## 🛠 Технический стек

### Backend
- **Ruby 3.2.2**
- **Rails 7.1.2** (MVC, не API mode)
- **PostgreSQL 14+** (через Supabase/Railway)
- **Devise** - аутентификация
- **Pundit** - авторизация
- **Sidekiq** - фоновые задачи
- **Redis** - кэширование

### Frontend
- **Hotwire** (Turbo + Stimulus) - современный Rails подход
- **Tailwind CSS** - стилизация
- **ViewComponent** - переиспользуемые компоненты
- **ERB** - шаблонизация

### Интеграции
- **Rapira API** - курсы валют (обновление каждые 60 сек)
- **Telegram Bot** - уведомления
- **TRC20** - кошельки USDT

## 📦 Установка и запуск

### Предварительные требования

```bash
# Ruby 3.2.2
ruby -v

# Rails 7.1+
rails -v

# PostgreSQL
psql --version

# Redis
redis-cli --version

# Bundler
gem install bundler
```

### 1. Клонирование и установка зависимостей

```bash
# Установить зависимости
bundle install

# Установить JS зависимости (если нужно)
bin/rails importmap:install
bin/rails turbo:install
bin/rails stimulus:install
```

### 2. Настройка базы данных

Проект уже настроен на использование PostgreSQL через `DATABASE_URL` из `.env`:

```bash
# База данных создается автоматически через DATABASE_URL
# Запустить миграции
bin/rails db:migrate

# Заполнить тестовыми данными
bin/rails db:seed
```

### 3. Запуск приложения

#### В development режиме:

```bash
# Терминал 1: Rails сервер
bin/rails server -p 3000

# Терминал 2: Sidekiq (фоновые задачи)
bundle exec sidekiq

# Терминал 3: Tailwind CSS (watch mode)
bin/rails tailwindcss:watch
```

#### Или через Procfile (Foreman):

```bash
# Установить foreman
gem install foreman

# Запустить все процессы
foreman start -f Procfile.dev
```

### 4. Доступ к приложению

```
🌐 Приложение: http://localhost:3000
📊 Sidekiq UI: http://localhost:3000/sidekiq (только для супер-админа)
```

### Тестовые учетные данные

После `db:seed`:

```
Супер-Админ:
  Email: superadmin@fastchange.com
  Password: password123

Админ:
  Email: farukh_kerimov@mail.ru
  Password: password123

Менеджер:
  Email: rubi@rubi.com
  Password: password123

Клиент:
  Email: client1@example.com
  Password: password123
```

## 🔐 Переменные окружения

Файл `.env` уже создан с реальными данными:

```env
# База данных
DATABASE_URL=postgresql://supabase_admin:...@yamabiko.proxy.rlwy.net:36914/postgres

# Приложение
APP_BACKEND_URL=http://localhost:8081
GUIDE_PHONE=+79932890755
SUPER_ADMIN_PHONE=+79177445182

# API
RAPIRA_API_URL=https://api.rapira.net/open/market/rates
SUPABASE_KEY=eyJhbGciOi...

# Telegram
TELEGRAM_BOT_TOKEN=8409730364:AAF1NGhtiQaKkh_5QLi9DjFhgBUnVOosvUA
```

## 🏗 Структура проекта

```
fastchange/
├── app/
│   ├── models/          # ActiveRecord модели
│   ├── controllers/     # Controllers (MVC)
│   ├── views/           # ERB шаблоны
│   ├── components/      # ViewComponents
│   ├── javascript/      # Stimulus controllers
│   ├── policies/        # Pundit policies
│   ├── jobs/            # Sidekiq jobs
│   ├── services/        # Business logic
│   └── helpers/         # View helpers
├── db/
│   ├── migrate/         # Миграции
│   └── seeds.rb         # Тестовые данные
├── config/
│   ├── routes.rb        # Маршруты
│   ├── database.yml     # БД конфигурация
│   └── initializers/    # Инициализаторы
└── spec/                # RSpec тесты
```

## 🎯 Основные возможности

### 1. Обмен валют

- Менеджеры создают ссылки/QR-коды для клиентов
- Автоматическое применение объемных курсов
- Комиссия 3% (2.8% сервис + 0.2% обменник)
- Статусы на русском: "В ожидании", "Выполнено", "Отклонено"

### 2. Иерархия пользователей

```
Супер-Админ
  └─ Админ (Farukh)
      ├─ Супер-Менеджер
      └─ Менеджеры (Rubi, Yoska, Usama, Flower)
```

Каждый видит только свою когорту.

### 3. Вывод средств

```
Менеджер → Транзакции → Баланс Админа ↑
Админ → Заявка на вывод (кошелек TRC20)
Супер-Админ → Одобрение → Общая заявка для обменника
Обменник → Выполнение → Долг перед обменником
Супер-Админ → Погашение долга
```

### 4. Маркетплейс экскурсий

- **Для клиентов**: Каталог туров (как Tripster), бронирование, оплата
- **Для гидов**: Создание туров, календарь, управление бронированиями
- **Кэшбук-карты**: Пополнение, оплата экскурсий, кэшбэк

### 5. Статистика

- Супер-Админ: вся система
- Админ: своя когорта
- Менеджер: только свои данные
- Фильтры: по датам, ролям, типу операций

## ⚠️ Исправленные баги

✅ **Московское время (UTC+3)** везде  
✅ **Статусы на русском** в UI  
✅ **Транзакции "успешно"** корректно записываются  
✅ **QR-код** правильного размера  
✅ **Комиссии** считаются точно (2.8% + 0.2%)  

## 🧪 Тестирование

```bash
# Запустить все тесты
bundle exec rspec

# Только модели
bundle exec rspec spec/models

# С покрытием кода
COVERAGE=true bundle exec rspec
```

## 📚 API Endpoints

### Публичные
- `GET /tours/catalog` - Каталог экскурсий
- `GET /pay/:token` - Оплата через форму
- `POST /api/v1/webhooks/payment` - Webhook от платежной системы

### Защищенные (требуют авторизации)
- `GET /dashboard` - Главная страница (по роли)
- `GET /transactions` - Транзакции
- `GET /payment_forms` - Платежные формы
- `GET /withdrawal_requests` - Заявки на вывод
- `GET /tours` - Управление экскурсиями
- `GET /statistics` - Статистика

## 🔄 Фоновые задачи (Sidekiq)

- **UpdateExchangeRatesJob** - Обновление курсов с Rapira API (каждую минуту)
- **SendTelegramNotificationJob** - Отправка уведомлений в Telegram
- **UpdateTourRatingsJob** - Пересчет рейтингов экскурсий

## 🚀 Деплой

### Railway / Heroku

```bash
# Добавить buildpacks
heroku buildpacks:add heroku/ruby
heroku buildpacks:add heroku/nodejs

# Установить переменные окружения
heroku config:set DATABASE_URL=...
heroku config:set REDIS_URL=...

# Деплой
git push heroku main

# Миграции
heroku run rails db:migrate

# Seeds
heroku run rails db:seed
```

## 📞 Поддержка

- **Email**: support@fastchange.com
- **Telegram**: @fastchange_support
- **Документация**: [COMPREHENSIVE_PROJECT_SPEC.md](./COMPREHENSIVE_PROJECT_SPEC.md)

## 📄 Лицензия

Proprietary - FastChange 3.0 © 2025

---

**Разработано на Ruby on Rails 7.1 с Hotwire (Turbo + Stimulus)**

🎯 **Версия**: 1.0.0  
📅 **Дата**: 04.01.2025  

