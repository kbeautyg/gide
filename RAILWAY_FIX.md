# 🚨 КРИТИЧНО: Исправление ошибки "Is a directory"

## ⚡ ПРОСТОЕ РЕШЕНИЕ (2 минуты)

### Шаг 1: В Railway Settings установите Root Directory

1. Зайдите в **Settings** вашего проекта на Railway
2. Найдите **Root Directory**
3. Установите значение: `backend`
4. **Save**

### Шаг 2: Удалите Build Command (если есть)

1. В Settings → Build
2. **Очистите Build Command** (оставьте пустым)
3. Railway автоматически использует `requirements.txt`

### Шаг 3: Установите Start Command

В Settings → Deploy → Start Command:
```bash
python3 -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Шаг 4: Redeploy

Railway автоматически пересоберет проект с правильными настройками.

---

## 🔍 Почему возникла ошибка "Is a directory"?

Nixpacks пытался записать временные файлы в папку с именем `app`, но у нас уже есть директория `backend/app/` с кодом приложения. Это вызвало конфликт.

**Решение**: Установив Root Directory = `backend`, Railway начнет работу из правильной папки, и конфликта не будет.

---

## ✅ После этих изменений:

Railway будет:
1. ✅ Работать из папки `backend/`
2. ✅ Автоматически находить `requirements.txt`
3. ✅ Устанавливать Python 3.11 и все зависимости
4. ✅ Запускать FastAPI через uvicorn
5. ✅ Никаких конфликтов с папкой `app/`

---

## 📋 Полная конфигурация в Railway UI:

### Settings → Service Settings:
- **Service Name**: `thaiguide-backend` (любое имя)
- **Root Directory**: `backend` ⚠️ КРИТИЧНО!

### Settings → Deploy:
- **Start Command**: 
  ```
  python3 -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```
- **Build Command**: (оставьте пустым)

### Settings → Variables (Environment Variables):
```bash
DATABASE_URL=postgresql://supabase_admin:kkgw0gaylup95bsdlkjtlh90j1rj7kuaatzy22jgyv5tgogghvo9cmf7zpmwrxkx@yamabiko.proxy.rlwy.net:36914/postgres
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDYxMzMyMDAsImV4cCI6MTkwMzg5OTYwMH0.LRUaNwqp5qFamFjI81ibwPZn75UtMK-odWFkRMAYyt0
SECRET_KEY_BASE=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2
MASTER_KEY=AILA8ha8shddd73hOHDH7H3IDHI7DH37HDI@#@#@#@DUSHDUSAHDKSA
SUPER_ADMIN_PHONE=+79177445182
GUIDE_PHONE=+79932890755
RAPIRA_API_URL=https://api.rapira.net/open/market/rates
TELEGRAM_BOT_TOKEN=8409730364:AAF1NGhtiQaKkh_5QLi9DjFhgBUnVOosvUA
```

---

## 🎯 Проверка после деплоя:

После успешного деплоя проверьте эти endpoints:

1. **Health Check**:
   ```
   https://your-app.up.railway.app/health
   ```
   Должен вернуть: `{"status":"healthy","timestamp":"...","timezone":"Europe/Moscow"}`

2. **API Docs**:
   ```
   https://your-app.up.railway.app/api/docs
   ```
   Должна открыться Swagger документация

3. **Tours API**:
   ```
   https://your-app.up.railway.app/api/v1/tours/
   ```
   Должен вернуть список экскурсий (моковые данные)

---

## 💡 Альтернативное решение (если не хотите менять Root Directory):

Если по какой-то причине не можете изменить Root Directory, используйте этот `nixpacks.toml`:

```toml
[phases.setup]
nixPkgs = ["python311"]

[phases.install]
cmds = [
    "pip3 install -r backend/requirements.txt"
]

[start]
cmd = "cd backend && python3 -m uvicorn app.main:app --host 0.0.0.0 --port $PORT"
```

Но **рекомендуется первый способ** - он проще и надежнее.

---

**Готово!** После установки Root Directory = `backend` всё должно заработать! 🎉
