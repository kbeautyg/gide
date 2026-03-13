# Улучшения логики личного кабинета

## Обзор изменений

Полная переработка логики личного кабинета с фокусом на правильный flow работы, автообновление данных и улучшенный UX.

## Основные изменения

### 1. WebSocket для автообновления данных ✅

**Backend:**
- Добавлен WebSocket endpoint `/ws` с аутентификацией по JWT токену
- Создан `WebSocketManager` для управления соединениями
- Автоматические уведомления о событиях:
  - `request_updated` - обновление заявки
  - `tour_created` - создание тура
  - `tour_updated` - обновление тура
  - `schedule_updated` - изменение расписания
  - `booking_created` - новое бронирование

**Frontend:**
- Hook `useWebSocket` для подключения к WebSocket серверу
- Hook `useAutoRefresh` с fallback на polling (каждые 15 сек)
- Автообновление всех dashboard страниц без перезагрузки

### 2. Toast-уведомления вместо alert ✅

- Установлена библиотека `sonner` для красивых toast-уведомлений
- Создана обертка `@/lib/toast` с методами:
  - `toast.success()` - успешные действия
  - `toast.error()` - ошибки
  - `toast.info()` - информация
  - `toast.warning()` - предупреждения
- Заменены все `alert()` на toast во всех компонентах

### 3. ConfirmDialog вместо confirm() ✅

- Создан компонент `<ConfirmDialog>` на базе Radix UI
- Красивые модальные окна для подтверждения критических действий
- Варианты: default, destructive
- Поддержка loading состояния
- Заменены все `confirm()` на ConfirmDialog

### 4. Исправлен flow принятия заявок ✅

**Старая логика (неправильная):**
1. Нажать "Принять и создать тур"
2. → Сразу устанавливается `guide_id` и `status`
3. → Заявка попадает в "Мои" до создания тура
4. → При возврате назад - дубли и ошибки

**Новая логика (правильная):**
1. Нажать "Принять и создать тур"
2. → `/accept` только проверяет доступность (НЕ меняет guide_id)
3. → Переход на страницу создания тура
4. → Показываются данные заявки
5. → Нажать "Создать тур" → ConfirmDialog
6. → При создании тура устанавливается `guide_id` и `status = 'in_progress'`
7. → Заявка попадает в "Мои экскурсии"

**Файлы:**
- `backend/app/api/v1/endpoints/requests.py` - endpoint `/accept` больше не меняет guide_id
- `backend/app/api/v1/endpoints/custom_tours.py` - устанавливает guide_id при создании тура

### 5. Исправлены ссылки на туры ✅

**Проблема:**
- Backend возвращал: `/tours/{share_code}`
- Но роут настроен на: `/t/{code}`
- Ссылки не работали

**Решение:**
- Изменен формат в `custom_tours.py`: `f"/t/{tour.share_code}"`
- Все ссылки работают корректно

### 6. Убрана кнопка "Открыть календарь" ✅

После создания тура показываются только две кнопки:
- "Перейти к моим турам"
- "Вернуться к заявкам"

Кнопка "Открыть календарь" была избыточной.

### 7. Защита от повторного создания тура ✅

**Frontend:**
- Проверка `request.generated_tour_id` при загрузке страницы
- Если тур уже создан - показывается сообщение и кнопка перехода
- Блокировка кнопки создания

**Backend:**
- Проверка в `custom_tours.py` (уже была):
  ```python
  if request.generated_tour_id:
      raise HTTPException(status_code=400, detail="Tour already created")
  ```

### 8. Цвета в календаре ✅

**Проблема:**
После добавления заявки цвета не обновлялись сразу.

**Решение:**
- Добавлен WebSocket listener на `schedule_updated`
- Fallback polling каждые 15 сек
- `queryClient.invalidateQueries(['my-schedule'])` после всех изменений

### 9. Edge cases обработаны ✅

- Если заявка уже принята другим гидом - показывается ошибка
- Если вернуться на страницу создания после создания тура - показывается информация
- Если потеряно соединение - автореконнект WebSocket
- Если WebSocket недоступен - используется polling

