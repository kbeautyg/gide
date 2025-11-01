import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { NavigationState, NavigationContextValue, initialNavigationState } from '@/types/navigation'
import { parseUrlParams, buildUrlParams, FilterParams } from '@/lib/urlParams'

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined)

/**
 * Список известных городов для определения типа локации
 */
const KNOWN_CITIES = [
  'Бангкок', 'Пхукет', 'Паттайя', 'Краби', 'Чиангмай', 'Ко Тао', 'Ко Самуи', 'Хуа Хин',
  'Дубай', 'Абу-Даби', 'Шарджа', 'Аджман',
  'Токио', 'Киото', 'Осака', 'Хиросима', 'Нара', 'Фукуока', 'Саппоро',
  'Сеул', 'Пусан', 'Чеджу', 'Инчхон',
  'Убуд', 'Семиньяк', 'Нуса-Дуа', 'Джакарта', 'Джокьякарта', 'Ломбок',
  'Ханой', 'Хошимин', 'Халонг', 'Нячанг', 'Далат', 'Хойан', 'Хюэ',
  'Сингапур',
  'Пекин', 'Шанхай', 'Сиань', 'Гуанчжоу', 'Ченду', 'Гонконг',
  'Дели', 'Мумбаи', 'Джайпур', 'Агра', 'Гоа', 'Варанаси', 'Удайпур',
  'Куала-Лумпур', 'Пенанг', 'Лангкави', 'Малакка'
]

interface NavigationProviderProps {
  children: React.ReactNode
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Состояние навигации
  const [state, setState] = useState<NavigationState>(initialNavigationState)
  
  // Флаг для предотвращения зацикливания при синхронизации
  const isUpdatingFromUrl = useRef(false)
  const isUpdatingToUrl = useRef(false)

  // Чтение параметров из URL и применение к состоянию
  useEffect(() => {
    // Пропускаем если мы сами обновляем URL
    if (isUpdatingToUrl.current) {
      isUpdatingToUrl.current = false
      return
    }

    isUpdatingFromUrl.current = true

    try {
      const params = parseUrlParams(searchParams)
      const newState: NavigationState = { ...initialNavigationState }

      // Обработка location
      if (params.location && params.location.length > 0) {
        const cities: string[] = []
        const countries: string[] = []
        let singleLocation: string | null = null

        params.location.forEach(loc => {
          if (KNOWN_CITIES.includes(loc)) {
            cities.push(loc)
          } else {
            countries.push(loc)
          }
        })

        // Если только один location, используем его как одиночное значение
        if (params.location.length === 1) {
          singleLocation = params.location[0]
        }

        newState.location = singleLocation
        newState.cities = cities
        newState.countries = countries
      }

      // Обработка themes (включая category для обратной совместимости)
      if (params.themes && params.themes.length > 0) {
        newState.themes = params.themes
      }

      // Обработка landmarks
      if (params.landmarks && params.landmarks.length > 0) {
        newState.landmarks = params.landmarks
      }

      // Обработка tags
      if (params.tags && params.tags.length > 0) {
        newState.tags = params.tags
      }

      // Обработка price
      if (params.minPrice !== undefined || params.maxPrice !== undefined) {
        newState.price = {
          min: params.minPrice,
          max: params.maxPrice
        }
      }

      // Обработка duration
      if (params.durationMin !== undefined || params.durationMax !== undefined) {
        newState.duration = {
          min: params.durationMin,
          max: params.durationMax
        }
      }

      // Обработка rating
      if (params.minRating !== undefined) {
        newState.rating = {
          min: params.minRating
        }
      }

      // Обработка guests
      if (params.guests !== undefined) {
        newState.guests = params.guests
      }

      setState(newState)
    } finally {
      isUpdatingFromUrl.current = false
    }
  }, [searchParams])

  // Обновление URL при изменении состояния
  const updateUrl = useCallback((newState: NavigationState) => {
    // Пропускаем если мы обновляем состояние из URL
    if (isUpdatingFromUrl.current) return

    isUpdatingToUrl.current = true

    try {
      const filters: FilterParams = {}

      // Location из одиночного значения или массивов
      const locations: string[] = []
      if (newState.location) {
        locations.push(newState.location)
      }
      locations.push(...newState.cities)
      locations.push(...newState.countries)
      
      if (locations.length > 0) {
        filters.location = [...new Set(locations)] // Убираем дубликаты
      }

      // Themes
      if (newState.themes.length > 0) {
        filters.themes = newState.themes
      }

      // Landmarks
      if (newState.landmarks.length > 0) {
        filters.landmarks = newState.landmarks
      }

      // Tags
      if (newState.tags.length > 0) {
        filters.tags = newState.tags
      }

      // Price
      if (newState.price) {
        if (newState.price.min !== undefined) {
          filters.minPrice = newState.price.min
        }
        if (newState.price.max !== undefined) {
          filters.maxPrice = newState.price.max
        }
      }

      // Duration
      if (newState.duration) {
        if (newState.duration.min !== undefined) {
          filters.durationMin = newState.duration.min
        }
        if (newState.duration.max !== undefined) {
          filters.durationMax = newState.duration.max
        }
      }

      // Rating
      if (newState.rating && newState.rating.min !== undefined) {
        filters.minRating = newState.rating.min
      }

      // Guests
      if (newState.guests !== null && newState.guests !== undefined) {
        filters.guests = newState.guests
      }

      const urlParams = buildUrlParams(filters)
      const newUrl = `/tours?${urlParams.toString()}`
      
      // Обновляем URL без перезагрузки страницы
      navigate(newUrl, { replace: true })
    } finally {
      // Сбрасываем флаг после небольшой задержки
      setTimeout(() => {
        isUpdatingToUrl.current = false
      }, 100)
    }
  }, [navigate])

