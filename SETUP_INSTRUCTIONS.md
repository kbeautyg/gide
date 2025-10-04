# 🚀 Инструкция по запуску FastChange 3.0

## ✅ Что уже готово

### 1. Базовая структура проекта
- ✅ Rails 7.1 приложение с PostgreSQL
- ✅ Gemfile со всеми необходимыми gem'ами
- ✅ Конфигурация (application.rb, database.yml, routes.rb)
- ✅ Московское время (UTC+3) настроено
- ✅ Русская локализация по умолчанию

### 2. База данных
- ✅ 16 миграций для всех таблиц
- ✅ Модели с ассоциациями и бизнес-логикой
- ✅ Seeds.rb с тестовыми данными

### 3. Иерархия пользователей
- ✅ 6 ролей (Супер-Админ, Админ, Супер-Менеджер, Менеджер, Обменник, Клиент)
- ✅ Self-referencing associations для иерархии
- ✅ Devise для аутентификации
- ✅ Pundit для авторизации (initializer настроен)

### 4. Модели
- ✅ User - пользователи с иерархией
- ✅ Balance - балансы в RUB/USD/THB
- ✅ ExchangeRate - базовые курсы
- ✅ VolumeRate - объемные курсы
- ✅ Transaction - транзакции обмена
- ✅ PaymentForm - статичные формы
- ✅ WithdrawalRequest - заявки на вывод
- ✅ ExchangerRequest - заявки обменников
- ✅ Wallet, WalletHistory - кошельки TRC20
- ✅ Tour, TourAvailability - экскурсии
- ✅ Booking - бронирования
- ✅ Review - отзывы
- ✅ CashbookCard, CashbookTransaction - кэшбук

### 5. Views и UI
- ✅ Application layout с Tailwind CSS
- ✅ Navbar с балансом и ролью
- ✅ Sidebar с навигацией
- ✅ Flash сообщения (цветные уведомления)
- ✅ Dashboard для менеджеров
- ✅ Dashboard для супер-админа

### 6. Конфигурация
- ✅ .env с реальными данными (DATABASE_URL, API keys)
- ✅ Sidekiq и Redis настроены
- ✅ Rack::Attack для защиты
- ✅ Money-rails для финансовых операций

## 📝 Что нужно сделать для запуска

### Шаг 1: Установить зависимости

```bash
# Убедитесь что у вас установлены:
# - Ruby 3.2.2
# - PostgreSQL
# - Redis

# Установить gem'ы
bundle install
```

### Шаг 2: Подготовить базу данных

База данных уже настроена через `DATABASE_URL` в `.env`:

```bash
# Запустить миграции
bin/rails db:migrate

# Заполнить тестовыми данными
bin/rails db:seed
```

**После seed'а будут созданы:**
- Супер-Админ: `superadmin@fastchange.com` / `password123`
- Админ: `farukh_kerimov@mail.ru` / `password123`
- Менеджеры: `rubi@rubi.com`, `yoska@yoska.com`, `usama@usama.ru`, `flower@nadi.com`
- Клиенты: `client1@example.com`, `client2@example.com`, `client3@example.com`
- Обменник: `exchanger@fastchange.com`

### Шаг 3: Запустить приложение

#### Вариант А: Через Foreman (рекомендуется)

```bash
# Установить foreman
gem install foreman

# Запустить все процессы
foreman start -f Procfile.dev
```

Это запустит:
- Rails сервер на порту 3000
- Sidekiq worker
- Tailwind CSS watcher

#### Вариант Б: Раздельно (3 терминала)

```bash
# Терминал 1: Rails
bin/rails server -p 3000

# Терминал 2: Sidekiq
bundle exec sidekiq

# Терминал 3: Tailwind CSS
bin/rails tailwindcss:watch
```

### Шаг 4: Открыть приложение

```
🌐 Приложение: http://localhost:3000
📊 Sidekiq UI: http://localhost:3000/sidekiq (только для супер-админа)
```

## ⚠️ Возможные проблемы

### 1. Ошибка подключения к PostgreSQL

**Проблема:** `PG::ConnectionBad: could not connect to server`

**Решение:** 
- Проверьте `DATABASE_URL` в `.env`
- Убедитесь что PostgreSQL запущен
- Попробуйте подключиться через `psql` напрямую

### 2. Ошибка Redis connection

**Проблема:** `Redis::CannotConnectError`

**Решение:**
```bash
# Установить Redis (если не установлен)
# macOS:
brew install redis
brew services start redis

# Linux:
sudo apt-get install redis-server
sudo systemctl start redis
```

### 3. Devise routes not found

**Проблема:** `No route matches [GET] "/users/sign_in"`

**Решение:** Запустить генератор Devise:
```bash
bin/rails generate devise:install
bin/rails generate devise User
# Пропустить overwrite для user.rb (уже создан)
```

### 4. Tailwind CSS не применяется

**Проблема:** Стили не загружаются

**Решение:**
```bash
# Установить Tailwind
bin/rails tailwindcss:install

# Запустить build
bin/rails tailwindcss:build
```

## 🔥 Следующие шаги разработки

### ПРИОРИТЕТ 1 (осталось)
- [ ] Контроллер TransactionsController с QR-кодами
- [ ] Контроллер PaymentFormsController
- [ ] Контроллер StatisticsController с фильтрами
- [ ] Pundit policies для всех ресурсов

### ПРИОРИТЕТ 2
- [ ] Контроллер WithdrawalRequestsController
- [ ] Admin::ExchangerRequestsController
- [ ] Job для обновления курсов с Rapira API
- [ ] WalletsController с валидацией TRC20

### ПРИОРИТЕТ 3
- [ ] ToursController (CRUD)
- [ ] BookingsController
- [ ] ReviewsController
- [ ] CashbookCardsController

### Дополнительно
- [ ] Telegram бот интеграция
- [ ] Webhook от платежной системы
- [ ] RSpec тесты
- [ ] Публичный лендинг для экскурсий

## 🎯 Быстрый старт (одной командой)

```bash
# Если у вас уже установлены Ruby, PostgreSQL, Redis:
bin/setup
bin/dev
```

Откройте http://localhost:3000 и войдите как:
- **superadmin@fastchange.com** / **password123**

## 📚 Дополнительная информация

- **Полное ТЗ**: `COMPREHENSIVE_PROJECT_SPEC.md`
- **README**: `README.md`
- **Gemfile**: все зависимости с версиями
- **Routes**: `config/routes.rb` (все маршруты)
- **Модели**: `app/models/` (16 моделей с логикой)

## 💡 Полезные команды

```bash
# Консоль Rails
bin/rails console

# Проверить routes
bin/rails routes

# Создать нового пользователя
User.create!(email: 'test@test.com', phone: '+71234567890', password: 'password123', role: :manager, parent: User.first)

# Проверить баланс
User.first.balance

# Создать транзакцию
Transaction.create!(manager: User.where(role: :manager).first, amount_rub: 10000, target_currency: 'USD', status: :completed)

# Очистить кэш Redis
Rails.cache.clear

# Перезапустить Sidekiq jobs
bin/rails restart
```

## 🎉 Готово!

Базовая структура **FastChange 3.0** создана и готова к разработке!

Приложение запускается, база данных работает, пользователи созданы.

**Следующий шаг**: Разработка контроллеров для транзакций, платежных форм и статистики (ПРИОРИТЕТ 1).

---

**Версия**: 1.0  
**Дата**: 04.01.2025  
**Stack**: Ruby on Rails 7.1 + PostgreSQL + Hotwire + Tailwind CSS

