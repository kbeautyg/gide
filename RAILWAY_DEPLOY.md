# 🚂 Деплой на Railway - ThaiGuide Pro 3.0

## 🎯 Два способа деплоя

### Способ 1: Деплой Backend из корня репозитория (РЕКОМЕНДУЕТСЯ)

1. **Создайте новый проект на Railway**
   - Зайдите на https://railway.app
   - Нажмите "New Project" → "Deploy from GitHub repo"
   - Выберите репозиторий `thaiguide-pro`

2. **Railway автоматически обнаружит конфигурацию**
   - Используется файл `railway.toml` в корне
   - Backend запустится автоматически

3. **Установите переменные окружения**
   ```
   DATABASE_URL=postgresql://supabase_admin:kkgw0gaylup95bsdlkjtlh90j1rj7kuaatzy22jgyv5tgogghvo9cmf7zpmwrxkx@yamabiko.proxy.rlwy.net:36914/postgres
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDYxMzMyMDAsImV4cCI6MTkwMzg5OTYwMH0.LRUaNwqp5qFamFjI81ibwPZn75UtMK-odWFkRMAYyt0
   SECRET_KEY_BASE=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2
   MASTER_KEY=AILA8ha8shddd73hOHDH7H3IDHI7DH37HDI@#@#@#@DUSHDUSAHDKSA
   SUPER_ADMIN_PHONE=+79177445182
   GUIDE_PHONE=+79932890755
   RAPIRA_API_URL=https://api.rapira.net/open/market/rates
   TELEGRAM_BOT_TOKEN=8409730364:AAF1NGhtiQaKkh_5QLi9DjFhgBUnVOosvUA
   APP_BACKEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
   PORT=8081
   ```

4. **Получите публичный URL**
   - Railway автоматически создаст домен
   - Например: `https://thaiguide-pro-production.up.railway.app`

---

### Способ 2: Деплой из папки backend (альтернативный)

1. **Создайте проект на Railway**

2. **В настройках проекта установите Root Directory**
   - Settings → Root Directory → `backend`

3. **Railway использует файл `backend/railway.toml`**

4. **Установите те же переменные окружения**

---

## 🌐 Деплой Frontend (Vercel/Netlify)

### Vercel (рекомендуется для React)

1. **Зайдите на https://vercel.com**

2. **Import проект из GitHub**

3. **Настройки сборки:**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Переменные окружения:**
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api/v1
   ```

5. **Deploy!**

---

## 📋 Чеклист перед деплоем

### Backend:
- ✅ `requirements.txt` содержит все зависимости
- ✅ `railway.toml` в корне или `backend/railway.toml`
- ✅ `backend/Procfile` для Heroku-совместимости
- ✅ Переменные окружения установлены
- ✅ `DATABASE_URL` указывает на Railway PostgreSQL
- ✅ Порт берется из `$PORT` (Railway устанавливает автоматически)

### Frontend:
- ✅ `package.json` содержит все зависимости
- ✅ `vite.config.ts` настроен правильно
- ✅ `VITE_API_URL` указывает на deployed backend
- ✅ Build проходит локально: `npm run build`

---

## 🔧 Решение проблем

### Проблема: "Script start.sh not found"

**Решение**: Используйте файлы конфигурации:
- ✅ Создан `railway.toml` в корне
- ✅ Создан `nixpacks.toml` в корне
- ✅ Создан `backend/Procfile`

### Проблема: "Cannot find module 'app.main'"

**Решение**: Убедитесь что:
- Railway работает из правильной директории
- В `startCommand` указан `cd backend &&` если деплоите из корня

### Проблема: "Port already in use"

**Решение**: Railway автоматически устанавливает переменную `$PORT`:
```python
# В backend/app/main.py уже используется правильно
if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8081))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
```

### Проблема: Database connection failed

**Решение**: Проверьте `DATABASE_URL` в переменных окружения Railway

---

## 🚀 Быстрый старт (3 минуты)

1. **Push код на GitHub**
   ```bash
   git add .
   git commit -m "Add Railway configuration"
   git push origin main
   ```

2. **Деплой Backend на Railway**
   - Зайти на railway.app
   - New Project → Deploy from GitHub
   - Выбрать репозиторий
   - Добавить переменные окружения
   - Deploy!

3. **Деплой Frontend на Vercel**
   - Зайти на vercel.com
   - New Project → Import from GitHub
   - Root Directory: `frontend`
   - Добавить `VITE_API_URL`
   - Deploy!

4. **Готово!** 🎉
   - Backend: `https://your-app.up.railway.app`
   - Frontend: `https://your-app.vercel.app`

---

## 📊 Архитектура деплоя

```
┌─────────────────────────────────────────┐
│         GitHub Repository               │
│         (thaiguide-pro)                 │
└────────────┬───────────────┬────────────┘
             │               │
             │               │
    ┌────────▼──────┐   ┌───▼──────────┐
    │   Railway     │   │   Vercel     │
    │   (Backend)   │   │  (Frontend)  │
    │               │   │              │
    │  FastAPI +    │◄──┤  React +     │
    │  PostgreSQL   │   │  Vite        │
    └───────────────┘   └──────────────┘
```

---

## 🎯 После деплоя

1. **Проверьте health endpoint**
   ```bash
   curl https://your-backend.up.railway.app/health
   ```

2. **Проверьте API docs**
   ```
   https://your-backend.up.railway.app/api/docs
   ```

3. **Обновите CORS в backend**
   ```python
   # backend/app/core/config.py
   CORS_ORIGINS = [
       "https://your-frontend.vercel.app",
       "http://localhost:5173",
   ]
   ```

4. **Commit и push изменения**
   - Railway автоматически пересобирается

---

## 💡 Советы по оптимизации

1. **Включите Health Checks в Railway**
   - Endpoint: `/health`
   - Интервал: 60 секунд

2. **Настройте автоматические деплои**
   - Railway деплоит автоматически при push в main

3. **Используйте Railway CLI для логов**
   ```bash
   npm install -g @railway/cli
   railway login
   railway logs
   ```

4. **Мониторинг производительности**
   - Railway предоставляет метрики CPU/RAM
   - Настройте алерты

---

**ThaiGuide Pro 3.0** готов к деплою! 🚂🚀
