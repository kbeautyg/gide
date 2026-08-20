import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

/**
 * Утилита для объединения классов Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Форматирование даты в московском времени
 */
export function formatMoscowDate(date: Date | string, formatStr: string = 'PPP'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr, { locale: ru })
}

/**
 * Форматирование времени в московском времени
 */
export function formatMoscowDateTime(date: Date | string): string {
  return formatMoscowDate(date, 'PPP p')
}

/**
 * Форматирование суммы в рублях
 */
export function formatRUB(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Форматирование суммы в долларах
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Форматирование суммы в батах
 */
export function formatTHB(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Перевод статусов на русский
 */
export const STATUS_TRANSLATIONS = {
  // Статусы транзакций
  pending: 'В ожидании',
  completed: 'Выполнено',
  declined: 'Отклонено',
  
  // Статусы бронирований
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
  
  // Статусы оплаты
  awaiting_payment: 'Ожидание оплаты',
  paid: 'Оплачено',
  refunded: 'Возврат',
} as const

export function translateStatus(status: string): string {
  return STATUS_TRANSLATIONS[status as keyof typeof STATUS_TRANSLATIONS] || status
}

/**
 * Преобразование URL изображения
 * 1. Если URL начинается с /static/ — добавляет CDN или API URL
 * 2. Если URL уже абсолютный (http/https) — возвращает как есть
 * 3. CDN_BASE можно переключить через VITE_CDN_URL
 */
const CDN = 'https://cdn.inturex.pro'
const ORIGIN_STATIC = 'https://gide-production.up.railway.app'

/**
 * Снимки туров лежат на российском зеркале (cdn.inturex.pro) — оттуда они
 * грузятся быстрее для наших клиентов. Бэкенд держит те же файлы и служит
 * запасным источником — см. getImageFallbackUrl.
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return ''

  if (url.includes('gide-production.up.railway.app/static/')) {
    return url.replace(/https?:\/\/gide-production\.up\.railway\.app\/static\//, `${CDN}/static/`)
  }

  // Уже абсолютная ссылка — как есть
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  if (url.startsWith('/static/')) {
    return `${CDN}${url}`
  }

  return url
}

/**
 * Запасной адрес картинки: статика бэкенда.
 * Используется, если снимок не отдался с зеркала.
 */
export function getImageFallbackUrl(url: string | null | undefined): string {
  if (!url) return ''

  const path = url.startsWith('/static/')
    ? url
    : url.includes('/static/')
      ? url.slice(url.indexOf('/static/'))
      : ''

  return path ? `${ORIGIN_STATIC}${path}` : ''
}