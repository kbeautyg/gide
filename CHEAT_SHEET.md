# ⚡ Шпаргалка — Новый дизайн

## Запуск за 3 команды

```bash
# 1. База данных
cd backend
alembic upgrade head

# 2. Данные
python seed_data.py

# 3. Запуск
cd ../frontend
npm run dev
```

→ Открыть: **http://localhost:5173/**

---

## Основные цвета

```css
#FF385C  — розовый (кнопки, ссылки)
#00A699  — бирюзовый (акценты)
#222222  — тёмный (текст)
#717171  — серый (вторичный текст)
#F7F7F7  — светлый (фон секций)
```

---

## Компоненты

```tsx
// Карточка тура
<TourCard tour={tour} />

// Поиск
<SearchBar variant="hero" />    // большой
<SearchBar variant="sticky" />  // маленький

// Бейджи
<Badge variant="popular">Популярно</Badge>
<Badge variant="new">Новое</Badge>
<Badge variant="discount">Скидка 20%</Badge>

// Категории
<CategoryChips categories={cats} selected={sel} onSelect={fn} />

// Фильтры
<FilterPanel isOpen={show} onClose={fn} onApply={fn} />

// Лоадеры
<TourCardSkeleton count={6} />
<div className="skeleton w-full h-48 rounded-xl" />
```

---

## Анимации

```tsx
// Появление при скролле
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
>

// Stagger (волна)
<motion.div variants={staggerContainer} initial="hidden" animate="visible">
  {items.map(i => (
    <motion.div variants={staggerItem}>

// Hover
<motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
```

---

## Сетки (адаптивные)

```tsx
// 4 → 2 → 1
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// 3 → 2 → 1
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// 2 → 1
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
```

---

## Страницы

| URL | Файл | Что там |
|-----|------|---------|
| `/` | HomePage.tsx | Hero, карусели, направления, отзывы |
| `/tours` | ToursPage.tsx | Каталог с фильтрами и чипсами |
| `/tours/:id` | TourDetailPage.tsx | Галерея 2×2, блоки, отзывы |
| `/destinations/:city` | DestinationPage.tsx | Достопримечательности, гиды |
| `/journal` | JournalPage.tsx | Статьи |
| `/journal/:slug` | ArticlePage.tsx | Контент статьи |

---

## Частые задачи

### Добавить новую тему
1. Обновить `seed_data.py` → `themes_pool`
2. Запустить `python seed_data.py`
3. Категория появится автоматически

### Добавить бейдж "Выбор гостей"
```python
tour.tags = ["Выбор гостей"]
```

### Добавить скидку
```python
tour.has_discount = True
tour.discount_percentage = 20
tour.original_price = tour.price * 1.25  # старая цена
```

### Отметить как новое
```python
tour.is_new = True
```

---

## Классы Tailwind (часто используемые)

```css
Текст:
text-gray-900      — основной
text-gray-600      — вторичный
text-airbnb-rausch — розовый

Фон:
bg-white           — белый
bg-gray-50         — светло-серый
bg-airbnb-rausch   — розовый

Тени:
shadow-airbnb-sm   — лёгкая
shadow-airbnb      — средняя
shadow-airbnb-hover — сильная

Скругления:
rounded-lg         — 8px
rounded-xl         — 12px
rounded-full       — круглые

Отступы:
py-20              — 80px (секции desktop)
py-12              — 48px (секции mobile)
p-6                — 24px (внутри карточек)
```

---

## Проверка

### Desktop
1. Открыть http://localhost:5173/
2. Проверить SearchBar (3 поля работают)
3. Кликнуть "Фильтры" (панель справа)
4. Навести на карточку (подъём + тень)
5. Кликнуть на карточку → детальная
6. Прокрутить → sidebar прилипает

### Mobile
1. F12 → Ctrl+Shift+M → iPhone
2. Кликнуть ☰ → меню слева
3. SearchBar вертикальный
4. Категории — скролл горизонтально
5. Карточки — 1 колонка

---

## Решение проблем

### "Миграция не применяется"
```bash
alembic downgrade -1
alembic upgrade head
```

### "Нет категорий"
```bash
python seed_data.py  # заново заполнить
```

### "Не видно изменений"
```
Ctrl + F5  # очистить кэш
```

---

## 📚 Читать дальше

- `STYLE_GUIDE.md` — как использовать компоненты
- `VISUAL_CHANGES.md` — визуальное сравнение
- `REDESIGN_SUMMARY.md` — технические детали

---

**Готово! 🎉**

