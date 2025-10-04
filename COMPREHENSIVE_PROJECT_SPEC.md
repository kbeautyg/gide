# 🎯 FASTCHANGE 3.0 - ПОЛНОЕ ТЕХНИЧЕСКОЕ ЗАДАНИЕ

> **ПРОМТ ДЛЯ РАЗРАБОТКИ** - Этот документ содержит полное ТЗ для создания платформы FastChange 3.0 с нуля

## 📋 КРАТКОЕ ОПИСАНИЕ ПРОЕКТА

**FastChange 3.0** - Комплексная платформа для:
1. **Обмена валют** (RUB ↔ THB/USD) с QR-кодами и платежными формами
2. **Вывода средств** через обменников с системой долгов и комиссий
3. **Маркетплейса экскурсий** в Таиланде (аналог Tripster)
4. **Многоуровневой иерархии** пользователей с детальной статистикой

---

## ⚠️ ВАЖНО: ПРИОРИТЕТЫ И ПОСЛЕДОВАТЕЛЬНОСТЬ

**Задачи выполнять СТРОГО в указанной последовательности:**

### 🔥 ПРИОРИТЕТ 1 (КРИТИЧНО):
1. Иерархия пользователей и система ролей
2. Базовые курсы + объемные курсы
3. Транзакции обмена валют с QR-кодами
4. Статичные платежные формы
5. Статистика с фильтрами для каждой роли

### 🔥 ПРИОРИТЕТ 2 (ВЫСОКИЙ):
6. Система вывода средств (админы → обменники)
7. Управление долгами перед обменниками
8. Интеграция Rapira API для курсов
9. Кошельки TRC20 с валидацией

### 🔥 ПРИОРИТЕТ 3 (СРЕДНИЙ):
10. Маркетплейс экскурсий (каталог, карточки)
11. Система бронирования туров
12. Календарь доступности для гидов
13. Отзывы и рейтинги

### 🔥 ПРИОРИТЕТ 4 (НИЗКИЙ):
14. Кэшбук-карты для клиентов
15. Публичный лендинг (как Tripster)
16. Telegram бот интеграция
17. Мобильная адаптация

---

## 👥 ИЕРАРХИЯ ПОЛЬЗОВАТЕЛЕЙ

```
Супер-Админ (Super Admin)
    ↓
Админы (Admins)
    ↓
Супер-Менеджеры (Super Managers)
    ↓
Менеджеры (Managers)
    ↓
Клиенты (Clients)

+ Обменники (Exchangers) - отдельная роль
```

### Роли и права:

#### 1. **Супер-Админ**
- Полный доступ ко всей системе
- Видит статистику всех пользователей
- Управляет курсами валют (базовый + объемные)
- Утверждает заявки на вывод от админов
- Создает общие заявки для обменников
- Управляет долгами перед обменниками
- Настраивает распределение комиссий (сервис 2.8% + обменник 0.2%)
- Может переназначать менеджеров между админами

#### 2. **Админ**
- Управляет своей когортой (супер-менеджеры + менеджеры)
- Создает супер-менеджеров и менеджеров
- Видит статистику своей когорты
- Создает коды приглашений
- Создает заявки на вывод с указанием кошелька TRC20
- Может менять курсы для всех своих менеджеров сразу

#### 3. **Супер-Менеджер**
- Управляет группой менеджеров
- Создает менеджеров
- Видит статистику своих менеджеров
- Может менять курсы для своих менеджеров
- Создает платежные формы

#### 4. **Менеджер (Гид)**
- Создает платежные ссылки и QR-коды
- Создает статичные платежные формы
- Получает уведомления о платежах
- Видит только свою статистику
- Работает с клиентами
- **НОВОЕ**: Создает экскурсии (карточки туров)
- **НОВОЕ**: Управляет календарем экскурсий
- **НОВОЕ**: Принимает бронирования экскурсий

