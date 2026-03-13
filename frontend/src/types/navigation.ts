/**
 * Типы для системы навигации и фильтров
 * Единый источник истины для всех типов навигации
 */

/**
 * Состояние навигации - единый источник истины для всех фильтров
 */
export interface NavigationState {
  // Локации
  location: string | null  // город или страна (одиночное значение для удобства)
  cities: string[]         // множественный выбор городов
  countries: string[]      // множественный выбор стран
  
  // Категории и темы
  themes: string[]         // темы/категории туров
  
  // Достопримечательности и теги
  landmarks: string[]      // достопримечательности
  tags: string[]           // теги туров
  
  // Числовые фильтры
  price: { min?: number; max?: number } | null
  duration: { min?: number; max?: number } | null
  rating: { min?: number } | null
  guests: number | null
  
  // Новые фильтры в стиле Tripster
  dateRange: { from?: Date; to?: Date } | null  // диапазон дат
  format: string[]  // форматы проведения (групповой/индивидуальный)
  transportation: string[]  // способы передвижения (пешком/на транспорте)
}

/**
 * Значение контекста навигации
 */
export interface NavigationContextValue {
  state: NavigationState
  
  // Методы для работы с локациями
  setLocation: (location: string | null) => void
  addCity: (city: string) => void
  removeCity: (city: string) => void
  toggleCity: (city: string) => void
  addCountry: (country: string) => void
  removeCountry: (country: string) => void
  toggleCountry: (country: string) => void
  
  // Методы для работы с темами
  addTheme: (theme: string) => void
  removeTheme: (theme: string) => void
  toggleTheme: (theme: string) => void
  
  // Методы для работы с достопримечательностями и тегами
  addLandmark: (landmark: string) => void
  removeLandmark: (landmark: string) => void
  toggleLandmark: (landmark: string) => void
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  toggleTag: (tag: string) => void
  
  // Методы для работы с числовыми фильтрами
  setPrice: (price: { min?: number; max?: number } | null) => void
  setDuration: (duration: { min?: number; max?: number } | null) => void
  setRating: (rating: { min?: number } | null) => void
  setGuests: (guests: number | null) => void
  
  // Методы для работы с новыми фильтрами
  setDateRange: (dateRange: { from?: Date; to?: Date } | null) => void
  setFormat: (format: string[]) => void
  setTransportation: (transportation: string[]) => void
  toggleFormat: (format: string) => void
  toggleTransportation: (transportation: string) => void
  
  // Утилиты
  resetFilters: () => void
  buildUrl: () => string  // Генерация URL из состояния
  getActiveLocation: () => string | null  // Получить активную локацию для отображения
}

/**
 * Начальное состояние навигации
 */
export const initialNavigationState: NavigationState = {
  location: null,
  cities: [],
  countries: [],
  themes: [],
  landmarks: [],
  tags: [],
  price: null,
  duration: null,
  rating: null,
  guests: null,
  dateRange: null,
  format: [],
  transportation: [],
}


