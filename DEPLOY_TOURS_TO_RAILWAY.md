# 🚀 Инструкция: Загрузка 500 туров на Railway

## Проблема
Локально 500 туров, но на production (Railway) база еще не обновлена.

## Решение: 2 варианта

### Вариант 1: Запуск скриптов на Railway (РЕКОМЕНДУЕТСЯ)

1. **Зайти в Railway Dashboard**
   - Открыть ваш backend проект
   - Перейти в раздел "Deployments"

2. **Открыть терминал Railway CLI** или использовать Railway Shell:
   ```bash
   # В Railway Dashboard нажать на три точки → "Open Shell"
   ```

3. **Запустить скрипты по порядку:**
   ```bash
   # 1. Очистить старые туры
   python backend/clear_all_tours_and_reviews.py
   
   # 2. Создать системного гида (если нужно)
   python backend/seed_data.py
   
   # 3. Создать 80 базовых туров
   python backend/scripts/create_all_asia_tours.py
   
   # 4. Расширить до 500
   python backend/scripts/expand_tours_to_500.py
   
   # 5. Добавить фото
   python backend/scripts/add_photos_to_tours.py
   ```

### Вариант 2: Через Railway CLI (локально)

Если у вас установлен Railway CLI:

```bash
# Подключиться к проекту
railway link

# Запустить команды удаленно
railway run python backend/clear_all_tours_and_reviews.py
railway run python backend/seed_data.py
railway run python backend/scripts/create_all_asia_tours.py
railway run python backend/scripts/expand_tours_to_500.py
railway run python backend/scripts/add_photos_to_tours.py
```

### Вариант 3: Добавить команду в Procfile (АВТОМАТИЧЕСКИ)

Можно добавить команду которая запустится один раз при деплое:

**Файл**: `backend/Procfile` или создать `backend/release.sh`

```bash
#!/bin/bash
# Запускается один раз при деплое

# Проверяем есть ли туры
TOURS_COUNT=$(python -c "import asyncio; from app.models.tour import Tour; from app.db.session import get_db; print('check')")

# Если туров нет - создаем
python backend/scripts/create_all_asia_tours.py
python backend/scripts/expand_tours_to_500.py  
python backend/scripts/add_photos_to_tours.py
```

Затем в `Procfile` добавить:
```
release: bash backend/release.sh
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## ⚠️ ВАЖНО

**НЕ запускайте `clear_all_tours_and_reviews.py` на production если там уже есть настоящие бронирования пользователей!**

Этот скрипт удаляет ВСЕ экскурсии, отзывы и бронирования.

## ✅ После выполнения

Проверьте что туры появились:
1. Откройте ваш сайт
2. Перейдите на `/tours`
3. Должно показать "500 предложений" (или около того)
4. Карточки должны иметь 5-8 фотографий

## 🔄 Альтернатива: Экспорт/Импорт данных

Если скрипты не запускаются на Railway, можно:

1. **Экспортировать локальную БД:**
   ```bash
   pg_dump your_local_db > tours_data.sql
   ```

2. **Импортировать на Railway:**
   ```bash
   psql $DATABASE_URL < tours_data.sql
   ```

Но это сложнее и требует доступа к Railway PostgreSQL напрямую.

---

**Рекомендация**: Используйте Вариант 1 (Railway Shell) — это самый простой способ!

