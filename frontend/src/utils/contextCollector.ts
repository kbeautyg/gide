/**
 * Утилита для сбора контекста со страницы
 * Помогает боту "видеть", что происходит у пользователя
 */

// ============ BROWSING HISTORY TRACKER ============
const HISTORY_KEY = 'grinch_browsing_history'
const HISTORY_MAX_ITEMS = 20
const HISTORY_EXPIRY_MS = 2 * 60 * 60 * 1000 // 2 hours

interface BrowsingHistoryItem {
  path: string
  title: string
  type: 'home' | 'tours_list' | 'tour_detail' | 'contact' | 'about' | 'other'
  tourId?: string
  tourTitle?: string
  timestamp: number
  duration?: number // seconds spent on page
}

/**
 * Track current page visit
 */
export const trackPageVisit = () => {
  try {
    const history = getBrowsingHistory()
    const path = window.location.pathname
    const now = Date.now()

    // Update duration of previous page
    if (history.length > 0) {
      const lastItem = history[history.length - 1]
      if (!lastItem.duration) {
        lastItem.duration = Math.round((now - lastItem.timestamp) / 1000)
      }
    }

    // Determine page type
    let pageType: BrowsingHistoryItem['type'] = 'other'
    let tourId: string | undefined
    let tourTitle: string | undefined

    if (path === '/') pageType = 'home'
    else if (path === '/tours') pageType = 'tours_list'
    else if (path.match(/\/tours\/(\d+)/)) {
      pageType = 'tour_detail'
      const match = path.match(/\/tours\/(\d+)/)
      tourId = match?.[1]
      // Try to get tour title from page
      setTimeout(() => {
        const titleEl = document.querySelector('h1')
        if (titleEl && tourId) {
          updateLastHistoryItem({ tourTitle: titleEl.textContent || undefined })
        }
      }, 500)
    }
    else if (path === '/contact') pageType = 'contact'
    else if (path === '/about') pageType = 'about'

    // Don't add duplicate consecutive pages
    if (history.length > 0 && history[history.length - 1].path === path) {
      return
    }

    // Add new item
    history.push({
      path,
      title: document.title,
      type: pageType,
      tourId,
      tourTitle,
      timestamp: now
    })

    // Keep only last N items
    while (history.length > HISTORY_MAX_ITEMS) {
      history.shift()
    }

    saveBrowsingHistory(history)
  } catch (e) {
    console.error('Failed to track page visit', e)
  }
}

/**
 * Update the last history item (e.g., to add tour title after it loads)
 */
const updateLastHistoryItem = (updates: Partial<BrowsingHistoryItem>) => {
  try {
    const history = getBrowsingHistory()
    if (history.length > 0) {
      history[history.length - 1] = { ...history[history.length - 1], ...updates }
      saveBrowsingHistory(history)
    }
  } catch (e) {
    console.error('Failed to update history item', e)
  }
}

/**
 * Get browsing history from localStorage
 */
export const getBrowsingHistory = (): BrowsingHistoryItem[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    const expiry = localStorage.getItem(HISTORY_KEY + '_expiry')
    
    if (stored && expiry && Date.now() < parseInt(expiry)) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to get browsing history', e)
  }
  return []
}

/**
 * Save browsing history to localStorage
 */
const saveBrowsingHistory = (history: BrowsingHistoryItem[]) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    localStorage.setItem(HISTORY_KEY + '_expiry', (Date.now() + HISTORY_EXPIRY_MS).toString())
  } catch (e) {
    console.error('Failed to save browsing history', e)
  }
}

/**
 * Format browsing history for AI (human-readable summary)
 */
export const formatBrowsingHistoryForAI = (): string => {
  const history = getBrowsingHistory()
  if (history.length === 0) return 'Пользователь только что зашёл на сайт.'

  const summary: string[] = []
  const toursViewed: string[] = []
  let totalTimeOnSite = 0

  history.forEach(item => {
    if (item.duration) totalTimeOnSite += item.duration
    if (item.type === 'tour_detail' && item.tourTitle) {
      toursViewed.push(item.tourTitle)
    }
  })

  // Time on site
  if (totalTimeOnSite > 60) {
    summary.push(`На сайте ~${Math.round(totalTimeOnSite / 60)} мин.`)
  }

  // Tours viewed
  if (toursViewed.length > 0) {
    summary.push(`Смотрел туры: ${toursViewed.slice(-3).join(', ')}`)
  }

  // Current page context
  const lastItem = history[history.length - 1]
  if (lastItem) {
    const pageNames: Record<string, string> = {
      'home': 'на главной',
      'tours_list': 'в каталоге туров',
      'tour_detail': `на странице тура${lastItem.tourTitle ? ` "${lastItem.tourTitle}"` : ''}`,
      'contact': 'на странице контактов',
      'about': 'на странице "О нас"',
      'other': 'на другой странице'
    }
    summary.push(`Сейчас ${pageNames[lastItem.type] || 'на сайте'}`)
  }

  // Pages visited count
  summary.push(`Посетил ${history.length} страниц`)

  return summary.join('. ') + '.'
}

// ============ END BROWSING HISTORY TRACKER ============

