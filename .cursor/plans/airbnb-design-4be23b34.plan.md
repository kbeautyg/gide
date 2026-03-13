<!-- 4be23b34-7ca4-458b-bae0-733937e402ed 2c2830e4-6b37-4285-a104-87243b0b5305 -->
# Mobile Search & Booking System Redesign

## 1. Мобильная версия поиска (Airbnb-style)

**Задача:** Создать модальное окно на весь экран для мобильных устройств

**Файлы:**

- `frontend/src/components/SearchBar.tsx` - добавить мобильную версию
- Новый: `frontend/src/components/MobileSearchModal.tsx`

**Реализация:**

```tsx
// Определить мобильный режим
const isMobile = useMediaQuery('(max-width: 768px)')

// При клике на поиск в мобильной - открыть модал
<MobileSearchModal>
  <Tabs: Жильё / Впечатления / Услуги />
  <Field: Куда - input с autocomplete />
  <Field: Когда - календарь />
  <Field: Кто - счётчик гостей />
  <Button: Искать (fixed bottom) />
</MobileSearchModal>
```

## 2. Sticky Search на главной (как в /tours)

**Проблема:** На главной появляется новый SearchBar, а не трансформируется существующий

**Решение:** Убрать дублирующий sticky, использовать тот же SearchBar из hero

**Файлы:**

- `frontend/src/pages/public/HomePage.tsx`

**Изменения:**

```tsx
// Убрать отдельный sticky SearchBar (строки 128-142)
// Обернуть SearchBar в hero в motion.div с layoutId
<motion.div layoutId="search-bar" className="...">
  <SearchBar variant={showStickySearch ? 'sticky' : 'hero'} />
</motion.div>

// При скролле - переместить блок наверх через CSS position sticky
```

## 3. Система бронирования через заявки

**Архитектура:**

- Клиент бронирует тур → создаётся Booking
- Booking попадает в "Заявки" гида как Request
- Гид принимает заявку → создаёт Tour на её основе (1 заявка = 1 тур)
- Tour публикуется с уникальной ссылкой только для этого клиента

**Backend изменения:**

### 3.1. Модели

**Файлы:**

- `backend/app/models/booking.py` - добавить поле `request_id`
- `backend/app/models/request.py` - добавить `booking_id`, `generated_tour_id`
- `backend/app/models/tour.py` - добавить `is_custom`, `request_id`, `share_code`
```python
# booking.py
request_id = Column(Integer, ForeignKey("requests.id"), nullable=True)
telegram_username = Column(String, nullable=True)

# request.py
booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
generated_tour_id = Column(Integer, ForeignKey("tours.id"), nullable=True)
telegram_username = Column(String, nullable=True)

# tour.py
is_custom = Column(Boolean, default=False)  # Создан для заявки
request_id = Column(Integer, ForeignKey("requests.id"), nullable=True)
share_code = Column(String, unique=True, index=True)  # Уникальная ссылка
```


### 3.2. API Endpoints

**Файлы:**

- `backend/app/api/v1/endpoints/bookings.py` - расширить
- `backend/app/api/v1/endpoints/requests.py` - добавить методы
- Новый: `backend/app/api/v1/endpoints/custom_tours.py`

**Новые эндпоинты:**

```python
# bookings.py
POST /bookings/ - создать бронирование
  → автоматически создаёт Request для гида
  → отправить в Telegram гиду

# requests.py
GET /requests/my - заявки текущего гида
POST /requests/{id}/accept - принять заявку
  → открыть форму создания тура
  
# custom_tours.py
POST /custom-tours/from-request/{request_id}
  → создать Tour с is_custom=True
  → заполнить данными из Request
  → сгенерировать share_code
  → вернуть ссылку
```

### 3.3. Логика создания тура из заявки

**Файл:** `backend/app/services/tour_service.py`

