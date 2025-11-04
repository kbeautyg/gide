/**
 * Утилиты для построения URL в новом формате (как у Tripster)
 */

import { getCitySlug, getCountrySlug, getCategorySlug } from './urlSlugs'

/**
 * Построить URL для страницы города
 * @param cityName Название города
 * @returns URL вида /experience/{city-slug}
 */
export function buildExperienceUrl(cityName: string): string {
  const slug = getCitySlug(cityName)
  return `/experience/${slug}`
}

/**
 * Построить URL для страницы страны
 * @param countryName Название страны
 * @returns URL вида /destinations/{country-slug}
 */
export function buildDestinationUrl(countryName: string): string {
  const slug = getCountrySlug(countryName)
  return `/destinations/${slug}`
}

/**
 * Построить URL для страницы категории в городе
 * @param cityName Название города
 * @param categoryName Название категории
 * @returns URL вида /experience/{city-slug}/{category-slug}
 */
export function buildCategoryUrl(cityName: string, categoryName: string): string {
  const citySlug = getCitySlug(cityName)
  const categorySlug = getCategorySlug(categoryName)
  return `/experience/${citySlug}/${categorySlug}`
}

/**
 * Построить URL с query параметрами для фильтров
 * @param baseUrl Базовый URL (pathname)
 * @param filters Объект с фильтрами
 * @returns Полный URL с query параметрами
 */
export function buildFilteredUrl(
  baseUrl: string,
  filters: {
    minPrice?: number
    maxPrice?: number
    durationMin?: number
    durationMax?: number
    minRating?: number
    guests?: number
    landmarks?: string | string[]
    themes?: string | string[]
    tags?: string | string[]
  }
): string {
  const params = new URLSearchParams()
  
  if (filters.minPrice !== undefined) {
    params.append('min_price', filters.minPrice.toString())
  }
  if (filters.maxPrice !== undefined) {
    params.append('max_price', filters.maxPrice.toString())
  }
  if (filters.durationMin !== undefined) {
    params.append('duration_min', filters.durationMin.toString())
  }
  if (filters.durationMax !== undefined) {
    params.append('duration_max', filters.durationMax.toString())
  }
  if (filters.minRating !== undefined) {
    params.append('min_rating', filters.minRating.toString())
  }
  if (filters.guests !== undefined) {
    params.append('guests', filters.guests.toString())
  }
  
  if (filters.landmarks) {
    const landmarksArray = Array.isArray(filters.landmarks) ? filters.landmarks : [filters.landmarks]
    params.append('landmarks', landmarksArray.join(','))
  }
  
  if (filters.themes) {
    const themesArray = Array.isArray(filters.themes) ? filters.themes : [filters.themes]
    params.append('themes', themesArray.join(','))
  }
  
  if (filters.tags) {
    const tagsArray = Array.isArray(filters.tags) ? filters.tags : [filters.tags]
    params.append('tags', tagsArray.join(','))
  }
  
  const queryString = params.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