export interface PageContext {
  url: string
  title: string
  path: string
  queryParams: Record<string, string>
  timestamp: string
  language: string
  screenSize: {
    width: number
    height: number
  }
  // Новые поля для лучшего контекста
  pageType: 'home' | 'tours_list' | 'tour_detail' | 'contact' | 'about' | 'other'
  filters?: {
    country?: string
    city?: string
    category?: string
    priceMin?: number
    priceMax?: number
  }
}

export interface SpecificContext {
  entityType: 'tour' | 'order' | 'category' | null
  entityId: string | null
  tourTitle?: string
  tourPrice?: number
}

export const collectPageContext = (): PageContext => {
  const urlParams = new URLSearchParams(window.location.search)
  const queryParams: Record<string, string> = {}
  
  urlParams.forEach((value, key) => {
    queryParams[key] = value
  })

  const path = window.location.pathname

  // Определяем тип страницы
  let pageType: PageContext['pageType'] = 'other'
  if (path === '/') pageType = 'home'
  else if (path === '/tours') pageType = 'tours_list'
  else if (path.match(/\/tours\/\d+/)) pageType = 'tour_detail'
  else if (path === '/contact') pageType = 'contact'
  else if (path === '/about') pageType = 'about'

  // Собираем фильтры из URL параметров
  const filters: PageContext['filters'] = {}
  if (queryParams.country) filters.country = queryParams.country
  if (queryParams.city) filters.city = queryParams.city
  if (queryParams.category) filters.category = queryParams.category
  if (queryParams.price_min) filters.priceMin = parseInt(queryParams.price_min)
  if (queryParams.price_max) filters.priceMax = parseInt(queryParams.price_max)

  return {
    url: window.location.href,
    title: document.title,
    path,
    queryParams,
    timestamp: new Date().toISOString(),
    language: navigator.language,
    screenSize: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    pageType,
    filters: Object.keys(filters).length > 0 ? filters : undefined
  }
}

/**
 * Функция для получения специфичного контекста
 * Например, если мы на странице тура, пробуем найти ID и данные
 */
export const collectSpecificContext = (): SpecificContext | null => {
  const path = window.location.pathname
  
  // Страница тура: /tours/123
  const tourMatch = path.match(/\/tours\/(\d+)/)
  if (tourMatch) {
    // Пытаемся получить данные о туре со страницы
    const titleEl = document.querySelector('h1')
    const priceEl = document.querySelector('[data-price]')
    
    return { 
      entityType: 'tour', 
      entityId: tourMatch[1],
      tourTitle: titleEl?.textContent || undefined,
      tourPrice: priceEl ? parseInt(priceEl.getAttribute('data-price') || '0') : undefined
    }
  }

  // Страница заказа: /orders/567
  const orderMatch = path.match(/\/orders\/(\d+)/)
  if (orderMatch) {
    return { entityType: 'order', entityId: orderMatch[1] }
  }

  // Страница категории: /tours?category=...
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('category')) {
    return { entityType: 'category', entityId: urlParams.get('category') }
  }

  return null
}

/**
 * Форматирует туры для отправки в AI (сжатый формат для экономии токенов)
 */
export const formatToursForAI = (tours: any[], limit = 20): string => {
  const formatted = tours.slice(0, limit).map(t => 
    `#${t.id}: ${t.title} | ${t.location} | ${t.price}₽ | ⭐${t.rating}`
  )
  return formatted.join('\n')
}

/**
 * Собирает полный контекст для AI
 */
export const collectFullContext = (tours: any[], user: any, sessionId: string) => {
  const page = collectPageContext()
  const specific = collectSpecificContext()
  const browsingHistory = getBrowsingHistory()
  const browsingSummary = formatBrowsingHistoryForAI()
  
  return {
    // Идентификация сессии
    sessionId,
    
    // Информация о пользователе
    user: {
      name: user?.name || null,
      isLoggedIn: !!user?.id,
      role: user?.role || 'guest'
    },
    
    // Контекст страницы
    page: {
      type: page.pageType,
      title: page.title,
      path: page.path,
      filters: page.filters
    },
    
    // Специфичный контекст (текущий тур и т.д.)
    currentEntity: specific,
    
    // История просмотров пользователя (для понимания интересов)
    browsingContext: {
      summary: browsingSummary,
      toursViewed: browsingHistory
        .filter(h => h.type === 'tour_detail' && h.tourId)
        .map(h => ({ id: h.tourId, title: h.tourTitle, duration: h.duration }))
        .slice(-5), // Last 5 tours viewed
      pagesVisited: browsingHistory.length,
      recentPages: browsingHistory.slice(-5).map(h => ({
        type: h.type,
        path: h.path,
        duration: h.duration
      }))
    },
    
    // Доступные туры (сжатый формат)
    toursCount: tours.length,
    toursPreview: formatToursForAI(tours, 15),
    
    // Полный список туров для поиска (если нужно)
    availableTours: tours.map(t => ({
      id: t.id,
      title: t.title,
      price: t.price,
      location: t.location,
      category: t.category,
      rating: t.rating,
      tags: t.tags
    }))
  }
}
