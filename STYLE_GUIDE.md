# 🎨 Руководство по стилю — Airbnb Design System

## Цвета

### Основная палитра
```css
Основной (CTA, кнопки):
#FF385C  — airbnb-rausch (розовый)

Акценты:
#00A699  — airbnb-babu (бирюзовый)
#FC642D  — airbnb-arches (оранжевый для промо)

Текст:
#222222  — airbnb-hof (тёмно-серый)
#484848  — текст основной
#717171  — airbnb-foggy (вторичный текст)
#FFFFFF  — белый фон

Серые:
#F7F7F7  — фон секций
#ECECEC  — hover состояния
#DDDDDD  — borders
```

### Использование
```tsx
// Кнопки
<Button className="bg-airbnb-rausch">Забронировать</Button>

// Ссылки
<a className="text-airbnb-rausch hover:text-airbnb-rausch/80">

// Акценты
<div className="border-l-4 border-airbnb-babu">
```

---

## Типографика

### Заголовки
```css
H1: text-5xl md:text-6xl font-bold (48-60px)
    letter-spacing: -0.02em
    color: #222222

H2: text-3xl md:text-4xl font-bold (32-48px)
    color: #222222

H3: text-xl md:text-2xl font-semibold (20-24px)
    color: #222222
```

### Текст
```css
Основной: text-base (16px), line-height: 1.6
Вторичный: text-sm (14px), color: #717171
Мелкий: text-xs (12px)
```

### Применение
```tsx
<h1 className="text-5xl md:text-6xl font-bold text-gray-900">
  Откройте незабываемые экскурсии
</h1>

<p className="text-base text-gray-700 leading-relaxed">
  Описание экскурсии...
</p>

<span className="text-sm text-gray-600">
  Вторичная информация
</span>
```

---

## Тени

### Уровни
```css
Лёгкая (карточки в покое):
shadow-airbnb-sm
→ box-shadow: 0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)

Средняя (по умолчанию):
shadow-airbnb
→ box-shadow: 0 2px 16px rgba(0,0,0,0.12)

При hover:
shadow-airbnb-hover
→ box-shadow: 0 6px 20px rgba(0,0,0,0.15)

Модальные окна:
shadow-airbnb-lg
→ box-shadow: 0 8px 28px rgba(0,0,0,0.18)
```

### Применение
```tsx
<Card className="shadow-airbnb-sm hover:shadow-airbnb">
```

---

## Скругления

```css
Кнопки: rounded-lg (8px)
Карточки: rounded-xl (12px)
Большие блоки: rounded-2xl (16px)
Чипсы/pills: rounded-full (999px)
```

### Применение
```tsx
<Button className="rounded-lg">Кнопка</Button>
<Card className="rounded-xl">Карточка</Card>
<div className="rounded-full px-4 py-2">Чип</div>
```

---

## Отступы

### Между секциями
```css
Desktop: py-20 (80px)
Mobile: py-12 (48px)
```

### Внутри блоков
```css
Карточки: p-6 (24px)
Модалки: p-6
Текст: space-y-4 (16px между параграфами)
```

### Применение
```tsx
<section className="py-20">
  <div className="container mx-auto px-4">
    <div className="space-y-6">
```

---

## Компоненты

### TourCard (карточка экскурсии)
```tsx
<TourCard tour={tour} />
```
**Включает:**
- Галерею изображений (навигация точками)
- Heart-иконку избранного
- Бейдж (Популярно/Новое/Скидка)
- Hover-эффект (подъём на 4px)

### Badge (бейдж)
```tsx
<Badge variant="popular">Популярно</Badge>
<Badge variant="new">Новое</Badge>
<Badge variant="discount">Скидка 20%</Badge>
<Badge variant="guestFavorite">Выбор гостей</Badge>
```

### SearchBar (поиск)
```tsx
<SearchBar variant="hero" />      // большой для героя
<SearchBar variant="sticky" />    // компактный для sticky
```

