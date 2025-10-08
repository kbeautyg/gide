# 🔄 Руководство по миграции базы данных

## ✅ Изменения загружены на GitHub

Коммит: `4685ca4`  
Сообщение: "Airbnb design + Tripster content: redesign complete"

**Статистика:**
- 47 файлов изменено
- 6,987 строк добавлено
- 546 строк удалено

---

## 📋 Применение миграции

### Вариант 1: Локальная разработка

```bash
cd backend
alembic upgrade head
python seed_data.py
```

### Вариант 2: Railway/Production

1. **Подключитесь к Railway**:
```bash
railway link
railway run alembic upgrade head
railway run python seed_data.py
```

2. **Или через Railway Dashboard**:
- Зайдите в проект
- Settings → Deploy → Manual Deploy
- После деплоя запустите миграцию через Railway CLI

### Вариант 3: Пересоздать БД (если нужно)

```bash
cd backend
python reset_db.py          # Очистит всё
alembic upgrade head        # Применит все миграции
python seed_data.py         # Заполнит данными
```

---

## 🗄️ Что изменилось в БД

### Новые поля в таблице `tours`

```sql
-- Контентные блоки
what_to_expect TEXT
organizational_details TEXT
included JSON
not_included JSON
meeting_point VARCHAR
languages JSON

-- Параметры
max_group_size INTEGER
min_age INTEGER
difficulty_level VARCHAR

-- Категоризация
landmarks JSON
tags JSON
themes JSON
formats JSON

-- SEO
seo_title VARCHAR
seo_description TEXT
long_description TEXT

-- Статистика и промо
total_bookings INTEGER DEFAULT 0
views_count INTEGER DEFAULT 0
has_discount BOOLEAN DEFAULT false
is_new BOOLEAN DEFAULT false
discount_percentage INTEGER
original_price FLOAT
```

### Новые таблицы

**destinations** (направления):
```sql
id SERIAL PRIMARY KEY
name VARCHAR NOT NULL
country VARCHAR NOT NULL
slug VARCHAR UNIQUE NOT NULL
photo_url VARCHAR
tours_count INTEGER DEFAULT 0
description TEXT
seo_text TEXT
created_at TIMESTAMP
```

**landmarks** (достопримечательности):
```sql
id SERIAL PRIMARY KEY
destination_id INTEGER REFERENCES destinations(id)
name VARCHAR NOT NULL
photo_url VARCHAR
tours_count INTEGER DEFAULT 0
description TEXT
created_at TIMESTAMP
```

**reviews** (отзывы):
```sql
id SERIAL PRIMARY KEY
tour_id INTEGER REFERENCES tours(id)
user_name VARCHAR NOT NULL
user_photo VARCHAR
rating FLOAT NOT NULL
text TEXT NOT NULL
experience_count INTEGER DEFAULT 1
created_at TIMESTAMP
```

**articles** (статьи журнала):
```sql
id SERIAL PRIMARY KEY
title VARCHAR NOT NULL
slug VARCHAR UNIQUE NOT NULL
preview_text TEXT
content TEXT NOT NULL
photo_url VARCHAR
read_time INTEGER DEFAULT 5
published_at TIMESTAMP
country_tag VARCHAR
views_count INTEGER DEFAULT 0
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

## 📊 Что создаст seed_data.py

### Направления (5)
- Тбилиси, Грузия
- Стамбул, Турция
- Бангкок, Таиланд
- Дубай, ОАЭ
- Париж, Франция

### Достопримечательности (4 для Тбилиси)
- Серные бани
- Крепость Нарикала
- Площадь Свободы
- Мост Мира

### Статьи (3)
- "Как добраться до Китайской стены"
- "Древние храмы Египта"
- "Пляжи Стамбула"

### Отзывы (30)
- По 3 отзыва для первых 10 туров
- С именами: Мария, Андрей, Дарья, Игорь, Таня
- Рейтинги: 4.5-5.0

### Обновление туров
Для каждого существующего тура:
- **Темы**: случайные из [Винные, Казбеги, Кахетия, Гастрономические, История, На море, VIP]
- **Форматы**: [Индивидуальные, Семейный, Треккинг, Всё включено]
- **Промо**: каждый 4-й = скидка 20%, каждый 5-й = "Новое"
- **Контент**: заполнены `what_to_expect`, `included`, `not_included`
- **Параметры**: размер группы, возраст, языки
- **SEO**: title, description, long_description

---

## ⚠️ Важно

### Перед миграцией
- Сделайте backup БД (если production)
- Убедитесь, что все зависимости установлены
- Проверьте `DATABASE_URL` в `.env`

### После миграции
- Запустите `seed_data.py` для заполнения
- Проверьте, что туры отображаются с новыми полями
- Откройте `/tours/categories` — должен вернуть JSON с категориями

### Откат (если нужно)
```bash
alembic downgrade -1
```

---

## 🧪 Проверка

### 1. Проверить миграцию
```bash
alembic current
# Должно показать: 2025_10_08_1800_006 (head)
```

### 2. Проверить таблицы
```sql
-- В PostgreSQL
\dt  -- список таблиц
-- Должны быть: destinations, landmarks, reviews, articles
```

### 3. Проверить данные
```sql
SELECT COUNT(*) FROM destinations;  -- должно быть 5
SELECT COUNT(*) FROM landmarks;     -- должно быть 4
SELECT COUNT(*) FROM reviews;       -- должно быть ~30
SELECT COUNT(*) FROM articles;      -- должно быть 3
```

### 4. Проверить API
```bash
curl http://localhost:8000/api/v1/tours/categories
# Должен вернуть JSON с quick_filters, themes, formats
```

---

## 🐛 Решение проблем

### "Миграция не применяется"
```bash
# Проверьте историю
alembic history

# Если 006 не видна, проверьте файл миграции
ls backend/alembic/versions/

# Применить вручную
alembic upgrade 2025_10_08_1800_006
```

### "Ошибка в seed_data.py"
```bash
# Убедитесь, что миграция применена
alembic current

# Если миграция не применена, туры не будут иметь новых полей
# Сначала alembic upgrade head, потом seed_data.py
```

### "Дубликаты данных"
```bash
# Если запускали seed_data.py несколько раз
# Можно очистить и заново:
python reset_db.py
alembic upgrade head
python seed_data.py
```

---

## 📝 Проверочный чек-лист

После миграции проверьте:

- [ ] `alembic current` показывает `006` (head)
- [ ] Таблицы созданы (destinations, landmarks, reviews, articles)
- [ ] `seed_data.py` выполнился без ошибок
- [ ] В destinations 5 записей
- [ ] В reviews ~30 записей
- [ ] В articles 3 записи
- [ ] Туры обновлены (имеют themes, formats, has_discount)
- [ ] API `/tours/categories` возвращает данные
- [ ] Frontend запускается без ошибок
- [ ] Категории отображаются на `/tours`

---

## ✅ Готово!

После успешной миграции ваш сервис работает с новой структурой данных.

Frontend автоматически начнёт использовать новые поля и endpoints.

