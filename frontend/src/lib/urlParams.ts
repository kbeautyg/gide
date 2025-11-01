/**
 * Утилиты для работы с URL параметрами фильтров
 * Единая система для работы с параметрами навигации
 * 
 * ПРИНЦИПЫ:
 * - Используем только `themes` (не `category`)
 * - Обратная совместимость: `category` автоматически маппится на `themes`
 * - Все параметры валидируются
 */

export interface FilterParams {
  location?: string[]
  themes?: string[]
  landmarks?: string[]
  tags?: string[]
  minPrice?: number
  maxPrice?: number
  durationMin?: number
  durationMax?: number
  minRating?: number
  guests?: number
}

/**
 * Парсит URL параметры в объект фильтров
 * Обеспечивает обратную совместимость со старыми ссылками
 */
export function parseUrlParams(searchParams: URLSearchParams): FilterParams {
  const params: FilterParams = {}

  // Location (может быть город или страна, через запятую для множественных значений)
  const location = searchParams.get('location')
  if (location) {
    params.location = location
      .split(',')
      .map(l => l.trim())
      .filter(Boolean)
  }

  // Themes (темы/категории) - основной параметр
  const themes = searchParams.get('themes')
  if (themes) {
    params.themes = themes
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
  }

  // Category (категории) - для обратной совместимости, маппим на themes
  const category = searchParams.get('category')
  if (category) {
    const categoryList = category
      .split(',')
      .map(c => c.trim())
      .filter(Boolean)
    
    // Объединяем с существующими themes (если есть)
    if (params.themes) {
      params.themes = [...params.themes, ...categoryList]
      // Убираем дубликаты
      params.themes = [...new Set(params.themes)]
    } else {
      params.themes = categoryList
    }
  }

  // Landmarks (достопримечательности)
  const landmarks = searchParams.get('landmarks')
  if (landmarks) {
    params.landmarks = landmarks
      .split(',')
      .map(l => l.trim())
      .filter(Boolean)
  }

  // Tags (теги)
  const tags = searchParams.get('tags')
  if (tags) {
    params.tags = tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
  }

  // Price (цена) - валидация значений
  const minPrice = searchParams.get('min_price')
  if (minPrice) {
    const parsed = parseFloat(minPrice)
    if (!isNaN(parsed) && parsed >= 0) {
      params.minPrice = parsed
    }
  }
  
  const maxPrice = searchParams.get('max_price')
  if (maxPrice) {
    const parsed = parseFloat(maxPrice)
    if (!isNaN(parsed) && parsed >= 0) {
      params.maxPrice = parsed
      // Валидация: maxPrice должен быть >= minPrice
      if (params.minPrice !== undefined && params.maxPrice < params.minPrice) {
        delete params.maxPrice
      }
    }
  }

  // Duration (длительность) - валидация значений
  const durationMin = searchParams.get('duration_min')
  if (durationMin) {
    const parsed = parseInt(durationMin, 10)
    if (!isNaN(parsed) && parsed > 0) {
      params.durationMin = parsed
    }
  }
  
  const durationMax = searchParams.get('duration_max')
  if (durationMax) {
    const parsed = parseInt(durationMax, 10)
    if (!isNaN(parsed) && parsed > 0) {
      params.durationMax = parsed
      // Валидация: durationMax должен быть >= durationMin
      if (params.durationMin !== undefined && params.durationMax < params.durationMin) {
        delete params.durationMax
      }
    }
  }

  // Rating (рейтинг) - валидация значений (0-5)
  const minRating = searchParams.get('min_rating')
  if (minRating) {
    const parsed = parseFloat(minRating)
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 5) {
      params.minRating = parsed
    }
  }

  // Guests (количество гостей) - валидация значений
  const guests = searchParams.get('guests')
  if (guests) {
    const parsed = parseInt(guests, 10)
    if (!isNaN(parsed) && parsed > 0) {
      params.guests = parsed
    }
  }

  return params
}

/**
 * Формирует URL параметры из объекта фильтров
 * Всегда использует `themes` (не `category`) для единообразия
 */
