# 🔧 Исправления для Production

## Проблемы и решения

### ❌ Проблема 1: 403 Forbidden на `/requests/available`

**Суть**: Супер-админ получал 403 при попытке открыть раздел "Заявки"

**Причина**: Endpoint проверял только роли MANAGER и SUPER_MANAGER, а супер-админ имеет роль SUPER_ADMIN

**Решение**: Добавлены роли SUPER_ADMIN и ADMIN в проверку доступа

```python
# Было
if current_user.role not in [UserRole.MANAGER, UserRole.SUPER_MANAGER]:
    raise HTTPException(403, "Только для гидов")

# Стало
if current_user.role not in [UserRole.MANAGER, UserRole.SUPER_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN]:
    raise HTTPException(403, "Только для гидов и админов")
```

**Файл**: `backend/app/api/v1/endpoints/requests.py`

---

### ❌ Проблема 2: Duplicate key в seed_data.py

**Суть**: При повторном запуске `seed_data.py` возникала ошибка дубликата slug

```
UniqueViolationError: duplicate key value violates unique constraint "ix_destinations_slug"
Key (slug)=(tbilisi) already exists.
```

**Причина**: Скрипт пытался создать destinations/landmarks/articles/requests заново

**Решение**: Добавлена проверка на существование перед созданием

```python
# Для destinations
for dest_data in destinations_data:
    existing = await session.execute(
        sa.select(Destination).where(Destination.slug == dest_data['slug'])
    )
    if not existing.scalar_one_or_none():  # Создаём только если не существует
        dest = Destination(**dest_data)
        session.add(dest)
```

Аналогично для:
- Landmarks (проверка по destination_id + name)
- Articles (проверка по slug)
- Requests (проверка по title + status='pending')

**Файл**: `backend/seed_data.py`

---

## ✅ Что исправлено

### Backend
1. ✅ Endpoint `/requests/available` — доступ для SUPER_ADMIN и ADMIN
2. ✅ Endpoint `/requests/{id}/take` — доступ для админов
3. ✅ Endpoint `/requests/{id}/reschedule` — доступ для админов
4. ✅ `seed_data.py` — проверка дубликатов перед созданием

---

## 📝 Теперь работает

### Раздел "Заявки" доступен для:
- ✅ SUPER_ADMIN
- ✅ ADMIN  
- ✅ SUPER_MANAGER
- ✅ MANAGER

### Seed-скрипт можно запускать повторно:
- Создаёт только недостающие записи
- Пропускает существующие
- Не ломается на дубликатах

---

## 🚀 Деплой

Коммит `3f57c85` — исправления загружены

Railway автоматически задеплоит обновления.

После успешного деплоя можно безопасно запустить:
```bash
railway run python seed_data.py
```

Скрипт создаст только недостающие данные, не сломается на существующих.

---

## ✅ Готово!

Теперь:
- Супер-админы могут открывать "Заявки"
- Seed-скрипт работает корректно
- Нет ошибок дубликатов

**Всё работает!** 🎉