#### 5. **Обменник**
- Выполняет заявки на вывод средств
- Видит свои заявки и статистику
- Видит историю выплат и долгов
- Получает комиссию 0.2%

#### 6. **Клиент**
- Оплачивает через ссылки/QR-коды/статичные формы
- **НОВОЕ**: Бронирует экскурсии
- **НОВОЕ**: Пополняет кэшбук-карту
- **НОВОЕ**: Оставляет отзывы

---

## 💰 СИСТЕМА ВЫВОДА СРЕДСТВ

### Workflow:

```
1. Менеджер принимает платежи → Баланс админа растет
2. Админ создает заявку на вывод → Указывает кошелек TRC20
3. Супер-Админ утверждает заявки → Накапливает несколько
4. Супер-Админ создает общую заявку для обменника
5. Обменник выполняет заявку → Переводит USDT
6. Система фиксирует долг перед обменником
7. Супер-Админ погашает долг рублями
```

### Комиссии:

- **Общая комиссия системы**: 3% (фиксировано)
- **Распределение**:
  - Сервис (супер-админ): 2.8%
  - Обменник: 0.2%

### Формула расчета для вывода 1,000,000 RUB:

```
Курс Rapira: 91.50
Комиссия обменника: +0.20
Итоговый курс: 91.70
Общая комиссия: 30,000 RUB (3%)
  - Сервис: 28,000 RUB
  - Обменник: 2,000 RUB
К конвертации: 970,000 RUB
Итого USDT: 970,000 / 91.70 = 10,578.19 USDT
```

---

## 📊 СИСТЕМА КУРСОВ

### 1. Базовый курс (глобальный)
- Устанавливается супер-админом
- Применяется по умолчанию ко всем операциям
- Может быть изменен админом/супер-менеджером для своей когорты

### 2. Объемные курсы
- Автоматически применяются при достижении порога
- Настраиваются супер-админом/админом
- Пример:
  ```
  Базовый курс: 89.5
  
  Объемные курсы:
  - 100,000 RUB → 90.5
  - 200,000 RUB → 91.0
  - 500,000 RUB → 92.0
  ```
- Применяется самый высокий достигнутый порог

### 3. Интеграция с биржей Rapira
- API для получения актуального курса USDT/RUB
- Обновление каждые 60 секунд
- Резервный режим при недоступности API

---

## 📝 СТАТИЧНЫЕ ПЛАТЕЖНЫЕ ФОРМЫ

### Функционал:
- Менеджер создает форму с фиксированными параметрами
- Генерируется постоянная ссылка
- Множество клиентов могут одновременно оплачивать
- Каждый платеж автоматически привязывается к менеджеру
- Статистика по форме: количество оплат, общая сумма

### Ограничения:
- Максимум 100 оплат на форму (настраивается)
- Можно архивировать форму

---

## 🎭 МАРКЕТПЛЕЙС ЭКСКУРСИЙ (НОВОЕ!)

### Концепция:
По аналогии с Tripster, но для Таиланда. Менеджеры = Гиды.

### Публичная часть (для клиентов):

#### 1. **Лендинг**
- Яркая главная с поиском экскурсий
- Блоки: "Как это работает", "Популярные экскурсии", "Отзывы"
- Акцент на оплату российскими картами + СБП + QR-коды

#### 2. **Каталог экскурсий**
- Фильтры: город, тематика, длительность, цена
- Обогащенные карточки:
  - Галерея фото/видео
  - Детальное описание
  - Информация о гиде (менеджере)
  - Календарь доступности
  - Рейтинг и отзывы
  - Кнопка "Забронировать"

#### 3. **Система бронирования**
- Выбор даты из календаря
- Выбор количества участников
- Онлайн-оплата (карты РФ, СБП, QR-код)
- Электронный ваучер после оплаты

#### 4. **Отзывы и рейтинги**
- Открытые отзывы для каждого тура
- Рейтинг гида (менеджера)