export function buildUrlParams(filters: FilterParams): URLSearchParams {
  const params = new URLSearchParams()

  // Location
  if (filters.location && filters.location.length > 0) {
    // Убираем дубликаты и пустые значения
    const uniqueLocations = [...new Set(filters.location.filter(Boolean))]
    if (uniqueLocations.length > 0) {
      params.append('location', uniqueLocations.join(','))
    }
  }

  // Themes (используем только themes, не category)
  if (filters.themes && filters.themes.length > 0) {
    // Убираем дубликаты и пустые значения
    const uniqueThemes = [...new Set(filters.themes.filter(Boolean))]
    if (uniqueThemes.length > 0) {
      params.append('themes', uniqueThemes.join(','))
    }
  }

  // Landmarks
  if (filters.landmarks && filters.landmarks.length > 0) {
    const uniqueLandmarks = [...new Set(filters.landmarks.filter(Boolean))]
    if (uniqueLandmarks.length > 0) {
      params.append('landmarks', uniqueLandmarks.join(','))
    }
  }

  // Tags
  if (filters.tags && filters.tags.length > 0) {
    const uniqueTags = [...new Set(filters.tags.filter(Boolean))]
    if (uniqueTags.length > 0) {
      params.append('tags', uniqueTags.join(','))
    }
  }

  // Price (только если значения валидны)
  if (filters.minPrice !== undefined && filters.minPrice >= 0) {
    params.append('min_price', filters.minPrice.toString())
  }
  if (filters.maxPrice !== undefined && filters.maxPrice >= 0) {
    // Проверяем, что maxPrice >= minPrice
    if (filters.minPrice === undefined || filters.maxPrice >= filters.minPrice) {
      params.append('max_price', filters.maxPrice.toString())
    }
  }

  // Duration (только если значения валидны)
  if (filters.durationMin !== undefined && filters.durationMin > 0) {
    params.append('duration_min', filters.durationMin.toString())
  }
  if (filters.durationMax !== undefined && filters.durationMax > 0) {
    // Проверяем, что durationMax >= durationMin
    if (filters.durationMin === undefined || filters.durationMax >= filters.durationMin) {
      params.append('duration_max', filters.durationMax.toString())
    }
  }

  // Rating (только если значение валидно: 0-5)
  if (filters.minRating !== undefined && filters.minRating >= 0 && filters.minRating <= 5) {
    params.append('min_rating', filters.minRating.toString())
  }

  // Guests (только если значение валидно: > 0)
  if (filters.guests !== undefined && filters.guests > 0) {
    params.append('guests', filters.guests.toString())
  }

  return params
}

/**
 * Преобразует параметры цены в строки для UI
 */
export function priceRangeToString(minPrice?: number, maxPrice?: number): string[] {
  const ranges: string[] = []
  
  if (minPrice === undefined && maxPrice === 5000) {
    ranges.push('До 5000₽')
  } else if (minPrice === 5000 && maxPrice === 10000) {
    ranges.push('5000-10000₽')
  } else if (minPrice === 10000 && maxPrice === undefined) {
    ranges.push('10000+₽')
  }
  
  return ranges
}

/**
 * Преобразует параметры длительности в строки для UI
 */
export function durationRangeToString(durationMin?: number, durationMax?: number): string[] {
  const ranges: string[] = []
  
  if (durationMin === 1 && durationMax === 3) {
    ranges.push('1-3 часа')
  } else if (durationMin === 4 && durationMax === 6) {
    ranges.push('4-6 часов')
  } else if (durationMin === 7 && durationMax === undefined) {
    ranges.push('Полный день (7+ч)')
  }
  
  return ranges
}

/**
 * Преобразует параметр рейтинга в строки для UI
 */
export function ratingToString(minRating?: number): string[] {
  const ratings: string[] = []
  
  if (minRating === 4.5) {
    ratings.push('4.5+ звёзд')
  } else if (minRating === 4.7) {
    ratings.push('4.7+')
  } else if (minRating === 4.9) {
    ratings.push('4.9+ (топ)')
  }
  
  return ratings
}

/**
 * Преобразует строки цены в параметры
 */
export function stringToPriceRange(range: string): { minPrice?: number; maxPrice?: number } {
  switch (range) {
    case 'До 5000₽':
      return { maxPrice: 5000 }
    case '5000-10000₽':
      return { minPrice: 5000, maxPrice: 10000 }
    case '10000+₽':
      return { minPrice: 10000 }
    default:
      return {}
  }
}

/**
 * Преобразует строки длительности в параметры
 */
export function stringToDurationRange(range: string): { durationMin?: number; durationMax?: number } {
  switch (range) {
    case '1-3 часа':
      return { durationMin: 1, durationMax: 3 }
    case '4-6 часов':
      return { durationMin: 4, durationMax: 6 }
    case 'Полный день (7+ч)':
      return { durationMin: 7 }
    default:
      return {}
  }
}

/**
 * Преобразует строки рейтинга в параметры
 */
export function stringToRating(range: string): { minRating?: number } {
  switch (range) {
    case '4.5+ звёзд':
      return { minRating: 4.5 }
    case '4.7+':
      return { minRating: 4.7 }
    case '4.9+ (топ)':
      return { minRating: 4.9 }
    default:
      return {}
  }
}
