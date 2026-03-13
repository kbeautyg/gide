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
 * Если URL начинается с /static/ - добавляет API URL
 * Иначе возвращает как есть
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return ''
  
  if (url.startsWith('/static/')) {
    const API_BASE = import.meta.env.VITE_API_URL || 'https://gide-production.up.railway.app'
    // Удаляем /api/v1 из конца, если есть, чтобы получить корень
    const baseUrl = API_BASE.replace(/\/api\/v1\/?$/, '')
    return `${baseUrl}${url}`
  }
  
  return url
}