### Личный кабинет менеджера (гида):

#### 1. **Управление экскурсиями**
- Создание карточек туров
- Фото, описание, маршрут
- Фиксированные цены или гибкие
- Длительность, точка встречи

#### 2. **Календарь и расписание**
- Визуальный календарь
- Отметка доступных/занятых дат
- Предотвращение двойных бронирований

#### 3. **Работа с бронированиями**
- Новые бронирования
- Подтверждение заказов
- Связь с клиентами (чат)
- Согласование индивидуальной стоимости

#### 4. **Прием платежей за экскурсии**
- Генерация персональных ссылок на оплату
- Генерация QR-кодов
- Отслеживание статуса оплаты в реальном времени

### Кэшбук-карта (новое!):
- Клиент пополняет виртуальную карту
- Оплачивает экскурсии с этой карты
- Бонусы и кэшбэк

---

## 📈 СТАТИСТИКА И ОТЧЕТНОСТЬ

### Дашборд Супер-Админа:
```
ОБЩАЯ СТАТИСТИКА ЗА МЕСЯЦ
├─ Общий оборот: 15,000,000 RUB
├─ Общая комиссия (3%): 450,000 RUB
├─ Ваша прибыль (2.8%): 420,000 RUB
├─ Комиссия обменников (0.2%): 30,000 RUB
├─ Текущий долг перед обменниками: 2,292,500 RUB
└─ Статистика по админам (таблица)
```

### Фильтры:
- По ролям (админы, супер-менеджеры, менеджеры)
- По конкретному пользователю
- По дате (диапазон)
- По типу операции (обмен валюты / экскурсии)

### Данные отчетов:
- Количество операций
- Общий объем выручки
- Общий объем выданных средств
- Доход системы

---

## 🔧 ИСПРАВЛЕНИЯ ИЗВЕСТНЫХ БАГОВ

> **Реальная обратная связь от клиента farukh_kerimov@mail.ru (админ)**

### 🚨 Критичные:
1. **Транзакции не записываются со статусом "успешно"**
   - Проблема: Реальные успешные платежи не фиксируются в БД или попадают в статус "declined"
   - Пример: Транзакция есть, но под фарой её не видно, находится через поиск по "оплата" со статусом declined
   - **Решение**: Проверить логику записи транзакций, webhook'и платежей, убедиться что все успешные операции пишутся со статусом "completed"

2. **Время на сайте отстает на 6 часов от Москвы**
   - Текущее: сейчас на сайте -6 от москвы
   - Требуется: Московское время (UTC+3) везде - на сайте и на чеках
   - **Решение**: Установить timezone 'Europe/Moscow' глобально, использовать везде

3. **QR-код меньше окошка под него**
   - Визуальная проблема: QR не занимает всё отведённое пространство
   - **Решение**: Подогнать размеры QR-кода под контейнер

4. **Статусы на английском**
   - Текущее: pending, completed, declined
   - Требуется: Русский язык (в ожидании, выполнено, отклонено)
   - **Решение**: Перевести все статусы на русский в UI

5. **Кнопка "Мой QR" не работает в Safari**
   - В Яндекс браузере работает, в Safari не активна
   - **Решение**: Проверить совместимость JS/CSS с Safari, исправить

### ⚠️ Средние:
6. **Потерянные пользователи**
   - Под админом Farukh нет менеджеров: Rubi (rubi@rubi.com), Yoska (yoska@yoska.com)
   - Менеджер usama@usama.com был удален, пересоздан как usama@usama.ru
   - **Решение**: Восстановить или пересоздать этих пользователей с правильной привязкой

7. **Переназначение менеджера**
   - Требуется: перенести flower@nadi.com с Kiril (kiril@kiril.com) на Farukh (farukh_kerimov@mail.ru)
   - **Решение**: Функция переназначения менеджера между админами