### CategoryChips (категории)
```tsx
<CategoryChips
  categories={[
    { name: 'Винные', count: 37 },
    { name: 'Казбеги', count: 46 }
  ]}
  selected={['Винные']}
  onSelect={(cat) => handleSelect(cat)}
  maxVisible={12}
/>
```

### FilterPanel (фильтры)
```tsx
const [showFilters, setShowFilters] = useState(false)

<Button onClick={() => setShowFilters(true)}>
  Фильтры
</Button>

<FilterPanel
  isOpen={showFilters}
  onClose={() => setShowFilters(false)}
  onApply={(filters) => handleFilters(filters)}
/>
```

---

## Анимации (Framer Motion)

### Fade-in при появлении
```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  <Content />
</motion.div>
```

### Stagger для сетки
```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }}
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      <Card />
    </motion.div>
  ))}
</motion.div>
```

### Hover
```tsx
<motion.div
  whileHover={{ y: -4, scale: 1.02 }}
  transition={{ duration: 0.2 }}
>
```

### Утилиты (из lib/animations.ts)
```tsx
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'

<motion.div {...fadeInUp}>
<motion.div variants={staggerContainer} initial="hidden" animate="visible">
  <motion.div variants={staggerItem}>
```

---

## Skeleton Loaders

### Использование
```tsx
import { TourCardSkeleton, ReviewSkeleton } from '@/components/SkeletonLoader'

{isLoading ? (
  <TourCardSkeleton count={6} />
) : (
  tours.map(tour => <TourCard tour={tour} />)
)}
```

### Кастомный скелетон
```tsx
<div className="skeleton w-full h-48 rounded-xl" />
```

---

## Адаптивность

### Breakpoints
```css
xs:  475px   (очень маленькие телефоны)
sm:  640px   (телефоны)
md:  768px   (планшеты) ← основной переход desktop/mobile
lg:  1024px  (ноутбуки)
xl:  1280px  (большие экраны)
2xl: 1536px  (очень большие)
```

### Сетки
```tsx
// 4 колонки → 2 → 1
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// 3 колонки → 2 → 1
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Скрыть на мобильных
```tsx
<div className="hidden md:block">Только desktop</div>
<div className="md:hidden">Только mobile</div>
```

---

## Паттерны UX

### Sticky элементы
```tsx
// Поиск
<div className="sticky top-0 z-30">

// Sidebar бронирования
<div className="sticky top-24">
```

### Hover-эффекты карточек
```css
.card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}
```

### Градиенты
```tsx
// Hero
<div className="hero-gradient">
  // linear-gradient(135deg, #FF385C 0%, #FC642D 100%)
</div>

// Текст
<h1 className="text-gradient">
  // gradient от розового к бирюзовому
</h1>
```

---

## Иконки (Lucide React)

### Основные
```tsx
import { 
  MapPin,      // локация
  Clock,       // время
  Star,        // рейтинг
  Heart,       // избранное
  Users,       // гости/гиды
  Calendar,    // даты
  Search,      // поиск
  Filter,      // фильтры
  ChevronLeft, // стрелки
  ChevronRight,
  CheckCircle, // включено
  XCircle,     // не включено
  Shield,      // гарантии
} from 'lucide-react'
```

### Размеры
```tsx
<MapPin size={16} />  // small (в тексте)
<MapPin size={20} />  // default
<MapPin size={24} />  // large (заголовки)
<MapPin size={36} />  // очень большие (фичи)
```

---

## Примеры использования

### Карточка с бейджем и избранным
```tsx
<div className="relative">
  <img src={photo} className="w-full aspect-[4/3] object-cover rounded-xl" />
  
  {/* Бейдж */}
  <div className="absolute top-3 left-3">
    <Badge variant="popular">Популярно</Badge>
  </div>
  
  {/* Heart */}
  <button className="absolute top-3 right-3">
    <Heart className={isFavorite ? "fill-airbnb-rausch" : "fill-white/80"} />
  </button>
