# 🚀 Деплой Frontend на Railway

## 📋 Инструкция (5 минут)

### Шаг 1: Создайте новый сервис для Frontend

1. Зайдите на https://railway.app/dashboard
2. Откройте ваш проект (где уже есть backend)
3. Нажмите **"+ New"** → **"GitHub Repo"**
4. Выберите тот же репозиторий `gide`
5. Railway создаст еще один сервис

### Шаг 2: Настройте Frontend сервис

В настройках нового сервиса:

#### **Settings → Service Settings:**
- **Service Name**: `thaiguide-frontend` (или любое имя)
- **Root Directory**: `frontend` ⚠️ КРИТИЧНО!

#### **Settings → Deploy:**
- **Start Command**: `npx serve dist -s -l $PORT`
- **Build Command**: (оставьте пустым, Railway сам определит)

#### **Settings → Variables:**
Добавьте переменную окружения:
```
VITE_API_URL=https://gide-production.up.railway.app/api/v1
```

### Шаг 3: Deploy!

Railway автоматически соберет и задеплоит frontend.

После успешного деплоя получите ссылку типа:
```
https://thaiguide-frontend-production.up.railway.app
```

---

## ✅ Обновите CORS на Backend

Теперь нужно разрешить frontend обращаться к backend API.

### В Railway Dashboard:

1. Откройте **backend сервис**
2. Перейдите в **Variables**
3. Найдите или добавьте переменную `CORS_ORIGINS`
4. Если её нет, код уже настроен в `backend/app/core/config.py`

### Или обновите в коде:

Откройте `backend/app/core/config.py` и измените:

```python
CORS_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://thaiguide-frontend-production.up.railway.app",  # ← Ваш frontend URL
    "https://gide-production.up.railway.app",
]
```

Затем commit и push:
```bash
git add backend/app/core/config.py
git commit -m "Add frontend Railway URL to CORS"
git push origin main
```

---

## 🎯 Что получится:

```
┌────────────────────────────────────────┐
│  Railway Project: thaiguide-pro        │
├────────────────────────────────────────┤
│                                        │
│  📦 Service 1: Backend (FastAPI)       │
│  https://gide-production.up...         │
│  Root Directory: backend               │
│                                        │
│  📦 Service 2: Frontend (React)        │
│  https://thaiguide-frontend-prod...    │
│  Root Directory: frontend              │
│                                        │
└────────────────────────────────────────┘
```

**Всё в одном месте на Railway!** ✨

---

## 🔧 Troubleshooting

### Проблема: "Cannot find module 'serve'"

**Решение**: Добавил `serve` в `package.json`, уже исправлено

### Проблема: 404 на всех страницах кроме главной

**Решение**: Флаг `-s` в команде `serve` включает SPA режим, уже настроено

### Проблема: "CORS error" в консоли браузера

**Решение**: Добавьте URL frontend в CORS на backend (см. выше)

---

## 💰 Стоимость

Railway бесплатно дает:
- **$5 кредитов в месяц**
- Хватит на небольшой трафик
- Для продакшена можно докупить

**Два сервиса (backend + frontend) = всё на одной платформе!**

---

## 🎉 После деплоя

Откройте ваш frontend URL в браузере:
```
https://thaiguide-frontend-production.up.railway.app
```

Должна открыться **главная страница** с экскурсиями!

Отправьте эту ссылку клиенту - всё работает в интернете! 🚀