8. **Временные права супер-админа для нового админа**
   - Баг: При создании админа у него появляются права супер-админа пока он не создаст менеджера себе
   - **Решение**: Строгая проверка прав, админ не должен иметь доступ к функциям супер-админа

9. **UI/UX улучшения**
   - Кнопки занимают много места (сейчас display: none)
   - **Решение**: Переработать навигацию для экономии места рабочей области

---

## 🗄️ СТРУКТУРА БАЗЫ ДАННЫХ

### Основные таблицы:

```sql
-- Пользователи
users (id, email, phone, role, parent_id, created_at)

-- Баланс пользователей
balances (user_id, balance_rub, balance_usd, balance_thb)

-- Курсы валют
exchange_rates (id, base_rate, created_by, created_at)
volume_rates (id, threshold, rate, created_by, created_at)

-- Транзакции обмена
transactions (id, manager_id, amount_rub, amount_foreign, currency, rate, status, created_at)

-- Платежные формы
payment_forms (id, manager_id, name, amount, rate, max_uses, uses_count, active, created_at)

-- Заявки на вывод
withdrawal_requests (
  id, admin_id, amount_rub, amount_usd, 
  wallet_trc20, status, rate, created_at
)

-- Заявки обменников
exchanger_requests (
  id, exchanger_id, total_amount_rub, total_amount_usd,
  status, debt_remaining, created_at
)

-- Связь заявок админов и обменников
request_items (withdrawal_request_id, exchanger_request_id, amount_usd)

-- Кошельки TRC20
wallets (user_id, address, verified, created_at)

-- История кошельков
wallet_history (user_id, old_address, new_address, reason, ip, created_at)

-- === НОВОЕ: МАРКЕТПЛЕЙС ЭКСКУРСИЙ ===

-- Экскурсии
tours (
  id, manager_id, title, description, 
  price, duration, location, photos, 
  rating, reviews_count, active, created_at
)

-- Календарь доступности
tour_availability (tour_id, date, available_slots, booked_slots)

-- Бронирования экскурсий
bookings (
  id, tour_id, client_id, date, 
  participants_count, total_price, 
  status, payment_status, created_at
)

-- Отзывы
reviews (
  id, tour_id, client_id, booking_id,
  rating, comment, created_at
)

-- Кэшбук-карты клиентов
cashbook_cards (
  client_id, balance, bonus_balance,
  total_spent, created_at
)

-- Транзакции кэшбук
cashbook_transactions (
  id, card_id, amount, type,
  description, created_at
)
```

---

## 🎨 ТЕХНИЧЕСКИЙ СТЕК

### Backend:
- **Ruby 3.2+**
- **Ruby on Rails 7.1+** - MVC фреймворк
- **PostgreSQL** - основная БД (supabase)
- **Redis** - кэширование и фоновые задачи
- **Sidekiq** - асинхронная обработка задач
- **Devise** - аутентификация
- **Pundit** или **CanCanCan** - авторизация и права доступа
- **JWT** - токены для API
- **ActiveStorage** - загрузка файлов (фото экскурсий)
- **Action Cable** - WebSocket для real-time уведомлений

### Frontend:
- **Ruby on Rails Views** (ERB/Slim/HAML)
- **Hotwire** - современный подход Rails (без React!)
  - **Turbo** - навигация без перезагрузки страницы
  - **Stimulus.js** - легкий JavaScript фреймворк
  - **Turbo Frames** - частичное обновление страниц
  - **Turbo Streams** - real-time обновления
- **Tailwind CSS** или **Bootstrap 5** - стили
- **ViewComponent** - переиспользуемые компоненты
- **Importmap-rails** - управление JS без сборщиков

### База данных:
- **PostgreSQL 14+**
- **ActiveRecord** - ORM
- **pg** gem - PostgreSQL adapter

### API (для внешних интеграций):
- **Обычные Rails контроллеры** (не API mode)
- **JSON endpoints** для AJAX запросов (Turbo/Stimulus)
- **respond_to** блоки для HTML/JSON форматов