```python
async def create_tour_from_request(request_id: int, guide_id: int):
    request = await get_request(request_id)
    
    # Авто-заполнение из заявки
    tour = Tour(
        title=request.title,
        description=request.description,
        location=request.location,
        duration=request.duration_hours,
        price=request.budget or 0,
        guide_id=guide_id,
        is_custom=True,
        request_id=request_id,
        share_code=generate_unique_code()
    )
    
    # Предупреждение: "Не рекомендуется менять данные"
    return tour
```

**Frontend изменения:**

### 3.4. Карточка тура - кнопка "Забронировать"

**Файл:** `frontend/src/components/TourCard.tsx`

```tsx
// Добавить telegram в форму бронирования
<Input 
  name="telegram"
  placeholder="@username (для связи с гидом)"
/>

// При submit
await bookingsApi.create({
  tour_id,
  date,
  participants_count,
  telegram_username,
  ...
})
```

### 3.5. Гид - раздел "Заявки"

**Файл:** `frontend/src/pages/dashboard/RequestsPage.tsx`

```tsx
<RequestsList>
  {requests.map(req => (
    <RequestCard>
      <Info: title, description, date, guests, budget, telegram />
      <Button onClick={acceptRequest}>
        Принять заявку
      </Button>
    </RequestCard>
  ))}
</RequestsList>

// При принятии
const handleAccept = async (requestId) => {
  await requestsApi.accept(requestId)
  navigate(`/dashboard/tours/create?requestId=${requestId}`)
}
```

### 3.6. Создание тура из заявки

**Файл:** `frontend/src/pages/dashboard/CreateTourFromRequest.tsx`

```tsx
// Получить данные заявки
const { data: request } = useQuery(['request', requestId])

// Форма с предзаполненными полями
<Form initialValues={request}>
  <Alert type="warning">
    Данные заполнены автоматически из заявки.
    Не рекомендуется менять цену, дату и описание.
  </Alert>
  
  <Input name="title" disabled />
  <Textarea name="description" disabled />
  <Input name="location" disabled />
  <DatePicker name="date" disabled />
  <Input name="price" disabled />
  
  <Button type="submit">Создать тур</Button>
</Form>

// При создании
const tour = await toursApi.createFromRequest(requestId)
// Скопировать share_code ссылку
const link = `${window.location.origin}/tours/${tour.share_code}`
```

### 3.7. Календарь - отображение заявок

**Файл:** `frontend/src/components/dashboard/GuideCalendar.tsx`

```tsx
// При клике на заявку в календаре
<RequestModal request={selectedRequest}>
  <Field: Название />
  <Field: Описание />
  <Field: Дата />
  <Field: Гости />
  <Field: Бюджет />
  <Field: Telegram: @username />
  <Button onClick={openTelegram}>
    Написать в Telegram
  </Button>
</RequestModal>
```

## 4. UI улучшения

### 4.1. Календарь в TourDetailPage

**Файл:** `frontend/src/pages/public/TourDetailPage.tsx`

**Улучшения:**

- Увеличить размер календаря
- Добавить hover эффекты на доступные даты
- Выделить выбранную дату цветом
- Добавить поле "Telegram" в форму бронирования
```tsx
<DayPicker
  className="text-lg"  // Увеличить шрифт
  modifiers={{
    available: availableDates,
    booked: bookedDates
  }}
  modifiersStyles={{
    available: { 
      backgroundColor: '#FFE5EC',
      cursor: 'pointer',
      fontWeight: 'bold'
    }
  }}
/>

<Input
  label="Telegram для связи"
  placeholder="@username"
  name="telegram"
/>
```


### 4.2. Цвет календаря - малиновый

**Файл:** `frontend/src/index.css`

```css
/* Изменить цвет react-day-picker */
.rdp-day_selected {
  background-color: #FF385C !important;
}

.rdp-day_range_middle {
  background-color: #FFE5EC !important;
}
```

### 4.3. Анимированный текст - фиксированная высота

**Файл:** `frontend/src/components/TypewriterHero.tsx`

**Проблема:** Текст стирается → блоки двигаются

**Решение:**

```tsx
<div className="h-[120px] flex items-center">
  {/* Фиксированная высота для текста */}
  <TypeAnimation ... />
</div>
```

