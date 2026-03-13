/**
 * Утилиты для генерации ссылок навигации
 * Единая система для создания ссылок на страницу туров с фильтрами
 */
import { FilterParams } from './urlParams'
import { buildUrlParams } from './urlParams'
import { CITY_TO_COUNTRY_MAP } from '@/constants/tripsterCategories'

/**
 * Генерирует ссылку на страницу туров с фильтрами
 */
export function buildToursLink(filters: {
  location?: string | string[]
  themes?: string | string[]
  landmarks?: string | string[]
  tags?: string | string[]
  minPrice?: number
  maxPrice?: number
  durationMin?: number
  durationMax?: number
  minRating?: number
  guests?: number
}): string {
  const params: FilterParams = {}

  // Location
  if (filters.location) {
    if (Array.isArray(filters.location)) {
      params.location = filters.location
    } else {
      params.location = [filters.location]
    }
  }

  // Themes
  if (filters.themes) {
    if (Array.isArray(filters.themes)) {
      params.themes = filters.themes
    } else {
      params.themes = [filters.themes]
    }
  }

  // Landmarks
  if (filters.landmarks) {
    if (Array.isArray(filters.landmarks)) {
      params.landmarks = filters.landmarks
    } else {
      params.landmarks = [filters.landmarks]
    }
  }

  // Tags
  if (filters.tags) {
    if (Array.isArray(filters.tags)) {
      params.tags = filters.tags
    } else {
      params.tags = [filters.tags]
    }
  }

  // Price
  if (filters.minPrice !== undefined) {
    params.minPrice = filters.minPrice
  }
  if (filters.maxPrice !== undefined) {
    params.maxPrice = filters.maxPrice
  }

  // Duration
  if (filters.durationMin !== undefined) {
    params.durationMin = filters.durationMin
  }
  if (filters.durationMax !== undefined) {
    params.durationMax = filters.durationMax
  }

  // Rating
  if (filters.minRating !== undefined) {
    params.minRating = filters.minRating
  }

  // Guests
  if (filters.guests !== undefined) {
    params.guests = filters.guests
  }

  const urlParams = buildUrlParams(params)
  return `/tours?${urlParams.toString()}`
}

/**
 * Парсит страну из location строки
 * Поддерживает форматы: "Город, Страна" или "Город"
 */
export function parseCountryFromLocation(location: string): string | null {
  // Если в location есть запятая, берем часть после запятой
  if (location.includes(',')) {
    const parts = location.split(',').map(s => s.trim())
    return parts[1] || null
  }
  
  // Иначе ищем в маппинге городов к странам
  return CITY_TO_COUNTRY_MAP[location] || null
}

/**
 * Парсит город из location строки
 * Поддерживает форматы: "Город, Страна" или "Город"
 */
export function parseCityFromLocation(location: string): string {
  if (location.includes(',')) {
    return location.split(',')[0].trim()
  }
  return location
}

/**
 * Проверяет, является ли location городом (есть в маппинге)
 */
export function isCityLocation(location: string): boolean {
  const city = parseCityFromLocation(location)
  return city in CITY_TO_COUNTRY_MAP
}

/**
 * Проверяет, является ли location страной
 */
export function isCountryLocation(location: string): boolean {
  // Если это город, то не страна
  if (isCityLocation(location)) {
    return false
  }
  
  // Проверяем, есть ли такая страна в списке стран
  const countries = Object.values(CITY_TO_COUNTRY_MAP)
  return countries.includes(location)
}