### Фоновые задачи:
- **Sidekiq** - очереди задач
- **Redis** - брокер сообщений
- **Cron jobs** (whenever gem) - периодические задачи (обновление курсов)

### Интеграции:
- **telegram-bot-ruby** - Telegram Bot API
- **httparty** или **faraday** - HTTP запросы к внешним API
- **Rapira API** - курсы валют (автообновление через Sidekiq)
- **Payment Gateway** - СБП, карты РФ (ЮKassa, CloudPayments, или кастом)

### Безопасность:
- **rack-attack** - rate limiting
- **brakeman** - security scanner
- **bundler-audit** - проверка уязвимостей в gem'ах
- **strong_parameters** - защита от mass assignment

### Тестирование:
- **RSpec** - unit и integration тесты
- **FactoryBot** - фабрики тестовых данных
- **Faker** - генерация фейковых данных
- **Capybara** - E2E тесты
- **SimpleCov** - покрытие кода

### Деплой:
- **Railway** или **Heroku** - хостинг
- **Docker** - контейнеризация (опционально)
- **Puma** - application server
- **Nginx** - reverse proxy (на проде)

---

## 🚀 ЭТАПЫ РАЗРАБОТКИ (Ruby on Rails)

### Этап 1: Инициализация Rails проекта
```bash
rails new fastchange --database=postgresql --css=tailwind --javascript=importmap
cd fastchange
# Добавить gem'ы в Gemfile
bundle install
rails db:create
```

**Ключевые gem'ы:**
```ruby
# Gemfile
gem 'devise'              # Аутентификация
gem 'pundit'              # Авторизация
gem 'sidekiq'             # Фоновые задачи
gem 'redis'               # Кэширование
gem 'turbo-rails'         # Hotwire Turbo (уже включен в Rails 7)
gem 'stimulus-rails'      # Hotwire Stimulus (уже включен)
gem 'view_component'      # Компоненты
gem 'pagy'                # Пагинация
gem 'kaminari'            # Альтернатива пагинации
gem 'telegram-bot-ruby'   # Telegram бот
gem 'httparty'            # HTTP запросы
gem 'rqrcode'             # Генерация QR-кодов

group :development, :test do
  gem 'rspec-rails'
  gem 'factory_bot_rails'
  gem 'faker'
  gem 'pry-rails'
end
```

### Этап 2: Модели и миграции (ActiveRecord)
```ruby
# Создание моделей через генераторы
rails g model User email:string phone:string role:string parent:references
rails g model Balance user:references balance_rub:decimal balance_usd:decimal
rails g model Transaction manager:references amount_rub:decimal rate:decimal
rails g model Tour manager:references title:string description:text price:decimal
# ... и т.д.
```

**Associations (важно!):**
```ruby
# app/models/user.rb
class User < ApplicationRecord
  belongs_to :parent, class_name: 'User', optional: true
  has_many :children, class_name: 'User', foreign_key: 'parent_id'
  has_one :balance
  has_many :transactions, foreign_key: 'manager_id'
  has_many :tours, foreign_key: 'manager_id'
  
  enum role: { super_admin: 0, admin: 1, super_manager: 2, manager: 3, exchanger: 4, client: 5 }
end
```

### Этап 3: Контроллеры и Views (MVC)
```bash
# Генерация контроллеров с Views
rails g controller Users index show new edit
rails g controller Transactions index show new
rails g controller Tours index show new edit
rails g controller Dashboard index
rails g controller Statistics index
```

