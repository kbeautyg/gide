import { useState, useRef, useEffect, useMemo } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { X, SlidersHorizontal, ArrowLeft } from 'lucide-react'
import { toursApi, api } from '@/lib/api'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { CategoryChips } from '@/components/CategoryChips'
import { FilterPanel } from '@/components/FilterPanel'
import { TourCard } from '@/components/TourCard'
import { CityHero } from '@/components/CityHero'
import { CountryCard } from '@/components/CountryCard'
import { CityCard } from '@/components/CityCard'
import { Pagination } from '@/components/Pagination'
import { useNavigation } from '@/hooks/useNavigation'
import { COUNTRY_DATA, CITY_IMAGES } from '@/constants/countryData'
import { isCountryLocation } from '@/lib/navigationUtils'
import { DateFilterButton } from '@/components/DateFilterButton'
import { FormatFilterButton } from '@/components/FormatFilterButton'
import { TransportationFilterButton } from '@/components/TransportationFilterButton'
import { PriceFilterButton } from '@/components/PriceFilterButton'
import { QuickFilterButton } from '@/components/QuickFilterButton'
// Удален импорт карты и иконок переключения

export default function ToursPage() {
  const navigation = useNavigation()
  const { state } = navigation
  
  // Локальное состояние
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('popular')
  const [currentPage, setCurrentPage] = useState(1)
  // Удален state viewMode

  // Refs для автоцентрирования фильтров
  const filtersContainerRef1 = useRef<HTMLDivElement>(null)
  const filtersContainerRef2 = useRef<HTMLDivElement>(null)
  const filtersContainerRef3 = useRef<HTMLDivElement>(null)

  // Скролл наверх при монтировании компонента
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Подсчет активных фильтров (вычисляем раньше для использования в useEffect)
  const activeFiltersCount = 
    state.themes.length +
    state.landmarks.length +
    state.tags.length +
    (state.price ? 1 : 0) +
    (state.duration ? 1 : 0) +
    (state.rating ? 1 : 0) +
    (state.guests !== null ? 1 : 0) +
    (state.dateRange ? 1 : 0) +
    state.format.length +
    state.transportation.length

  // Автоцентрирование активных фильтров (только горизонтальный скролл в контейнере)
  useEffect(() => {
    const containers = [filtersContainerRef1.current, filtersContainerRef2.current, filtersContainerRef3.current]
    
    containers.forEach(container => {
      if (!container) return
      
      // Находим активную кнопку внутри контейнера
      const activeButton = container.querySelector('[data-filter-active="true"]') as HTMLElement
      
      if (activeButton) {
        // Центрируем активную кнопку только горизонтально в пределах контейнера
        const containerRect = container.getBoundingClientRect()
        const buttonRect = activeButton.getBoundingClientRect()
        
        const scrollLeft = activeButton.offsetLeft - container.offsetLeft - (containerRect.width / 2) + (buttonRect.width / 2)
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        })
      }
    })
  }, [activeFiltersCount, state.dateRange, state.format, state.transportation, state.price])

  // Получаем активную локацию
  const activeLocation = navigation.getActiveLocation()
  const activeRubric = state.themes.length > 0 ? state.themes[0] : null

  // Определяем тип страницы
  // Если есть фильтры (themes, landmarks, tags) - показываем туры с фильтрами
  const hasFilters = state.themes.length > 0 || state.landmarks.length > 0 || state.tags.length > 0
  
  const pageType = !activeLocation 
    ? (hasFilters ? 'tours' : 'countries')  // Нет локации -> если есть фильтры, показываем туры, иначе страны
    : isCountryLocation(activeLocation)
    ? (hasFilters ? 'tours' : 'cities')     // Локация = страна -> если есть фильтры, показываем туры, иначе города
    : 'tours'      // Локация = город -> показываем туры

  // Загрузка данных в зависимости от типа страницы
  
  // Для стран: получаем статистику по странам
  const { data: countriesData } = useQuery({
    queryKey: ['countries-stats'],
    queryFn: async () => {
      const response = await api.get('/destinations/countries-stats')
      return response.data
    },
    enabled: pageType === 'countries',
    staleTime: 1000 * 60 * 10, // 10 минут
    gcTime: 1000 * 60 * 30, // 30 минут в кэше
  })

  // Для городов: получаем города выбранной страны
  const { data: citiesData } = useQuery({
    queryKey: ['cities-by-country', activeLocation],
    queryFn: async () => {
      const response = await api.get(`/destinations/cities-by-country?country=${encodeURIComponent(activeLocation!)}`)
      return response.data
    },
    staleTime: 1000 * 60 * 10, // 10 минут
    gcTime: 1000 * 60 * 30, // 30 минут в кэше
    enabled: pageType === 'cities' && !!activeLocation,
  })

  // Загружаем рубрики с учетом текущих фильтров для динамических счетчиков
  const { data: navigationData } = useQuery({
    queryKey: [
      'dynamic-navigation',
      activeLocation,
      state.themes,
      state.landmarks,
      state.tags,
      state.price,
      state.duration,
      state.rating,
      state.guests,
      state.dateRange,
      state.format,
      state.transportation
    ],
    queryFn: async () => {
      const params: any = {}
      
      // Добавляем location если есть
      if (activeLocation) {
        params.location = activeLocation
      }
      
      // Не передаем themes и landmarks, чтобы показать количество для каждой рубрики отдельно
      
      if (state.tags.length > 0) {
        params.tags = state.tags.join(',')
      }
      
      if (state.price) {
        if (state.price.min !== undefined) params.min_price = state.price.min
        if (state.price.max !== undefined) params.max_price = state.price.max
      }
      
      if (state.duration) {
        if (state.duration.min !== undefined) params.duration_min = state.duration.min
        if (state.duration.max !== undefined) params.duration_max = state.duration.max
      }
      
      if (state.rating && state.rating.min !== undefined) {
        params.min_rating = state.rating.min
      }
      
      if (state.guests !== null && state.guests !== undefined) {
        params.guests = state.guests
      }

      if (state.dateRange) {
        if (state.dateRange.from) {
          params.date_start = state.dateRange.from.toISOString().split('T')[0]
        }
        if (state.dateRange.to) {
          params.date_end = state.dateRange.to.toISOString().split('T')[0]
        }
      }

      if (state.format.length > 0) {
        params.format = state.format.join(',')
      }

      if (state.transportation.length > 0) {
        params.transportation = state.transportation.join(',')
      }
      
      const response = await api.get('/tours/dynamic-navigation', { params })
      return response.data.data
    },
    enabled: true, // Всегда загружаем рубрики
  })

  // Объединяем themes и landmarks в одну секцию "Рубрики"
  const allRubrics = [
    ...(navigationData?.themes || []).map((item: any) => ({ name: item.name, count: item.count, type: 'theme' })),
    ...(navigationData?.landmarks || []).map((item: any) => ({ name: item.name, count: item.count, type: 'landmark' }))
  ]
  
  // Сортируем по количеству туров
  allRubrics.sort((a, b) => b.count - a.count)
  
  const themeCategories = allRubrics

  // Загрузка туров (только для типа 'tours')
  const { data: toursData, isLoading: isToursLoading, isFetching: isToursFetching } = useQuery({
    queryKey: [
      'tours',
      state.location,
      state.cities,
      state.countries,
      state.themes,
      state.landmarks,
      state.tags,
      state.price,
      state.duration,
      state.rating,
      state.guests,
      state.dateRange,
      state.format,
      state.transportation,
      currentPage
    ],
    staleTime: 1000 * 60 * 5, // 5 минут - данные считаются свежими
    gcTime: 1000 * 60 * 15, // 15 минут в кэше
    queryFn: async () => {
      const params: any = {
        page: currentPage,
        page_size: 50,
      }

      const locations: string[] = []
      if (state.cities.length > 0) {
        locations.push(...state.cities)
      } else if (state.location) {
        locations.push(state.location)
      } else if (state.countries.length > 0) {
        locations.push(...state.countries)
      }
      
      if (locations.length > 0) {
        params.location = [...new Set(locations)].join(',')
      }

      if (state.themes.length > 0) {
        params.themes = state.themes.join(',')
      }

      if (state.landmarks.length > 0) {
        params.landmarks = state.landmarks.join(',')
      }

      if (state.tags.length > 0) {
        params.tags = state.tags.join(',')
      }

      if (state.price) {
        if (state.price.min !== undefined) params.min_price = state.price.min
        if (state.price.max !== undefined) params.max_price = state.price.max
      }

      if (state.duration) {
        if (state.duration.min !== undefined) params.duration_min = state.duration.min
        if (state.duration.max !== undefined) params.duration_max = state.duration.max
      }

      if (state.rating && state.rating.min !== undefined) {
        params.min_rating = state.rating.min
      }

      if (state.guests !== null && state.guests !== undefined) {
        params.guests = state.guests
      }

      if (state.dateRange) {
        if (state.dateRange.from) {
          params.date_start = state.dateRange.from.toISOString().split('T')[0]
        }
        if (state.dateRange.to) {
          params.date_end = state.dateRange.to.toISOString().split('T')[0]
        }
      }

      if (state.format.length > 0) {
        params.format = state.format.join(',')
      }

      if (state.transportation.length > 0) {
        params.transportation = state.transportation.join(',')
      }

      const response = await toursApi.getList(params)
      return response.data
    },
    enabled: pageType === 'tours',
    placeholderData: keepPreviousData,
  })

  const tours = toursData?.tours || []
  
  // Сортировка туров
  const sortedTours = [...tours].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price
      case 'price_desc':
        return b.price - a.price
      case 'rating':
        return b.rating - a.rating
      case 'new':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'popular':
      default:
        const scoreA = (a.total_bookings || 0) * 2 + (a.views_count || 0) * 0.1 + (a.rating || 0) * 10
        const scoreB = (b.total_bookings || 0) * 2 + (b.views_count || 0) * 0.1 + (b.rating || 0) * 10
        return scoreB - scoreA
    }
  })

  // SEO данные для страницы туров
  const seoData = useMemo(() => {
    const location = state.location || ''
    const themes = state.themes.join(', ')
    const totalTours = toursData?.total || 0
    
    // Склонение слова "тур"
    const getTourWord = (n: number) => {
      const lastTwo = n % 100
      const lastOne = n % 10
      if (lastTwo >= 11 && lastTwo <= 19) return 'туров'
      if (lastOne === 1) return 'тур'
      if (lastOne >= 2 && lastOne <= 4) return 'тура'
      return 'туров'
    }
    
    // Canonical URL
    const canonicalUrl = location 
      ? `https://inturex.pro/tours?location=${encodeURIComponent(location)}`
      : 'https://inturex.pro/tours'
    
    if (location) {
      return {
        title: `Экскурсии в ${location} 2025 — ${totalTours} ${getTourWord(totalTours)} с русским гидом | Inturex`,
        description: `🌏 Лучшие экскурсии в ${location} с русскоговорящими гидами. ${themes ? `Темы: ${themes}. ` : ''}${totalTours} авторских туров, индивидуальные экскурсии. Бронируйте онлайн!`,
        keywords: `экскурсии ${location}, туры ${location}, русский гид ${location}, что посмотреть ${location}, достопримечательности ${location}`,
        canonicalUrl
      }
    }
    
    return {
      title: 'Все экскурсии по Азии 2025 — Таиланд, Вьетнам, Китай, Япония | Inturex',
      description: '🌏 Каталог авторских экскурсий по Азии. Таиланд, Вьетнам, Китай, Япония, Индонезия, Индия. Русскоговорящие гиды. Бронируйте онлайн!',
      keywords: 'экскурсии Азия, туры Таиланд, экскурсии Вьетнам, туры Китай, экскурсии Япония, русский гид Азия',
      canonicalUrl: 'https://inturex.pro/tours'
    }
  }, [state.location, state.themes, toursData?.total])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background Fetching Indicator */}
      {isToursFetching && !isToursLoading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-airbnb-rausch z-[100] animate-[pulse_1s_ease-in-out_infinite]" />
      )}
      
      {/* SEO для страницы туров */}
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        <link rel="canonical" href={seoData.canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:site_name" content="Inturex — Экскурсии по Азии" />
        <meta property="og:image" content="https://inturex.pro/og-image.jpg" />
        <meta property="og:url" content={seoData.canonicalUrl} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content="https://inturex.pro/og-image.jpg" />
        
        {/* JSON-LD BreadcrumbList */}
        {activeLocation && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Главная",
                  "item": "https://inturex.pro/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Экскурсии",
                  "item": "https://inturex.pro/tours"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": activeLocation
                }
              ]
            })}
          </script>
        )}
        
        {/* JSON-LD ItemList for Tours */}
        {toursData?.tours && toursData.tours.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": activeLocation ? `Экскурсии в ${activeLocation}` : "Экскурсии по Азии",
              "description": seoData.description,
              "numberOfItems": toursData.tours.length,
              "itemListElement": toursData.tours.slice(0, 10).map((tour: any, index: number) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "Product",
                  "name": tour.title,
                  "description": tour.short_description || tour.description?.substring(0, 160),
                  "url": `https://inturex.pro/tours/${tour.id}`,
                  "image": tour.photos?.[0],
                  "offers": {
                    "@type": "Offer",
                    "price": tour.price,
                    "priceCurrency": "RUB",
                    "availability": "https://schema.org/InStock"
                  }
                }
              }))
            })}
          </script>
        )}
      </Helmet>

      <PublicHeader />

      <AnimatePresence mode="wait">
        {/* ВАРИАНТ 1: СТРАНЫ (нет location) */}
        {pageType === 'countries' && (
          <motion.div
            key="countries-page"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gray-50">
              <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Выберите страну
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Используйте фильтры
                </p>
              </div>
            </div>

          {/* Фильтры и рубрики для уровня стран */}
          <div className="bg-gray-50">
            <div className="container mx-auto px-4 py-4">
              {/* Быстрые фильтры */}
              <div 
                ref={filtersContainerRef1}
                className="flex items-center gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth snap-x snap-mandatory justify-start"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                <div style={{ scrollSnapAlign: 'center' }}>
                  <DateFilterButton />
                </div>
                <div style={{ scrollSnapAlign: 'center' }}>
                  <FormatFilterButton />
                </div>
                <div style={{ scrollSnapAlign: 'center' }}>
                  <TransportationFilterButton />
                </div>
                <div style={{ scrollSnapAlign: 'center' }}>
                  <PriceFilterButton />
                </div>
                <div style={{ scrollSnapAlign: 'center' }}>
                  <QuickFilterButton
                    label="Фильтры"
                    icon={<SlidersHorizontal size={16} />}
                    isActive={activeFiltersCount > 0}
                    count={activeFiltersCount > 0 ? activeFiltersCount : undefined}
                    onClick={() => setShowFilters(true)}
                  />
                </div>
              </div>
              
              {/* Рубрики (объединяем themes и landmarks) */}
              {themeCategories.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Рубрики</h3>
                  <CategoryChips
                    categories={themeCategories}
                    selected={[...state.themes, ...state.landmarks]}
                    onSelect={(item) => {
                      // Проверяем, является ли это theme или landmark
                      const isTheme = themeCategories.find((t: any) => t.name === item && t.type === 'theme')
                      if (isTheme) {
                        navigation.toggleTheme(item)
                      } else {
                        navigation.toggleLandmark(item)
                      }
                    }}
                  />
                </>
              )}
        </div>
      </div>

          {/* Активные фильтры для уровня стран */}
          {activeFiltersCount > 0 && (
            <div className="bg-gray-50">
              <div className="container mx-auto px-4 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-700">Активные фильтры:</span>
                  
                  {state.themes.map((theme) => (
                    <motion.div
                      key={theme}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {theme}
                      <button onClick={() => navigation.removeTheme(theme)} className="hover:opacity-80">
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}

                  {state.landmarks.map((landmark) => (
                    <motion.div
                      key={landmark}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {landmark}
                      <button onClick={() => navigation.removeLandmark(landmark)} className="hover:opacity-80">
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}

                  {state.tags.map((tag) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {tag}
                      <button onClick={() => navigation.removeTag(tag)} className="hover:opacity-80">
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}

                  {state.price && (state.price.min !== undefined || state.price.max !== undefined) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {state.price.min !== undefined && state.price.max !== undefined
                        ? `${state.price.min}-${state.price.max}₽`
                        : state.price.min !== undefined
                        ? `от ${state.price.min}₽`
                        : state.price.max !== undefined
                        ? `до ${state.price.max}₽`
                        : ''}
                      <button onClick={() => navigation.setPrice(null)} className="hover:opacity-80">
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}

                  {state.duration && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {state.duration.min !== undefined && state.duration.max !== undefined
                        ? `${state.duration.min}-${state.duration.max} ч`
                        : state.duration.min !== undefined
                        ? `от ${state.duration.min} ч`
                        : `до ${state.duration.max} ч`}
                      <button onClick={() => navigation.setDuration(null)} className="hover:opacity-80">
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}

                  {state.rating && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      ⭐ {state.rating.min}+
                      <button onClick={() => navigation.setRating(null)} className="hover:opacity-80">
                        <X size={16} />
              </button>
                    </motion.div>
                  )}

                  {state.guests !== null && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      👥 {state.guests} {state.guests === 1 ? 'гость' : 'гостей'}
                      <button onClick={() => navigation.setGuests(null)} className="hover:opacity-80">
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}

                  {state.dateRange && (state.dateRange.from || state.dateRange.to) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      📅 {state.dateRange.from && state.dateRange.to
                        ? `${state.dateRange.from.toLocaleDateString('ru-RU')} - ${state.dateRange.to.toLocaleDateString('ru-RU')}`
                        : state.dateRange.from
                        ? state.dateRange.from.toLocaleDateString('ru-RU')
                        : state.dateRange.to
                        ? state.dateRange.to.toLocaleDateString('ru-RU')
                        : ''}
                      <button onClick={() => navigation.setDateRange(null)} className="hover:opacity-80">
                        <X size={16} />
              </button>
                    </motion.div>
                  )}

                  {state.format.map((format) => (
                    <motion.div
                      key={format}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {format}
                      <button onClick={() => navigation.toggleFormat(format)} className="hover:opacity-80">
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}

                  {state.transportation.map((transportation) => (
                    <motion.div
                      key={transportation}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {transportation}
                      <button onClick={() => navigation.toggleTransportation(transportation)} className="hover:opacity-80">
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
                  </div>
                </div>
          )}

          {/* Если выбраны фильтры - показываем туры вместо стран */}
          {hasFilters ? (
            <section className="py-12 bg-gray-50">
              <div className="container mx-auto px-4">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Экскурсии по фильтрам
                  </h2>
                  <p className="text-gray-600">
                    {toursData?.total || 0} {(toursData?.total || 0) === 1 ? 'экскурсия' : (toursData?.total || 0) < 5 ? 'экскурсии' : 'экскурсий'} найдено
                  </p>
          </div>

                {sortedTours.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-gray-600 text-lg">Экскурсии не найдены</p>
                    <p className="text-gray-500 mt-2">Попробуйте изменить фильтры</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {sortedTours.map((tour) => (
                      <TourCard key={tour.id} tour={tour} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="py-16 bg-gray-50">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {/* Динамически берём страны из API, а не из хардкода */}
                  {(countriesData?.countries || [])
                    .filter((countryData: any) => countryData.tours_count > 0)
                    .map((countryData: any, index: number) => {
                      // Используем данные из API (image, description, highlights уже приходят с бэкенда)
                      // Если нет - fallback на COUNTRY_DATA
                      const fallbackData = COUNTRY_DATA[countryData.country as keyof typeof COUNTRY_DATA]
                      
                    return (
                      <CountryCard
                          key={countryData.country}
                          name={countryData.country}
                          toursCount={countryData.tours_count}
                          image={countryData.image || fallbackData?.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e24d5e?w=800&h=600&fit=crop'}
                          description={countryData.description || fallbackData?.description || 'Откройте для себя уникальные экскурсии'}
                          highlights={countryData.highlights || fallbackData?.highlights || []}
                        index={index}
                      />
                )
              })}
              </div>
              </div>
          </section>
          )}

          {/* Панель фильтров для уровня стран */}
          <FilterPanel
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            onApply={() => setShowFilters(false)}
          />
          </motion.div>
        )}

        {/* ВАРИАНТ 2: ГОРОДА СТРАНЫ (location = страна) */}
        {pageType === 'cities' && activeLocation && (
          <motion.div
            key="cities-page"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
          <CityHero 
            location={activeLocation}
            activeRubric={activeRubric || undefined}
            toursCount={citiesData?.total_tours || 0}
          />

          {/* Кнопка "Назад к странам" */}
          <div className="bg-gray-50">
            <div className="container mx-auto px-4 py-4">
                <button
                onClick={() => navigation.setLocation(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Назад к выбору стран</span>
                </button>
              </div>
                          </div>

          {/* Фильтры и рубрики для уровня городов */}
          <div className="bg-gray-50">
            <div className="container mx-auto px-4 py-4">
              {/* Быстрые фильтры */}
              <div 
                ref={filtersContainerRef2}
                className="flex items-center gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth snap-x snap-mandatory justify-start"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                <div style={{ scrollSnapAlign: 'center' }}>
                  <DateFilterButton />
                </div>
                <div style={{ scrollSnapAlign: 'center' }}>
                  <FormatFilterButton />
                </div>
                <div style={{ scrollSnapAlign: 'center' }}>
                  <TransportationFilterButton />
                </div>
                <div style={{ scrollSnapAlign: 'center' }}>
                  <PriceFilterButton />
                </div>
                <div style={{ scrollSnapAlign: 'center' }}>
                  <QuickFilterButton
                    label="Фильтры"
                    icon={<SlidersHorizontal size={16} />}
                    isActive={activeFiltersCount > 0}
                    count={activeFiltersCount > 0 ? activeFiltersCount : undefined}
                    onClick={() => setShowFilters(true)}
                  />
                </div>
              </div>

              {/* Рубрики (объединяем themes и landmarks) */}
              {themeCategories.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Рубрики</h3>
                  <CategoryChips
                    categories={themeCategories}
                    selected={[...state.themes, ...state.landmarks]}
                    onSelect={(item) => {
                      // Проверяем, является ли это theme или landmark
                      const isTheme = themeCategories.find((t: any) => t.name === item && t.type === 'theme')
                      if (isTheme) {
                        navigation.toggleTheme(item)
                      } else {
                        navigation.toggleLandmark(item)
                      }
                    }}
                  />
                </>
              )}
        </div>
      </div>

          {/* Активные фильтры для уровня городов */}
      {activeFiltersCount > 0 && (
            <div className="bg-gray-50">
              <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-700">Активные фильтры:</span>
                  
                  {state.themes.map((theme) => (
                    <motion.div
                      key={theme}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {theme}
                      <button onClick={() => navigation.removeTheme(theme)} className="hover:opacity-80">
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}

              {state.landmarks.map((landmark) => (
                <motion.div
                  key={landmark}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {landmark}
                  <button onClick={() => navigation.removeLandmark(landmark)} className="hover:opacity-80">
                    <X size={16} />
                  </button>
                </motion.div>
              ))}

              {state.tags.map((tag) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {tag}
                  <button onClick={() => navigation.removeTag(tag)} className="hover:opacity-80">
                    <X size={16} />
                  </button>
                </motion.div>
              ))}

                  {state.price && (state.price.min !== undefined || state.price.max !== undefined) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {state.price.min !== undefined && state.price.max !== undefined
                        ? `${state.price.min}-${state.price.max}₽`
                        : state.price.min !== undefined
                        ? `от ${state.price.min}₽`
                        : state.price.max !== undefined
                        ? `до ${state.price.max}₽`
                        : ''}
                      <button onClick={() => navigation.setPrice(null)} className="hover:opacity-80">
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}

                  {state.duration && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {state.duration.min !== undefined && state.duration.max !== undefined
                        ? `${state.duration.min}-${state.duration.max} ч`
                        : state.duration.min !== undefined
                        ? `от ${state.duration.min} ч`
                        : `до ${state.duration.max} ч`}
                      <button onClick={() => navigation.setDuration(null)} className="hover:opacity-80">
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}

                  {state.rating && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      ⭐ {state.rating.min}+
                      <button onClick={() => navigation.setRating(null)} className="hover:opacity-80">
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}

                  {state.guests !== null && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      👥 {state.guests} {state.guests === 1 ? 'гость' : 'гостей'}
                      <button onClick={() => navigation.setGuests(null)} className="hover:opacity-80">
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}

                  {state.dateRange && (state.dateRange.from || state.dateRange.to) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      📅 {state.dateRange.from && state.dateRange.to
                        ? `${state.dateRange.from.toLocaleDateString('ru-RU')} - ${state.dateRange.to.toLocaleDateString('ru-RU')}`
                        : state.dateRange.from
                        ? state.dateRange.from.toLocaleDateString('ru-RU')
                        : state.dateRange.to
                        ? state.dateRange.to.toLocaleDateString('ru-RU')
                        : ''}
                      <button onClick={() => navigation.setDateRange(null)} className="hover:opacity-80">
                        <X size={16} />
              </button>
                    </motion.div>
                  )}

                  {state.format.map((format) => (
                    <motion.div
                      key={format}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {format}
                      <button onClick={() => navigation.toggleFormat(format)} className="hover:opacity-80">
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}

                  {state.transportation.map((transportation) => (
                    <motion.div
                      key={transportation}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {transportation}
                      <button onClick={() => navigation.toggleTransportation(transportation)} className="hover:opacity-80">
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Если выбраны фильтры - показываем туры вместо городов */}
          {hasFilters ? (
            <section className="py-12 bg-gray-50">
              <div className="container mx-auto px-4">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Экскурсии в {activeLocation}
                  </h2>
                  <p className="text-gray-600">
                    {toursData?.total || 0} {(toursData?.total || 0) === 1 ? 'экскурсия' : (toursData?.total || 0) < 5 ? 'экскурсии' : 'экскурсий'} найдено
                  </p>
                </div>

                {sortedTours.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-gray-600 text-lg">Экскурсии не найдены</p>
                    <p className="text-gray-500 mt-2">Попробуйте изменить фильтры</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {sortedTours.map((tour) => (
                      <TourCard key={tour.id} tour={tour} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              {/* Статистика */}
              {citiesData && (
                <div className="mb-12 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    Города {activeLocation}
                  </h2>
                  <p className="text-lg text-gray-600">
                    {citiesData.total} {citiesData.total === 1 ? 'город' : citiesData.total < 5 ? 'города' : 'городов'} • {citiesData.total_tours} {citiesData.total_tours === 1 ? 'экскурсия' : citiesData.total_tours < 5 ? 'экскурсии' : 'экскурсий'}
                  </p>
                </div>
              )}
              
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {(citiesData?.cities || []).map((cityData: any, index: number) => {
                    const isPopular = index < 3 // Топ-3 города популярны
                    
                    return (
                      <CityCard
                        key={cityData.city}
                        name={cityData.city}
                        country={activeLocation}
                        toursCount={cityData.tours_count}
                        image={CITY_IMAGES[cityData.city] || 'https://images.unsplash.com/photo-1488646953014-85cb44e24d5e?w=500&h=700&fit=crop'}
                        index={index}
                        isPopular={isPopular}
                      />
                    )
                  })}
                </div>
            </div>
          </section>
          )}

          {/* Панель фильтров для уровня городов */}
          <FilterPanel
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            onApply={() => setShowFilters(false)}
          />
          </motion.div>
        )}

        {/* ВАРИАНТ 3: ТУРЫ ГОРОДА (location = город) */}
        {pageType === 'tours' && (
          <motion.div
            key="tours-page"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <CityHero 
              location={activeLocation || undefined} 
              activeRubric={activeRubric || undefined} 
              toursCount={toursData?.total || 0}
              hasFilters={hasFilters}
            />

          {/* Кнопка фильтров */}
          <div className="bg-gray-50">
            <div className="container mx-auto px-4 py-4">
              {/* Быстрые фильтры - скролл контейнер */}
              <div 
                ref={filtersContainerRef3}
                className="flex items-center gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth snap-x snap-mandatory justify-start"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                <div style={{ scrollSnapAlign: 'center' }}>
                  <DateFilterButton />
                </div>
                <div style={{ scrollSnapAlign: 'center' }}>
                  <FormatFilterButton />
                </div>
                <div style={{ scrollSnapAlign: 'center' }}>
                  <TransportationFilterButton />
                </div>
                <div style={{ scrollSnapAlign: 'center' }}>
                  <PriceFilterButton />
                </div>
                <div style={{ scrollSnapAlign: 'center' }}>
                  <QuickFilterButton
                    label="Фильтры"
                    icon={<SlidersHorizontal size={16} />}
                    isActive={activeFiltersCount > 0}
                    count={activeFiltersCount > 0 ? activeFiltersCount : undefined}
                    onClick={() => setShowFilters(true)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* РУБРИКИ (объединяем themes и landmarks) */}
          {themeCategories.length > 0 && (
            <div className="bg-gray-50">
              <div className="container mx-auto px-4 py-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Рубрики</h3>
                <CategoryChips
                  categories={themeCategories}
                  selected={[...state.themes, ...state.landmarks]}
                  onSelect={(item) => {
                    // Проверяем, является ли это theme или landmark
                    const isTheme = themeCategories.find((t: any) => t.name === item && t.type === 'theme')
                    if (isTheme) {
                      navigation.toggleTheme(item)
                    } else {
                      navigation.toggleLandmark(item)
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Активные фильтры */}
          {activeFiltersCount > 0 && (
            <div className="bg-gray-50">
              <div className="container mx-auto px-4 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-700">Активные фильтры:</span>
                  
              {state.themes.map((theme) => (
                <motion.div
                  key={theme}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {theme}
                  <button onClick={() => navigation.removeTheme(theme)} className="hover:opacity-80">
                    <X size={16} />
                  </button>
                </motion.div>
              ))}

                  {state.landmarks.map((landmark) => (
                <motion.div
                      key={landmark}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                      {landmark}
                      <button onClick={() => navigation.removeLandmark(landmark)} className="hover:opacity-80">
                    <X size={16} />
                  </button>
                </motion.div>
              ))}

                  {state.tags.map((tag) => (
                <motion.div
                      key={tag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                      {tag}
                      <button onClick={() => navigation.removeTag(tag)} className="hover:opacity-80">
                    <X size={16} />
                  </button>
                </motion.div>
              ))}

              {state.price && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {state.price.min !== undefined && state.price.max !== undefined
                    ? `${state.price.min}-${state.price.max}₽`
                    : state.price.min !== undefined
                    ? `от ${state.price.min}₽`
                    : `до ${state.price.max}₽`}
                  <button onClick={() => navigation.setPrice(null)} className="hover:opacity-80">
                    <X size={16} />
                  </button>
                </motion.div>
              )}

              {state.duration && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {state.duration.min !== undefined && state.duration.max !== undefined
                    ? `${state.duration.min}-${state.duration.max} ч`
                    : state.duration.min !== undefined
                    ? `от ${state.duration.min} ч`
                    : `до ${state.duration.max} ч`}
                  <button onClick={() => navigation.setDuration(null)} className="hover:opacity-80">
                    <X size={16} />
                  </button>
                </motion.div>
              )}

              {state.rating && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  ⭐ {state.rating.min}+
                  <button onClick={() => navigation.setRating(null)} className="hover:opacity-80">
                    <X size={16} />
                  </button>
                </motion.div>
              )}

              {state.guests !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  👥 {state.guests} {state.guests === 1 ? 'гость' : 'гостей'}
                  <button onClick={() => navigation.setGuests(null)} className="hover:opacity-80">
                    <X size={16} />
                  </button>
                </motion.div>
              )}

              {state.dateRange && (state.dateRange.from || state.dateRange.to) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  📅 {state.dateRange.from && state.dateRange.to
                    ? `${state.dateRange.from.toLocaleDateString('ru-RU')} - ${state.dateRange.to.toLocaleDateString('ru-RU')}`
                    : state.dateRange.from
                    ? state.dateRange.from.toLocaleDateString('ru-RU')
                    : state.dateRange.to
                    ? state.dateRange.to.toLocaleDateString('ru-RU')
                    : ''}
                  <button onClick={() => navigation.setDateRange(null)} className="hover:opacity-80">
                    <X size={16} />
                  </button>
                </motion.div>
              )}

              {state.format.map((format) => (
                <motion.div
                  key={format}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {format}
                  <button onClick={() => navigation.toggleFormat(format)} className="hover:opacity-80">
                    <X size={16} />
                  </button>
                </motion.div>
              ))}

              {state.transportation.map((transportation) => (
                <motion.div
                  key={transportation}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {transportation}
                  <button onClick={() => navigation.toggleTransportation(transportation)} className="hover:opacity-80">
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

          {/* Сетка туров */}
          <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              {/* Заголовок и сортировка */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-600 hidden sm:block">
                    {/* Логика показа количества */}
                    {(() => {
                      if (isToursLoading) return 'Загрузка...'; // Показываем загрузку
                      const total = toursData?.total || 0;
                      if (total === 0) {
                        return 'Экскурсий не найдено';
                      }
                      const start = (currentPage - 1) * 50 + 1;
                      const end = Math.min(currentPage * 50, total);
                      const countWord = total === 1 ? 'экскурсия' : total < 5 ? 'экскурсии' : 'экскурсий';
                      return `Показано ${start}-${end} из ${total} ${countWord}`;
                    })()}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 cursor-pointer hover:border-gray-900 transition-colors text-sm"
                    >
                    <option value="popular">По популярности</option>
                    <option value="price_asc">Сначала дешёвые</option>
                    <option value="price_desc">Сначала дорогие</option>
                    <option value="rating">По рейтингу</option>
                    <option value="new">Сначала новые</option>
                    </select>
                </div>
              </div>

              {/* Пагинация сверху */}
              {!isToursLoading && toursData && toursData.total > 50 && sortedTours.length > 0 && (
                <div className="mb-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(toursData.total / 50)}
                    onPageChange={(page) => {
                      setCurrentPage(page)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  />
                </div>
              )}

              {/* Контент: Список или Скелетон */}
              {isToursLoading ? (
                  // Скелетоны загрузки
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                      {[...Array(8)].map((_, i) => (
                          <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 h-[380px] animate-pulse">
                              <div className="h-48 bg-gray-200" />
                              <div className="p-4 space-y-3">
                                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                                  <div className="h-3 bg-gray-200 rounded w-full" />
                                  <div className="mt-4 flex justify-between">
                                      <div className="h-6 bg-gray-200 rounded w-20" />
                                      <div className="h-6 bg-gray-200 rounded w-16" />
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                <>
                    {/* Сетка туров */}
                    {sortedTours.length === 0 ? (
                        <div className="text-center py-20">
                        <p className="text-gray-600 text-lg">Экскурсии не найдены</p>
                            <p className="text-gray-500 mt-2">Попробуйте изменить фильтры или выбрать другую рубрику</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                        {sortedTours.map((tour) => (
                            <TourCard key={tour.id} tour={tour} />
                        ))}
                        </div>
                    )}
                </>
              )}

              {/* Пагинация снизу */}
              {!isToursLoading && toursData && toursData.total > 50 && sortedTours.length > 0 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(toursData.total / 50)}
                    onPageChange={(page) => {
                      setCurrentPage(page)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Панель фильтров */}
          <FilterPanel
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
                onApply={() => setShowFilters(false)}
          />
          </motion.div>
        )}
      </AnimatePresence>
      
      <PublicFooter />
    </div>
  )
}