## Структура файлов

### Frontend (новые файлы)

```
frontend/src/
├── lib/
│   └── toast.tsx                 # Toast обертка над sonner
├── components/ui/
│   ├── alert-dialog.tsx          # AlertDialog компонент (Radix UI)
│   └── confirm-dialog.tsx        # ConfirmDialog компонент
└── hooks/
    ├── useWebSocket.ts           # WebSocket хук
    └── useAutoRefresh.ts         # Автообновление с fallback
```

### Backend (новые файлы)

```
backend/app/
├── services/
│   └── websocket_service.py      # WebSocket менеджер
└── main.py                       # WebSocket endpoint /ws
```

### Frontend (измененные файлы)

- `main.tsx` - добавлен `<Toaster>` компонент
- `pages/dashboard/RequestsPage.tsx` - WebSocket + toast
- `pages/dashboard/CreateTourFromRequest.tsx` - ConfirmDialog + защита + toast
- `pages/dashboard/MyToursPage.tsx` - WebSocket + toast + ConfirmDialog
- `pages/dashboard/CalendarPage.tsx` - WebSocket + toast

### Backend (измененные файлы)

- `api/v1/endpoints/requests.py` - исправлена логика accept
- `api/v1/endpoints/custom_tours.py` - guide_id при создании + ссылка /t/
- `core/deps.py` - добавлена `get_current_user_ws()` для WebSocket

## Зависимости

### Установлено:

```bash
npm install sonner @radix-ui/react-alert-dialog
```

Уже были установлены:
- `@radix-ui/react-switch`
- `@radix-ui/react-tooltip`

## Использование

### WebSocket подключение

WebSocket автоматически подключается при загрузке dashboard страниц через `useAutoRefresh`:

```typescript
useAutoRefresh({
  queryKeys: [['requests'], ['tours']],
  intervalMs: 15000, // fallback polling
})
```

### Toast уведомления

```typescript
import { toast } from '@/lib/toast'

// Успех
toast.success('Тур создан!', 'Описание')

// Ошибка
toast.error('Ошибка', 'Детали ошибки')

// С промисом
toast.promise(
  apiCall(),
  {
    loading: 'Загрузка...',
    success: 'Готово!',
    error: 'Ошибка!'
  }
)
```

### ConfirmDialog

```typescript
<ConfirmDialog
  open={showConfirm}
  onOpenChange={setShowConfirm}
  title="Удалить экскурсию?"
  description="Это действие нельзя отменить!"
  confirmText="Удалить"
  cancelText="Отмена"
  onConfirm={handleDelete}
  variant="destructive"
  loading={isPending}
/>
```

## Результаты

✅ Автообновление данных без перезагрузки (WebSocket + 15 сек fallback)
✅ Красивые toast-уведомления вместо alert
✅ Правильный flow: Принять → Создать тур → Подтвердить → В "Мои туры"
✅ Рабочие ссылки на туры `/t/{code}`
✅ Нет лишней кнопки "Открыть календарь"
✅ Календарь сразу показывает цвета
✅ Защита от повторного создания тура
✅ Обработка всех граничных случаев
✅ Красивые ConfirmDialog для критических действий

## Тестирование

1. Открыть dashboard
2. Проверить WebSocket подключение в консоли (должно быть "✅ WebSocket connected")
3. Создать заявку и принять её
4. Проверить что заявка НЕ попадает в "Мои" до создания тура
5. Создать тур - проверить ConfirmDialog
6. Проверить что ссылка работает (формат `/t/code`)
7. Попробовать вернуться назад - должна быть защита
8. Проверить toast уведомления при всех действиях
9. Открыть вторую вкладку - проверить что данные синхронизируются

## Производительность

- WebSocket держит соединение активным с ping/pong каждые 25 сек
- Fallback polling только если WebSocket недоступен
- React Query кеширует данные на 5 минут
- Минимальное количество запросов к API