**Пример контроллера с Hotwire:**
```ruby
# app/controllers/transactions_controller.rb
class TransactionsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_transaction, only: [:show, :edit, :update]
  
  def index
    @transactions = policy_scope(Transaction)
      .where(filter_params)
      .order(created_at: :desc)
      .page(params[:page])
    
    # Turbo: обновление части страницы без полной перезагрузки
    respond_to do |format|
      format.html
      format.turbo_stream
    end
  end
  
  def show
    authorize @transaction
    # app/views/transactions/show.html.erb будет отрендерен
  end
  
  private
  
  def set_transaction
    @transaction = Transaction.find(params[:id])
  end
end
```

**Пример View с Turbo Frame:**
```erb
<!-- app/views/transactions/index.html.erb -->
<div class="container mx-auto px-4">
  <h1 class="text-3xl font-bold mb-6">Транзакции</h1>
  
  <%= turbo_frame_tag "transactions" do %>
    <div class="grid gap-4">
      <%= render @transactions %>
    </div>
    <%= pagy_nav(@pagy) if @pagy %>
  <% end %>
</div>

<!-- app/views/transactions/_transaction.html.erb (partial) -->
<%= turbo_frame_tag dom_id(transaction), class: "bg-white rounded-lg shadow p-4" do %>
  <div class="flex justify-between">
    <div>
      <p class="font-semibold"><%= transaction.amount_rub %> ₽</p>
      <p class="text-sm text-gray-600"><%= l(transaction.created_at, format: :short) %></p>
    </div>
    <span class="badge <%= status_badge_class(transaction.status) %>">
      <%= t("transaction.status.#{transaction.status}") %>
    </span>
  </div>
<% end %>
```

### Этап 4: Авторизация (Pundit policies)
```ruby
# app/policies/transaction_policy.rb
class TransactionPolicy < ApplicationPolicy
  def index?
    case user.role
    when 'super_admin' then true
    when 'admin' then record.manager.in_hierarchy_of?(user)
    when 'manager' then record.manager_id == user.id
    else false
    end
  end
end
```

### Этап 5: Фоновые задачи (Sidekiq)
```ruby
# app/jobs/update_exchange_rates_job.rb
class UpdateExchangeRatesJob < ApplicationJob
  queue_as :default
  
  def perform
    # Запрос к Rapira API
    # Обновление курсов в БД
  end
end

# config/schedule.rb (whenever gem)
every 1.minute do
  runner "UpdateExchangeRatesJob.perform_later"
end
```

### Этап 6: Hotwire и Stimulus (JavaScript)
```javascript
// app/javascript/controllers/qr_code_controller.js (Stimulus)
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["code", "canvas"]
  
  connect() {
    this.generateQR()
  }
  
  generateQR() {
    // Генерация QR-кода через библиотеку
    const qr = new QRious({
      element: this.canvasTarget,
      value: this.codeTarget.dataset.url,
      size: 300
    })
  }
  
  download() {
    // Скачивание QR-кода
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = this.canvasTarget.toDataURL()
    link.click()
  }
}
```

**Использование Stimulus в Views:**
```erb
<!-- app/views/payment_forms/show.html.erb -->
<div data-controller="qr-code">
  <div data-qr-code-target="code" data-url="<%= @form.payment_url %>"></div>
  <canvas data-qr-code-target="canvas"></canvas>
  <button data-action="click->qr-code#download" class="btn btn-primary">
    Скачать QR-код
  </button>
</div>
```

**Real-time обновления (Turbo Streams):**
```ruby
# app/models/transaction.rb
after_create_commit -> { broadcast_prepend_to "transactions" }
after_update_commit -> { broadcast_replace_to "transactions" }
```

### Этап 7: Тестирование (RSpec)
```ruby
# spec/models/user_spec.rb
# spec/requests/api/v1/transactions_spec.rb
# spec/policies/transaction_policy_spec.rb
# spec/jobs/update_exchange_rates_job_spec.rb
```

### Этап 8: Деплой
```bash
# Heroku/Railway
git push heroku main
heroku run rails db:migrate
heroku run rails db:seed
```

---

## 📦 СТРУКТУРА RAILS ПРОЕКТА