  // Методы для работы с локациями
  const setLocation = useCallback((location: string | null) => {
    setState(prev => {
      const newState = { ...prev, location, cities: [], countries: [] }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  const addCity = useCallback((city: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        cities: prev.cities.includes(city) ? prev.cities : [...prev.cities, city],
        location: prev.location === city ? city : prev.location
      }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  const removeCity = useCallback((city: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        cities: prev.cities.filter(c => c !== city),
        location: prev.location === city ? null : prev.location
      }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  const toggleCity = useCallback((city: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        cities: prev.cities.includes(city)
          ? prev.cities.filter(c => c !== city)
          : [...prev.cities, city],
        location: prev.location === city ? null : prev.location
      }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  const addCountry = useCallback((country: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        countries: prev.countries.includes(country) ? prev.countries : [...prev.countries, country]
      }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  const removeCountry = useCallback((country: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        countries: prev.countries.filter(c => c !== country)
      }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  const toggleCountry = useCallback((country: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        countries: prev.countries.includes(country)
          ? prev.countries.filter(c => c !== country)
          : [...prev.countries, country]
      }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  // Методы для работы с темами
  const addTheme = useCallback((theme: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        themes: prev.themes.includes(theme) ? prev.themes : [...prev.themes, theme]
      }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  const removeTheme = useCallback((theme: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        themes: prev.themes.filter(t => t !== theme)
      }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  const toggleTheme = useCallback((theme: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        themes: prev.themes.includes(theme)
          ? prev.themes.filter(t => t !== theme)
          : [...prev.themes, theme]
      }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  // Методы для работы с достопримечательностями и тегами
  const addLandmark = useCallback((landmark: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        landmarks: prev.landmarks.includes(landmark) ? prev.landmarks : [...prev.landmarks, landmark]
      }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  const removeLandmark = useCallback((landmark: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        landmarks: prev.landmarks.filter(l => l !== landmark)
      }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  const toggleLandmark = useCallback((landmark: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        landmarks: prev.landmarks.includes(landmark)
          ? prev.landmarks.filter(l => l !== landmark)
          : [...prev.landmarks, landmark]
      }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  const addTag = useCallback((tag: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        tags: prev.tags.includes(tag) ? prev.tags : [...prev.tags, tag]
      }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  const removeTag = useCallback((tag: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        tags: prev.tags.filter(t => t !== tag)
      }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  const toggleTag = useCallback((tag: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        tags: prev.tags.includes(tag)
          ? prev.tags.filter(t => t !== tag)
          : [...prev.tags, tag]
      }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  // Методы для работы с числовыми фильтрами
  const setPrice = useCallback((price: { min?: number; max?: number } | null) => {
    setState(prev => {
      const newState = { ...prev, price }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  const setDuration = useCallback((duration: { min?: number; max?: number } | null) => {
    setState(prev => {
      const newState = { ...prev, duration }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  const setRating = useCallback((rating: { min?: number } | null) => {
    setState(prev => {
      const newState = { ...prev, rating }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  const setGuests = useCallback((guests: number | null) => {
    setState(prev => {
      const newState = { ...prev, guests }
      updateUrl(newState)
      return newState
    })
  }, [updateUrl])

  // Утилиты
  const resetFilters = useCallback(() => {
    const newState = { ...initialNavigationState }
    setState(newState)
    navigate('/tours', { replace: true })
  }, [navigate])

  const buildUrl = useCallback(() => {
    const filters: FilterParams = {}

    const locations: string[] = []
    if (state.location) locations.push(state.location)
    locations.push(...state.cities)
    locations.push(...state.countries)
    if (locations.length > 0) filters.location = [...new Set(locations)]

    if (state.themes.length > 0) filters.themes = state.themes
    if (state.landmarks.length > 0) filters.landmarks = state.landmarks
    if (state.tags.length > 0) filters.tags = state.tags

    if (state.price) {
      if (state.price.min !== undefined) filters.minPrice = state.price.min
      if (state.price.max !== undefined) filters.maxPrice = state.price.max
    }

    if (state.duration) {
      if (state.duration.min !== undefined) filters.durationMin = state.duration.min
      if (state.duration.max !== undefined) filters.durationMax = state.duration.max
    }

    if (state.rating && state.rating.min !== undefined) {
      filters.minRating = state.rating.min
    }

    if (state.guests !== null && state.guests !== undefined) {
      filters.guests = state.guests
    }

    const urlParams = buildUrlParams(filters)
    return `/tours?${urlParams.toString()}`
  }, [state])

  const getActiveLocation = useCallback(() => {
    // Приоритет 1: одиночное location
    if (state.location) return state.location
    
    // Приоритет 2: первый город из массива
    if (state.cities.length > 0) return state.cities[0]
    
    // Приоритет 3: первая страна из массива
    if (state.countries.length > 0) return state.countries[0]
    
    return null
  }, [state])

  const value: NavigationContextValue = {
    state,
    setLocation,
    addCity,
    removeCity,
    toggleCity,
    addCountry,
    removeCountry,
    toggleCountry,
    addTheme,
    removeTheme,
    toggleTheme,
    addLandmark,
    removeLandmark,
    toggleLandmark,
    addTag,
    removeTag,
    toggleTag,
    setPrice,
    setDuration,
    setRating,
    setGuests,
    resetFilters,
    buildUrl,
    getActiveLocation,
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

export default NavigationContext

