import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { CityHero } from '@/components/CityHero'
import { LandmarksSection } from '@/components/LandmarksSection'
import { TourCard } from '@/components/TourCard'
import { TourCardSkeleton } from '@/components/TourCardSkeleton'
import { Pagination } from '@/components/Pagination'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { useNavigation } from '@/hooks/useNavigation'
import { getCityName, getCategoryName, getCategorySlug } from '@/lib/urlSlugs'
import { buildDestinationUrl } from '@/lib/routing'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { stringToPriceRange, stringToRating } from '@/lib/urlParams'

/**
 * Страница города (ExperiencePage)
 * URL: /experience/:citySlug или /experience/:citySlug/:categorySlug
 * Пример: /experience/bangkok или /experience/bangkok/gastronomicheskie
 */
export default function ExperiencePage() {
  const { citySlug, categorySlug } = useParams<{ citySlug: string; categorySlug?: string }>()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const { state } = navigation
  
  // Получаем название города и страны из slug
  const cityName = citySlug ? getCityName(citySlug) : null
  const categoryName = categorySlug ? getCategoryName(categorySlug) : null
  
  // Определяем страну (пока что из данных города, потом можно получить из API)
  const [countryName, setCountryName] = useState<string | null>(null)
  
  // Загрузка информации о городе
  const { data: cityInfo } = useQuery({
    queryKey: ['city-experience', citySlug],
    queryFn: () => {
      if (!citySlug) return null
      return api.get(`/tours/experience/${citySlug}`).then(res => res.data)
    },
    enabled: !!citySlug,
  })
  
  // Обновляем страну из данных API
  useEffect(() => {
    if (cityInfo?.country) {
      setCountryName(cityInfo.country)
    }
  }, [cityInfo])
  
  // Локальное состояние для UI
  const [currentPage, setCurrentPage] = useState(1)
  
  // Загрузка рубрик для города
  const { data: rubricsData } = useQuery({
    queryKey: ['rubrics', cityName],
    queryFn: () => {
      const url = cityName 
        ? `/tours/rubrics?location=${encodeURIComponent(cityName)}`
        : '/tours/rubrics'
      return api.get(url).then(res => res.data.rubrics || [])
    },
    enabled: !!cityName,
  })
  
  const rubrics = rubricsData || []
  
  // Загрузка туров с фильтрами
  const { data: toursData, isLoading } = useQuery({
    queryKey: [
      'tours',
      cityName,
      categoryName,
      state.themes,
      state.landmarks,
      state.tags,
      state.price,
      state.duration,
      state.rating,
      state.guests,
      currentPage
    ],
    queryFn: async () => {
      const params: any = {
        page: currentPage,
        page_size: 50,
      }
      
      if (cityName) {
        params.location = cityName
      }
      
      // Если есть категория в URL, добавляем её в themes
      if (categoryName) {
        params.themes = categoryName
      } else if (state.themes.length > 0) {
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
      
      if (state.rating?.min !== undefined) {
        params.min_rating = state.rating.min
      }
      
      if (state.guests !== null) {
        params.guests = state.guests
      }
      
      const queryString = new URLSearchParams(params).toString()
      return api.get(`/tours?${queryString}`).then(res => res.data)
    },
    enabled: !!cityName,
  })
  
  const tours = toursData?.tours || []
  const totalTours = toursData?.total || 0
  
  // Подсчет активных фильтров (кроме города и категории из URL)
  const activeFiltersCount = 
    state.themes.filter(t => t !== categoryName).length +
    state.landmarks.length +
    state.tags.length +
    (state.price ? 1 : 0) +
    (state.duration ? 1 : 0) +
    (state.rating ? 1 : 0) +
    (state.guests !== null ? 1 : 0)
  
  // Обработчик выбора рубрики
  const handleRubricSelect = (rubric: { name: string; type: string; slug?: string }) => {
    // Быстрые фильтры
    if (rubric.type === 'quick_filter') {
      if (rubric.slug === 'discount') {
        navigation.toggleTag('Со скидкой')
      } else if (rubric.slug === 'new') {
        navigation.toggleTag('Новые')
      } else if (rubric.slug === 'best') {
        if (state.rating?.min === 4.7) {
          navigation.setRating(null)
        } else {
          navigation.setRating({ min: 4.7 })
        }
      }
      return
    }
    
    // Обычные категории - переходим на страницу категории
    if (rubric.type === 'theme' && citySlug) {
      const rubricSlug = getCategorySlug(rubric.name)
      if (categorySlug === rubricSlug) {
        // Если уже выбрана, убираем категорию
        navigate(`/experience/${citySlug}`)
      } else {
        // Переходим на страницу категории
        navigate(`/experience/${citySlug}/${rubricSlug}`)
      }
    } else if (rubric.type === 'landmark') {
      navigation.toggleLandmark(rubric.name)
    } else if (rubric.type === 'format') {
      navigation.toggleTag(rubric.name)
    }
  }
  
  // Формируем breadcrumbs
  const breadcrumbs = []
  if (countryName) {
    breadcrumbs.push({
      label: countryName,
      href: buildDestinationUrl(countryName),
    })
  }
  breadcrumbs.push({
    label: cityName || 'Город',
  })
  if (categoryName) {
    breadcrumbs.push({
      label: categoryName,
    })
  }
  
  if (!cityName) {
    return (
      <div className="min-h-screen bg-gray-100">
        <PublicHeader />
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Город не найден</h1>
        </div>
        <PublicFooter />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <PublicHeader />
      
      {/* CityHero */}
      <CityHero 
        city={cityName} 
        country={countryName || undefined} 
        toursCount={totalTours}
      />
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />
      
      {/* Landmarks Section - показываем всегда, если нет фильтра по landmarks */}
      {state.landmarks.length === 0 && (
        <LandmarksSection location={cityName} />
      )}
      
      {/* Основной контент */}
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок страницы */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {categoryName 
              ? `${categoryName} экскурсии в ${cityName}`
              : `Экскурсии в ${cityName}`
            }
          </h1>
          <p className="text-gray-600">
            {totalTours} {totalTours === 1 ? 'экскурсия' : totalTours < 5 ? 'экскурсии' : 'экскурсий'}
          </p>
        </div>
        
        {/* Рубрики (чипы) */}
        {rubrics.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 scroll-smooth">
                {/* Чип "Все" - всегда первый */}
                <motion.button
                  onClick={() => {
                    navigation.resetFilters()
                    // Очищаем только фильтры, но остаемся на странице города
                    if (categorySlug) {
                      // Если есть категория в URL, убираем её через navigate
                      navigate(`/experience/${citySlug}`)
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 border ${
                    activeFiltersCount === 0 && !categorySlug
                      ? 'bg-airbnb-rausch text-white border-airbnb-rausch shadow-md scale-105'
                      : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  Все {cityInfo?.tours_count || totalTours}
                </motion.button>
                
                {/* Рубрики */}
                {rubrics.map((rubric: any, index: number) => {
                  let isSelected = false
                  
                  // Определяем выбранность в зависимости от типа
                  if (rubric.type === 'quick_filter') {
                    if (rubric.slug === 'discount') {
                      isSelected = state.tags.includes('Со скидкой')
                    } else if (rubric.slug === 'new') {
                      isSelected = state.tags.includes('Новые')
                    } else if (rubric.slug === 'best') {
                      isSelected = state.rating?.min === 4.7
                    }
                  } else if (rubric.type === 'theme') {
                    isSelected = state.themes.includes(rubric.name) || categoryName === rubric.name
                  } else if (rubric.type === 'landmark') {
                    isSelected = state.landmarks.includes(rubric.name)
                  } else if (rubric.type === 'format') {
                    isSelected = state.tags.includes(rubric.name)
                  }
                  
                  return (
                    <motion.button
                      key={rubric.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => handleRubricSelect(rubric)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 border ${
                        isSelected
                          ? 'bg-airbnb-rausch text-white border-airbnb-rausch shadow-md scale-105'
                          : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      {rubric.icon && <span className="mr-1.5">{rubric.icon}</span>}
                      <span>{rubric.name}</span>
                      <span className="ml-1.5 text-xs opacity-70">({rubric.tours_count})</span>
                    </motion.button>
                  )
                })}
              </div>
              {/* Градиент справа для индикации прокрутки */}
              {rubrics.length > 5 && (
                <div className="absolute right-0 top-0 bottom-2 w-20 bg-gradient-to-l from-gray-100 to-transparent pointer-events-none" />
              )}
            </div>
          </div>
        )}
        
        {/* Фильтры (кнопки) - пока упрощенная версия */}
        <div className="mb-6 flex flex-wrap gap-2">
          {/* Фильтр по цене */}
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth">
              {['До 5000₽', '5000-10000₽', '10000+₽'].map((range) => {
                const priceRange = stringToPriceRange(range)
                const isSelected = state.price?.min === priceRange.minPrice && state.price?.max === priceRange.maxPrice
                
                return (
                  <button
                    key={range}
                    onClick={() => {
                      if (isSelected) {
                        navigation.setPrice(null)
                      } else {
                        navigation.setPrice({ min: priceRange.minPrice, max: priceRange.maxPrice })
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 border ${
                      isSelected
                        ? 'bg-airbnb-rausch text-white border-airbnb-rausch shadow-md'
                        : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    {range}
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Фильтр по рейтингу */}
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth">
              {['4.5+', '4.7+', '4.9+'].map((rating) => {
                const ratingRange = stringToRating(rating + ' звёзд')
                const isSelected = state.rating?.min === ratingRange.minRating
                
                return (
                  <button
                    key={rating}
                    onClick={() => {
                      if (isSelected) {
                        navigation.setRating(null)
                      } else {
                        navigation.setRating({ min: ratingRange.minRating })
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 border ${
                      isSelected
                        ? 'bg-airbnb-rausch text-white border-airbnb-rausch shadow-md'
                        : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    ⭐ {rating}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        
        {/* Список туров */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <TourCardSkeleton key={i} />
              ))}
            </>
          ) : tours.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">Экскурсии не найдены</p>
            </div>
          ) : (
            tours.map((tour: any) => (
              <TourCard key={tour.id} tour={tour} />
            ))
          )}
        </div>
        
        {/* Пагинация */}
        {totalTours > 50 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalTours / 50)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
      
      <PublicFooter />
    </div>
  )
}