```
fastchange/
├── app/
│   ├── models/
│   │   ├── user.rb
│   │   ├── transaction.rb
│   │   ├── tour.rb
│   │   ├── booking.rb
│   │   └── ... (все модели)
│   ├── controllers/
│   │   ├── application_controller.rb
│   │   ├── users_controller.rb
│   │   ├── transactions_controller.rb
│   │   ├── tours_controller.rb
│   │   ├── bookings_controller.rb
│   │   ├── statistics_controller.rb
│   │   ├── dashboard_controller.rb
│   │   └── admin/
│   │       ├── users_controller.rb
│   │       ├── exchange_rates_controller.rb
│   │       └── withdrawal_requests_controller.rb
│   ├── views/
│   │   ├── layouts/
│   │   │   ├── application.html.erb
│   │   │   ├── admin.html.erb
│   │   │   └── public.html.erb
│   │   ├── users/
│   │   │   ├── index.html.erb
│   │   │   ├── show.html.erb
│   │   │   └── _user.html.erb (partial)
│   │   ├── transactions/
│   │   │   ├── index.html.erb
│   │   │   ├── show.html.erb
│   │   │   └── _transaction.html.erb
│   │   ├── tours/
│   │   │   ├── index.html.erb (каталог как Tripster)
│   │   │   ├── show.html.erb (карточка тура)
│   │   │   └── _tour.html.erb
│   │   ├── dashboard/
│   │   │   └── index.html.erb
│   │   └── statistics/
│   │       └── index.html.erb
│   ├── components/ (ViewComponent)
│   │   ├── qr_code_component.rb
│   │   ├── status_badge_component.rb
│   │   └── tour_card_component.rb
│   ├── javascript/
│   │   ├── controllers/ (Stimulus)
│   │   │   ├── qr_code_controller.js
│   │   │   ├── filter_controller.js
│   │   │   └── booking_controller.js
│   │   └── application.js
│   ├── policies/ (Pundit)
│   │   ├── user_policy.rb
│   │   ├── transaction_policy.rb
│   │   └── tour_policy.rb
│   ├── jobs/ (Sidekiq)
│   │   ├── update_exchange_rates_job.rb
│   │   └── send_telegram_notification_job.rb
│   ├── helpers/
│   │   ├── application_helper.rb
│   │   ├── transactions_helper.rb
│   │   └── tours_helper.rb
│   └── services/ (Business logic)
│       ├── currency_exchange_service.rb
│       ├── withdrawal_service.rb
│       └── booking_service.rb
├── db/
│   ├── migrate/
│   │   ├── 001_create_users.rb
│   │   ├── 002_create_balances.rb
│   │   └── ... (все миграции)
│   └── seeds.rb (начальные данные)
├── spec/ (RSpec тесты)
├── config/
│   ├── routes.rb
│   ├── database.yml
│   ├── tailwind.config.js
│   ├── importmap.rb
│   └── initializers/
├── public/ (статика)
├── Gemfile
└── README.md
```

---

## 📱 ДИЗАЙН И UX

### Общий стиль:
- Современный, минималистичный
- Корпоративные цвета + акцентные кнопки
- Интуитивно понятный интерфейс

### Публичная часть:
- Похожа на Tripster
- Продающий дизайн
- Акцент на простоту оплаты

### Личные кабинеты:
- Чистый, как CRM-системы (Notion, Trello)
- Боковое меню
- Дашборд с ключевыми метриками

---

## ✅ ACCEPTANCE CRITERIA

### Обмен валюты:
- [x] Менеджер создает ссылку/QR за 30 секунд
- [x] Клиент оплачивает за 1 минуту
- [x] Система корректно применяет объемные курсы
- [x] Статичные формы поддерживают 100+ одновременных оплат

### Вывод средств:
- [x] Админ создает заявку с кошельком TRC20
- [x] Супер-админ формирует общую заявку для обменника
- [x] Система корректно считает долги и комиссии
- [x] История кошельков логируется

