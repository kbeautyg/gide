import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhone(phone: string): string {
  // +79991234567 → +7 (999) 123-45-67
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11 && cleaned.startsWith('7')) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`
  }
  return phone
}

export function formatCurrency(amount: number, currency: string = 'RUB'): string {
  const symbols: Record<string, string> = {
    RUB: '₽',
    THB: '฿',
    USD: '$',
  }
  
  return `${amount.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${symbols[currency] || currency}`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