## 5. Фильтры на странице туров

### 5.1. Убрать чипы категорий

**Файл:** `frontend/src/pages/public/ToursPage.tsx`

Удалить:

- Категории (Культура, Природа...)
- Длительность (1-3 часа...)
- Цена (До 5000₽...)
- Рейтинг (4.5+ звёзд...)

### 5.2. Сделать рабочими списки

**Оставить только:**

```tsx
<Select name="dateRange">
  <option>Любые даты</option>
  <option>Сегодня</option>
  <option>Завтра</option>
  <option>Эти выходные</option>
  <option>На этой неделе</option>
</Select>

<Select name="duration">
  <option>Любая длительность</option>
  <option>До 2 часов</option>
  <option>2-4 часа</option>
  <option>4-8 часов</option>
  <option>Полный день</option>
</Select>

<Select name="price">
  <option>Любая цена</option>
  <option>До 3000₽</option>
  <option>3000-7000₽</option>
  <option>7000-15000₽</option>
  <option>15000+₽</option>
</Select>
```

## 6. Заполнение карточек данными

**Файл:** `backend/seed_data.py`

### Расширить данные:

**Tours:**

- Увеличить description до 800-1200 символов
- Добавить 5-8 изображений на тур (Unsplash API)
- Добавить included/excluded списки (8-12 пунктов)
- Добавить meeting_point с координатами
- Добавить cancellation_policy

**Отзывы:**

- Создать 8-15 отзывов на популярный тур
- 3-5 отзывов на обычный тур
- Подробные тексты 150-300 символов
- Разные рейтинги (4.2 - 5.0)

**Гиды:**

- Добавить bio 200-400 символов
- Добавить specialties []
- Добавить languages []
- Добавить avatar_url
```python
tours = [
  {
    "title": "Храмы Бангкока: духовное путешествие",
    "description": "Погрузитесь в атмосферу древних храмов Бангкока...[800+ символов с деталями маршрута, что увидите, что узнаете, почему это уникально]",
    "images": [
      "https://images.unsplash.com/...",
      # 5-8 фото
    ],
    "included": [
      "Профессиональный гид-историк",
      "Входные билеты во все храмы",
      "Традиционный тайский обед",
      "Трансфер на комфортабельном автомобиле",
      ...
    ],
    "reviews": [
      {
        "rating": 5,
        "text": "Невероятный опыт! Гид Сомчай рассказал столько интересного...[200 символов]",
        "author": "Мария К.",
        "date": "2025-09-15"
      },
      # 8-15 отзывов
    ]
  }
]
```


## Порядок выполнения

1. Sticky search на главной (20 мин)
2. Цвет календаря малиновый (5 мин)
3. Фиксированная высота текста (5 мин)
4. Улучшение календаря TourDetailPage + Telegram (15 мин)
5. Убрать чипы, сделать рабочие списки (20 мин)
6. Backend: модели + миграция (30 мин)
7. Backend: API endpoints (45 мин)
8. Frontend: бронирование → заявка (30 мин)
9. Frontend: заявки гида (30 мин)
10. Frontend: создание тура из заявки (40 мин)
11. Мобильный поиск Airbnb-style (60 мин)
12. Заполнение seed_data.py (45 мин)

**Общее время:** ~6 часов

### To-dos

- [ ] Создать мобильный поиск как в Airbnb с модальным окном
- [ ] Исправить sticky search на главной - использовать layoutId
- [ ] Изменить цвета календаря на малиновые
- [ ] Фиксированная высота для TypewriterHero
- [ ] Улучшить календарь в TourDetailPage + поле Telegram
- [ ] Убрать чипы категорий, оставить 3 select списка
- [ ] Backend: расширить модели Booking/Request/Tour
- [ ] Создать миграцию для новых полей
- [ ] Backend: API для бронирования через заявки
- [ ] Frontend: кнопка Забронировать создаёт заявку
- [ ] Frontend: страница Заявки для гида
- [ ] Frontend: создание тура из заявки с предзаполнением
- [ ] Заполнить seed_data.py подробными данными