### Маркетплейс:
- [x] Клиент находит экскурсию за 3 клика
- [x] Бронирование завершается за 2 минуты
- [x] Менеджер создает тур за 5 минут
- [x] Календарь предотвращает двойные бронирования
- [x] Кэшбук корректно списывает средства

### Статистика:
- [x] Каждая роль видит только свою статистику
- [x] Супер-админ видит всю картину
- [x] Отчеты формируются за 3 секунды
- [x] Фильтры работают корректно

---

## 🔒 БЕЗОПАСНОСТЬ

1. JWT токены с истечением 24 часа
2. Роли и права доступа строго разграничены
3. Валидация всех входящих данных
4. SQL injection защита (параметризованные запросы)
5. XSS защита
6. CORS правильно настроен
7. Логирование всех финансовых операций
8. Шифрование чувствительных данных (кошельки, API ключи)

---

## 🎯 ИТОГОВЫЙ ФУНКЦИОНАЛ

**FastChange 3.0** = 

- Платформа обмена валют с многоуровневой иерархией ✅
- Система вывода через обменников с долгами ✅
- Интеграция реальных курсов (Rapira) ✅
- Гибкое ценообразование (объемные курсы) ✅
- Статичные платежные формы ✅
- **Маркетплейс экскурсий в Таиланде** 🆕
- **Кэшбук-карты для клиентов** 🆕
- Полная финансовая отчетность ✅

---

---

## 🎯 ИСПОЛЬЗОВАНИЕ ЭТОГО ПРОМТА

Этот документ - **полное техническое задание** для разработки FastChange 3.0 на Ruby on Rails.

### Для разработчика:
1. Читай ТЗ **последовательно**, соблюдая приоритеты
2. Начни с **Этап 1** (инициализация Rails проекта)
3. Используй указанные gem'ы и подходы
4. Следуй Rails Best Practices (Convention over Configuration)
5. Пиши тесты (RSpec) для каждого функционала
6. Исправь **известные баги** из раздела 🔧

### Для AI/LLM:
- Это промт содержит все требования проекта
- Генерируй код на **Ruby on Rails MVC**, а не API mode
- **Frontend = Rails Views + Hotwire (Turbo + Stimulus)**, а не React!
- Используй **Tailwind CSS** для стилей
- Соблюдай иерархию пользователей и права доступ (Pundit)
- Все финансовые расчеты должны быть точными (BigDecimal)
- Используй Sidekiq для фоновых задач (обновление курсов, уведомления)
- Генерируй **ERB views**, не JSON API

### Почему Hotwire вместо React:
✅ **Проще** - весь код на одном языке (Ruby)  
✅ **Быстрее** - нет сборки frontend, нет API прослойки  
✅ **Современно** - Turbo дает SPA-опыт без JavaScript фреймворков  
✅ **SEO-friendly** - серверный рендеринг из коробки  
✅ **Меньше кода** - не нужны serializers, CORS, два роутинга

### Ключевые точки внимания:
- ⚠️ **Московское время** (UTC+3) везде
- ⚠️ **Статусы на русском** в UI
- ⚠️ **Транзакции "успешно"** должны корректно записываться
- ⚠️ **Права доступа** строго по иерархии (админ не видит чужих менеджеров)
- ⚠️ **Комиссии** считаются корректно (2.8% + 0.2% = 3%)

---

**🚀 FastChange 3.0 - Готов к разработке на Ruby on Rails!**

> **Версия промта:** 1.1 (Full Rails Stack)  
> **Дата:** 2025-01-04  
> **Backend:** Ruby on Rails 7.1+ (MVC)  
> **Frontend:** Rails Views + Hotwire (Turbo + Stimulus)  
> **Стили:** Tailwind CSS  
> **База данных:** PostgreSQL 14+  
> **Без:** React, TypeScript, отдельного SPA

