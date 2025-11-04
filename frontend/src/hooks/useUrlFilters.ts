import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { parseUrlParams, buildUrlParams, FilterParams } from '@/lib/urlParams'

/**
 * Хук для синхронизации URL параметров с состоянием фильтров
 * Обеспечивает двустороннюю синхронизацию: URL ↔ State
 */
export function useUrlFilters() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Состояние фильтров
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([])
  const [selectedDurations, setSelectedDurations] = useState<string[]>([])
  const [selectedRatings, setSelectedRatings] = useState<string[]>([])
  const [landmarksParam, setLandmarksParam] = useState<string[]>([])
  const [tagsParam, setTagsParam] = useState<string[]>([])
  const [guestsParam, setGuestsParam] = useState<number | undefined>(undefined)

  // Флаг для предотвращения зацикливания при обновлении URL
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false)

  // Чтение параметров из URL при загрузке
  useEffect(() => {
    if (isUpdatingUrl) return

    const params = parseUrlParams(searchParams)

    // Location → selectedCities или selectedCountries
    if (params.location && params.location.length > 0) {
      // Определяем, это город или страна
      // Простая эвристика: если это известный город, добавляем в selectedCities
      // Иначе считаем страной
      const knownCities = [
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

      const cities: string[] = []
      const countries: string[] = []

      params.location.forEach(loc => {
        if (knownCities.includes(loc)) {
          cities.push(loc)
        } else {
          countries.push(loc)
        }
      })

      if (cities.length > 0) {
        setSelectedCities(cities)
      }
      if (countries.length > 0) {
        setSelectedCountries(countries)
      }
    }

    // Themes → selectedThemes
    if (params.themes && params.themes.length > 0) {
      setSelectedThemes(params.themes)
    }

    // Landmarks → landmarksParam
    if (params.landmarks && params.landmarks.length > 0) {
      setLandmarksParam(params.landmarks)
    }

    // Tags → tagsParam
    if (params.tags && params.tags.length > 0) {
      setTagsParam(params.tags)
    }

    // Price → selectedPriceRanges
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      const ranges: string[] = []
      if (params.minPrice === undefined && params.maxPrice === 5000) {
        ranges.push('До 5000₽')
      } else if (params.minPrice === 5000 && params.maxPrice === 10000) {
        ranges.push('5000-10000₽')
      } else if (params.minPrice === 10000) {
        ranges.push('10000+₽')
      }
      setSelectedPriceRanges(ranges)
    }

    // Duration → selectedDurations
    if (params.durationMin !== undefined || params.durationMax !== undefined) {
      const ranges: string[] = []
      if (params.durationMin === 1 && params.durationMax === 3) {
        ranges.push('1-3 часа')
      } else if (params.durationMin === 4 && params.durationMax === 6) {
        ranges.push('4-6 часов')
      } else if (params.durationMin === 7) {
        ranges.push('Полный день (7+ч)')
      }
      setSelectedDurations(ranges)
    }

    // Rating → selectedRatings
    if (params.minRating !== undefined) {
      const ratings: string[] = []
      if (params.minRating === 4.5) {
        ratings.push('4.5+ звёзд')
      } else if (params.minRating === 4.7) {
        ratings.push('4.7+')
      } else if (params.minRating === 4.9) {
        ratings.push('4.9+ (топ)')
      }
      setSelectedRatings(ratings)
    }

    // Guests → guestsParam
    if (params.guests !== undefined) {
      setGuestsParam(params.guests)
    }
  }, [searchParams, isUpdatingUrl])

  // Обновление URL при изменении фильтров
  const updateUrl = useCallback(() => {
    setIsUpdatingUrl(true)

    const filters: FilterParams = {}

    // Location из selectedCities или selectedCountries
    const locations: string[] = []
    if (selectedCities.length > 0) {
      locations.push(...selectedCities)
    }
    if (selectedCountries.length > 0) {
      locations.push(...selectedCountries)
    }
    if (locations.length > 0) {
      filters.location = locations
    }

    // Themes из selectedThemes
    if (selectedThemes.length > 0) {
      filters.themes = selectedThemes
    }

    // Landmarks
    if (landmarksParam.length > 0) {
      filters.landmarks = landmarksParam
    }

    // Tags
    if (tagsParam.length > 0) {
      filters.tags = tagsParam
    }

    // Price из selectedPriceRanges
    if (selectedPriceRanges.length > 0) {
      const firstRange = selectedPriceRanges[0]
      if (firstRange === 'До 5000₽') {
        filters.maxPrice = 5000
      } else if (firstRange === '5000-10000₽') {
        filters.minPrice = 5000
        filters.maxPrice = 10000
      } else if (firstRange === '10000+₽') {
        filters.minPrice = 10000
      }
    }

    // Duration из selectedDurations
    if (selectedDurations.length > 0) {
      const firstDuration = selectedDurations[0]
      if (firstDuration === '1-3 часа') {
        filters.durationMin = 1
        filters.durationMax = 3
      } else if (firstDuration === '4-6 часов') {
        filters.durationMin = 4
        filters.durationMax = 6
      } else if (firstDuration === 'Полный день (7+ч)') {
        filters.durationMin = 7
      }
    }

    // Rating из selectedRatings
    if (selectedRatings.length > 0) {
      const firstRating = selectedRatings[0]
      if (firstRating === '4.5+ звёзд') {
        filters.minRating = 4.5
      } else if (firstRating === '4.7+') {
        filters.minRating = 4.7
      } else if (firstRating === '4.9+ (топ)') {
        filters.minRating = 4.9
      }
    }

    // Guests
    if (guestsParam !== undefined) {
      filters.guests = guestsParam
    }

    const urlParams = buildUrlParams(filters)
    const newUrl = `/tours?${urlParams.toString()}`
    
    navigate(newUrl, { replace: true })
    
    // Сбрасываем флаг после небольшой задержки
    setTimeout(() => {
      setIsUpdatingUrl(false)
    }, 100)
  }, [
    selectedCities,
    selectedCountries,
    selectedThemes,
    landmarksParam,
    tagsParam,
    selectedPriceRanges,
    selectedDurations,
    selectedRatings,
    guestsParam,
    navigate
  ])

  // Обновление URL при изменении фильтров
  useEffect(() => {
    if (!isUpdatingUrl) {
      updateUrl()
    }
  }, [
    selectedCities,
    selectedCountries,
    selectedThemes,
    landmarksParam,
    tagsParam,
    selectedPriceRanges,
    selectedDurations,
    selectedRatings,
    guestsParam,
    isUpdatingUrl,
    updateUrl
  ])

  // Получение locationParam для совместимости со старым кодом
  const locationParam = searchParams.get('location') || undefined

  // Функция для сброса всех фильтров
  const resetFilters = useCallback(() => {
    setSelectedThemes([])
    setSelectedCountries([])
    setSelectedCities([])
    setSelectedPriceRanges([])
    setSelectedDurations([])
    setSelectedRatings([])
    setLandmarksParam([])
    setTagsParam([])
    setGuestsParam(undefined)
    navigate('/tours', { replace: true })
  }, [navigate])

  return {
    // Состояние фильтров
    selectedThemes,
    setSelectedThemes,
    selectedCountries,
    setSelectedCountries,
    selectedCities,
    setSelectedCities,
    selectedPriceRanges,
    setSelectedPriceRanges,
    selectedDurations,
    setSelectedDurations,
    selectedRatings,
    setSelectedRatings,
    landmarksParam,
    setLandmarksParam,
    tagsParam,
    setTagsParam,
    guestsParam,
    setGuestsParam,
    // Параметры из URL (для совместимости)
    locationParam,
    // Функции
    resetFilters,
    updateUrl
  }
}