</div>
```

### Цена со скидкой
```tsx
<div className="flex items-baseline gap-2">
  {hasDiscount && (
    <span className="text-gray-400 line-through">
      {formatRUB(originalPrice)}
    </span>
  )}
  <span className="text-lg font-bold">
    {formatRUB(price)}
  </span>
  <span className="text-sm text-gray-600">за человека</span>
</div>
```

### Рейтинг со звёздами
```tsx
<div className="flex items-center gap-1">
  <Star size={16} className="fill-gray-900 text-gray-900" />
  <span className="font-semibold">{rating.toFixed(2)}</span>
  <span className="text-gray-600 text-sm">({reviewsCount})</span>
</div>
```

### Список с чекмарками
```tsx
<ul className="space-y-2">
  {items.map(item => (
    <li className="flex items-start gap-2">
      <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
      <span className="text-gray-700">{item}</span>
    </li>
  ))}
</ul>
```

---

## Лучшие практики

### DO ✅
- Используй мягкие тени (`shadow-airbnb-sm/hover/lg`)
- Добавляй hover-эффекты на интерактивные элементы
- Используй skeleton loaders при загрузке
- Добавляй анимации появления (Framer Motion)
- Оставляй много воздуха между блоками (py-20)
- Используй округлые углы (rounded-xl)
- Показывай бейджи на карточках (Популярно/Новое)

### DON'T ❌
- Не используй яркие тропические цвета (старый стиль)
- Не делай резкие переходы (добавляй transition)
- Не забывай про mobile-адаптацию
- Не перегружай карточки информацией
- Не используй жёсткие тени
- Не забывай про состояния (hover, active, disabled)

---

## Чек-лист для новой страницы

- [ ] PublicHeader + PublicFooter обёрнуты
- [ ] Breadcrumbs вверху (если не главная)
- [ ] Заголовок H1 с правильным размером
- [ ] Секции с py-20 (desktop) и py-12 (mobile)
- [ ] Анимации Framer Motion (fadeIn, stagger)
- [ ] Skeleton loaders при isLoading
- [ ] Адаптивная сетка (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- [ ] Hover-эффекты на карточках
- [ ] Мягкие тени (shadow-airbnb-*)
- [ ] Правильные цвета (airbnb-rausch/babu)

---

## Быстрая справка

### Создать новую карточку
```tsx
<TourCard tour={{
  id: 1,
  title: "Название",
  location: "Город",
  duration: 8,
  price: 3000,
  original_price: 4000,  // если скидка
  discount_percentage: 20,
  photos: ['url1', 'url2'],
  rating: 4.95,
  reviews_count: 164,
  has_discount: true,
  is_new: false,
  tags: ['Выбор гостей']
}} />
```

### Добавить секцию с анимацией
```tsx
<section className="py-20 bg-gray-50">
  <div className="container mx-auto px-4">
    <motion.h2
      className="text-3xl font-bold text-gray-900 mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      Заголовок
    </motion.h2>
    
    <motion.div
      className="grid md:grid-cols-3 gap-6"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {items.map(item => (
        <motion.div key={item.id} variants={staggerItem}>
          <Card />
        </motion.div>
      ))}
    </motion.div>
  </div>
</section>
```

---

## Готовые классы

### Утилиты
```css
.transition-smooth    → плавные переходы (0.3s cubic-bezier)
.card-hover           → hover для карточек (подъём + тень)
.skeleton             → shimmer-анимация загрузки
.scrollbar-hide       → скрыть скроллбар
.text-gradient        → градиентный текст
.hero-gradient        → градиент для героя
```

### Применение
```tsx
<div className="card-hover">
<div className="scrollbar-hide overflow-x-auto">
<div className="skeleton w-full h-48">
<h1 className="text-gradient">
```

---

Следуйте этому гайду для создания новых компонентов в едином стиле! 🎨

