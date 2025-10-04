# 🚀 Деплой Frontend на Vercel

## 📋 Быстрый старт (5 минут)

### Шаг 1: Зарегистрируйтесь на Vercel

1. Зайдите на https://vercel.com
2. Нажмите **"Sign Up"**
3. Выберите **"Continue with GitHub"**
4. Авторизуйтесь через GitHub

---

### Шаг 2: Импортируйте проект

1. На главной странице Vercel нажмите **"Add New..."** → **"Project"**
2. Выберите **"Import Git Repository"**
3. Найдите ваш репозиторий `gide` (или `thaiguide-pro`)
4. Нажмите **"Import"**

---

### Шаг 3: Настройте проект

На странице настройки проекта:

#### **Framework Preset:**
- Выберите: **Vite**

#### **Root Directory:**
- Нажмите **"Edit"**
- Выберите: `frontend`

#### **Build and Output Settings:**
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### **Environment Variables:**
Нажмите **"Add"** и добавьте:
```
Name: VITE_API_URL
Value: https://gide-production.up.railway.app/api/v1
```

---

### Шаг 4: Deploy!

1. Нажмите **"Deploy"**
2. Подождите 2-3 минуты
3. После успешной сборки получите ссылку типа:
   ```
   https://gide-your-username.vercel.app
   ```

---

## ✅ После деплоя

### 1. Проверьте что работает:

Откройте ваш Vercel URL в браузере. Должна открыться **главная страница** с экскурсиями!

### 2. Обновите CORS на backend:

Теперь нужно разрешить frontend обращаться к backend.

**Откройте файл**: `backend/app/core/config.py`

**Найдите**:
```python
CORS_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
]
```

**Замените на** (добавьте свой Vercel URL):
```python
CORS_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://gide-your-username.vercel.app",  # ← Ваш Vercel URL
    "https://gide-production.up.railway.app",
]
```

**Commit и push**:
```bash
git add backend/app/core/config.py
git commit -m "Add Vercel URL to CORS origins"
git push origin main
```

Railway автоматически пересоберется с новыми настройками!

---

## 🎯 Custom Domain (опционально)

Хотите свой домен вместо `.vercel.app`?

1. В Vercel зайдите в **Settings** → **Domains**
2. Добавьте свой домен (например `thaiguide.pro`)
3. Следуйте инструкциям Vercel для настройки DNS

---

## 🔧 Troubleshooting

### Проблема: "Failed to fetch" в консоли браузера

**Причина**: CORS не настроен на backend

**Решение**: Добавьте Vercel URL в `CORS_ORIGINS` (см. выше)

### Проблема: Страница 404 при переходе на `/tours`

**Причина**: Нужна настройка rewrites

**Решение**: Файл `vercel.json` уже создан, просто сделайте redeploy

### Проблема: Сборка падает с ошибкой

**Причина**: Возможно не хватает пакетов

**Решение**: 
1. Локально проверьте сборку: `cd frontend && npm run build`
2. Исправьте ошибки
3. Commit и push
4. Vercel автоматически пересоберет

---

## 📊 Что получится:

```
┌──────────────────────────────────────┐
│  Frontend (Vercel)                   │
│  https://gide-xxx.vercel.app         │
│                                      │
│  ✅ Главная страница                 │
│  ✅ Каталог экскурсий                │
│  ✅ Детали экскурсии                 │
│  ✅ Форма бронирования               │
└──────────────────────────────────────┘
              ↓ API запросы
┌──────────────────────────────────────┐
│  Backend (Railway)                   │
│  https://gide-production.up...       │
│                                      │
│  ✅ FastAPI                          │
│  ✅ Supabase DB                      │
│  ✅ JWT Auth                         │
└──────────────────────────────────────┘
```

---

## 🎉 После успешного деплоя

Отправьте клиенту ссылку на ваш Vercel сайт!

Он увидит:
- 🏝️ Красивую главную страницу
- 🎭 Каталог экскурсий
- 📋 Детальные страницы туров
- 📝 Формы бронирования

**Всё работает в интернете!** ✨

---

## 💡 Полезные ссылки:

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Документация Vercel**: https://vercel.com/docs
- **Railway Dashboard**: https://railway.app/dashboard

---

**ThaiGuide Pro 3.0 готов к показу!** 🚀
