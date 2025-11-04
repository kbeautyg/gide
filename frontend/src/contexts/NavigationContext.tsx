import React, { createContext, useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { NavigationState, NavigationContextValue, initialNavigationState } from '@/types/navigation'
import { parseUrlParams, FilterParams } from '@/lib/urlParams'
import { getCityName, getCountryName, getCategoryName, getCitySlug, getCountrySlug, getCategorySlug } from '@/lib/urlSlugs'
import { buildExperienceUrl, buildDestinationUrl, buildCategoryUrl, buildFilteredUrl } from '@/lib/routing'

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
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Состояние навигации
  const [state, setState] = useState<NavigationState>(initialNavigationState)
  
  // Флаг для предотвращения зацикливания при синхронизации
  const isUpdatingFromUrl = useRef(false)
  const isUpdatingToUrl = useRef(false)
  
  // Определяем текущую страницу из pathname
  const pathMatch = location.pathname.match(/^\/(experience|destinations)\/([^\/]+)(?:\/([^\/]+))?/)
  const pageType = pathMatch?.[1] // 'experience' или 'destinations'
  const firstSlug = pathMatch?.[2] // slug города или страны
  const secondSlug = pathMatch?.[3] // slug категории (если есть)

  // Чтение параметров из URL и pathname, применение к состоянию
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

      // Обработка локации из pathname (новый формат)
      if (pageType === 'destinations' && firstSlug) {
        // Страница страны: /destinations/{country-slug}
        const countryName = getCountryName(firstSlug)
        if (countryName) {
          newState.countries = [countryName]
          newState.location = countryName
        }
      } else if (pageType === 'experience' && firstSlug) {
        // Страница города: /experience/{city-slug} или /experience/{city-slug}/{category-slug}
        const cityName = getCityName(firstSlug)
        if (cityName) {
          newState.cities = [cityName]
          newState.location = cityName
          
          // Обработка категории из pathname
          if (secondSlug) {
            const categoryName = getCategoryName(secondSlug)
            if (categoryName) {
              newState.themes = [categoryName]
            }
          }
        }
      }

      // Обработка location из query параметров (старый формат для обратной совместимости)
      if (params.location && Array.isArray(params.location) && params.location.length > 0) {
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

        // Объединяем с данными из pathname (если нет конфликта)
        if (!newState.location) {
          newState.location = singleLocation
          newState.cities = cities
          newState.countries = countries
        }
      }

      // Обработка themes из query параметров (объединяем с themes из pathname)
      if (params.themes && params.themes.length > 0) {
        if (newState.themes.length > 0) {
          // Если уже есть themes из pathname, объединяем
          newState.themes = [...new Set([...newState.themes, ...params.themes])]
        } else {
          newState.themes = params.themes
        }
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
  }, [searchParams, location.pathname, pageType, firstSlug, secondSlug])

  // Обновление URL при изменении состояния
  const updateUrl = useCallback((newState: NavigationState) => {
    // Пропускаем если мы обновляем состояние из URL
    if (isUpdatingFromUrl.current) return

    isUpdatingToUrl.current = true

    try {
      // Определяем базовый URL из локации (новый формат)
      let baseUrl = '/tours' // По умолчанию старая страница
      
      // Приоритет: город > страна
      if (newState.cities.length > 0) {
        // Если есть город, используем новый формат: /experience/{city-slug}
        const citySlug = getCitySlug(newState.cities[0])
        if (newState.themes.length > 0) {
          // Если есть категория, добавляем её: /experience/{city-slug}/{category-slug}
          const categorySlug = getCategorySlug(newState.themes[0])
          baseUrl = `/experience/${citySlug}/${categorySlug}`
        } else {
          baseUrl = `/experience/${citySlug}`
        }
      } else if (newState.countries.length > 0) {
        // Если есть страна, используем новый формат: /destinations/{country-slug}
        const countrySlug = getCountrySlug(newState.countries[0])
        baseUrl = `/destinations/${countrySlug}`
      } else if (newState.location && KNOWN_CITIES.includes(newState.location)) {
        // Если location - это город
        const citySlug = getCitySlug(newState.location)
        baseUrl = `/experience/${citySlug}`
      } else if (newState.location) {
        // Если location - это страна
        const countrySlug = getCountrySlug(newState.location)
        baseUrl = `/destinations/${countrySlug}`
      }

      // Фильтры (цена, длительность, рейтинг, гости) остаются в query параметрах
      const filters: FilterParams = {}

      // Themes (только если их больше 1 или они не в pathname)
      // Если тема уже в pathname, не добавляем её в query
      const themesInPath = newState.themes.length > 0 && newState.cities.length > 0 ? [newState.themes[0]] : []
      const themesInQuery = newState.themes.filter(t => !themesInPath.includes(t))
      if (themesInQuery.length > 0) {
        filters.themes = themesInQuery
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

      // Строим финальный URL с query параметрами
      const finalUrl = buildFilteredUrl(baseUrl, filters)
      
      // Обновляем URL без перезагрузки страницы
      navigate(finalUrl, { replace: true })
      
      // Сбрасываем флаг сразу после navigate
      // Используем requestAnimationFrame для синхронизации с React
      requestAnimationFrame(() => {
        isUpdatingToUrl.current = false
      })
    } catch (error) {
      // В случае ошибки сбрасываем флаг
      isUpdatingToUrl.current = false
    }
  }, [navigate])

  // Методы для работы с локациями
  const setLocation = useCallback((location: string | null) => {
    setState(prev => {
      const newState = { ...prev, location, cities: [], countries: [] }
      // Если location - это город или страна, переходим на новый URL
      if (location) {
        if (KNOWN_CITIES.includes(location)) {
          // Это город
          const citySlug = getCitySlug(location)
          navigate(`/experience/${citySlug}`, { replace: true })
        } else {
          // Это страна
          const countrySlug = getCountrySlug(location)
          navigate(`/destinations/${countrySlug}`, { replace: true })
        }
      } else {
        updateUrl(newState)
      }
      return newState
    })
  }, [updateUrl, navigate])

  const addCity = useCallback((city: string) => {
    setState(prev => {
      // Не добавляем город если он уже есть
      if (prev.cities.includes(city)) return prev
      
      const newState = {
        ...prev,
        cities: [...prev.cities, city],
        // Не обновляем location при добавлении в массив городов
        // location остается для одиночного выбора
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
      const isIncluded = prev.cities.includes(city)
      
      if (isIncluded) {
        // Удаляем город
        const newState = {
          ...prev,
          cities: prev.cities.filter(c => c !== city),
          location: prev.location === city ? null : prev.location
        }
        updateUrl(newState)
        return newState
      } else {
        // Добавляем город - переходим на страницу города
        const citySlug = getCitySlug(city)
        const newState = {
          ...prev,
          cities: [city], // При выборе города оставляем только его
          location: city
        }
        navigate(`/experience/${citySlug}`, { replace: true })
        return newState
      }
    })
  }, [updateUrl, navigate])

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
      const isIncluded = prev.countries.includes(country)
      
      if (isIncluded) {
        // Удаляем страну
        const newState = {
          ...prev,
          countries: prev.countries.filter(c => c !== country),
          location: prev.location === country ? null : prev.location
        }
        updateUrl(newState)
        return newState
      } else {
        // Добавляем страну - переходим на страницу страны
        const countrySlug = getCountrySlug(country)
        const newState = {
          ...prev,
          countries: [country], // При выборе страны оставляем только её
          location: country,
          cities: [] // Очищаем города при выборе страны
        }
        navigate(`/destinations/${countrySlug}`, { replace: true })
        return newState
      }
    })
  }, [updateUrl, navigate])

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
      const isIncluded = prev.themes.includes(theme)
      
      if (isIncluded) {
        // Удаляем категорию
        const newState = {
          ...prev,
          themes: prev.themes.filter(t => t !== theme)
        }
        updateUrl(newState)
        return newState
      } else {
        // Добавляем категорию - если есть город, переходим на страницу категории
        if (prev.cities.length > 0 || prev.location) {
          const city = prev.cities[0] || prev.location
          if (city && KNOWN_CITIES.includes(city)) {
            const citySlug = getCitySlug(city)
            const categorySlug = getCategorySlug(theme)
            const newState = {
              ...prev,
              themes: [theme] // При выборе категории оставляем только её
            }
            navigate(`/experience/${citySlug}/${categorySlug}`, { replace: true })
            return newState
          }
        }
        
        // Если нет города, просто обновляем состояние
        const newState = {
          ...prev,
          themes: [...prev.themes, theme]
        }
        updateUrl(newState)
        return newState
      }
    })
  }, [updateUrl, navigate])

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
    // Используем replace: true чтобы очистить URL параметры
    // Если мы на странице города или страны, возвращаемся на главную
    if (pageType === 'experience' || pageType === 'destinations') {
      navigate('/', { replace: true })
    } else {
      navigate('/tours', { replace: true })
    }
  }, [navigate, pageType])

  const buildUrl = useCallback(() => {
    // Определяем базовый URL из локации (новый формат)
    let baseUrl = '/tours' // По умолчанию старая страница
    
    // Приоритет: город > страна
    if (state.cities.length > 0) {
      const citySlug = getCitySlug(state.cities[0])
      if (state.themes.length > 0) {
        const categorySlug = getCategorySlug(state.themes[0])
        baseUrl = `/experience/${citySlug}/${categorySlug}`
      } else {
        baseUrl = `/experience/${citySlug}`
      }
    } else if (state.countries.length > 0) {
      const countrySlug = getCountrySlug(state.countries[0])
      baseUrl = `/destinations/${countrySlug}`
    } else if (state.location && KNOWN_CITIES.includes(state.location)) {
      const citySlug = getCitySlug(state.location)
      baseUrl = `/experience/${citySlug}`
    } else if (state.location) {
      const countrySlug = getCountrySlug(state.location)
      baseUrl = `/destinations/${countrySlug}`
    }

    // Фильтры (цена, длительность, рейтинг, гости) остаются в query параметрах
    return buildFilteredUrl(baseUrl, {
      minPrice: state.price?.min,
      maxPrice: state.price?.max,
      durationMin: state.duration?.min,
      durationMax: state.duration?.max,
      minRating: state.rating?.min,
      guests: state.guests ?? undefined
    })
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
  
  // Методы для работы с новыми URL паттернами (slug-based)
  const getCitySlugMethod = useCallback(() => {
    const city = getActiveLocation()
    if (city && KNOWN_CITIES.includes(city)) {
      return getCitySlug(city)
    }
    return null
  }, [getActiveLocation])
  
  const getCountrySlugMethod = useCallback(() => {
    if (state.countries.length > 0) {
      return getCountrySlug(state.countries[0])
    }
    if (state.location && !KNOWN_CITIES.includes(state.location)) {
      return getCountrySlug(state.location)
    }
    return null
  }, [state])
  
  const buildExperienceUrlMethod = useCallback((cityName: string) => {
    return buildExperienceUrl(cityName)
  }, [])
  
  const buildDestinationUrlMethod = useCallback((countryName: string) => {
    return buildDestinationUrl(countryName)
  }, [])
  
  const buildCategoryUrlMethod = useCallback((cityName: string, categoryName: string) => {
    return buildCategoryUrl(cityName, categoryName)
  }, [])

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
    getCitySlug: getCitySlugMethod,
    getCountrySlug: getCountrySlugMethod,
    buildExperienceUrl: buildExperienceUrlMethod,
    buildDestinationUrl: buildDestinationUrlMethod,
    buildCategoryUrl: buildCategoryUrlMethod,
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

export default NavigationContext

