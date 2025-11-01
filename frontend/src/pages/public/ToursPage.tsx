import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { toursApi, api } from '@/lib/api'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { CategoryChips } from '@/components/CategoryChips'
import { FilterPanel } from '@/components/FilterPanel'
import { TourCard } from '@/components/TourCard'
import { TourCardSkeleton } from '@/components/TourCardSkeleton'
import { CityHero } from '@/components/CityHero'
import { LandmarksSection } from '@/components/LandmarksSection'
import { Pagination } from '@/components/Pagination'
import { useNavigation } from '@/hooks/useNavigation'
import { stringToPriceRange, stringToDurationRange, stringToRating } from '@/lib/urlParams'

// Азиатские страны и города (ТОЛЬКО АЗИЯ!) - Профессиональный маппинг
const ASIAN_COUNTRIES = [
  { name: 'Таиланд', flag: '🇹🇭' },
  { name: 'ОАЭ', flag: '🇦🇪' },
  { name: 'Япония', flag: '🇯🇵' },
  { name: 'Корея', flag: '🇰🇷' },
  { name: 'Индонезия', flag: '🇮🇩' },
  { name: 'Вьетнам', flag: '🇻🇳' },
  { name: 'Сингапур', flag: '🇸🇬' },
  { name: 'Китай', flag: '🇨🇳' },
  { name: 'Индия', flag: '🇮🇳' },
  { name: 'Малайзия', flag: '🇲🇾' },
]

// Маппинг городов к странам
const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'Таиланд': ['Бангкок', 'Пхукет', 'Паттайя', 'Краби', 'Чиангмай', 'Ко Тао', 'Ко Самуи', 'Хуа Хин'],
  'ОАЭ': ['Дубай', 'Абу-Даби', 'Шарджа', 'Аджман'],
  'Япония': ['Токио', 'Киото', 'Осака', 'Хиросима', 'Нара', 'Фукуока', 'Саппоро'],
  'Корея': ['Сеул', 'Пусан', 'Чеджу', 'Инчхон'],
  'Индонезия': ['Убуд', 'Семиньяк', 'Нуса-Дуа', 'Джакарта', 'Джокьякарта', 'Ломбок'],
  'Вьетнам': ['Ханой', 'Хошимин', 'Халонг', 'Нячанг', 'Далат', 'Хойан', 'Хюэ'],
  'Сингапур': ['Сингапур'],
  'Китай': ['Пекин', 'Шанхай', 'Сиань', 'Гуанчжоу', 'Ченду', 'Гонконг'],
  'Индия': ['Дели', 'Мумбаи', 'Джайпур', 'Агра', 'Гоа', 'Варанаси', 'Удайпур'],
  'Малайзия': ['Куала-Лумпур', 'Пенанг', 'Лангкави', 'Малакка'],
};

export default function ToursPage() {
  const navigation = useNavigation()
  const { state } = navigation
  
  // Локальное состояние только для UI (не фильтры)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('popular')
  const [currentPage, setCurrentPage] = useState(1)

  // Загрузка динамических категорий из navigation API
  const { data: navigationData } = useQuery({
    queryKey: ['dynamic-navigation'],
    queryFn: () => api.get('/tours/dynamic-navigation').then(res => res.data.data),
  })

  // Загрузка экскурсий с фильтрами из NavigationContext
  const { data: toursData, isLoading } = useQuery({
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
      currentPage
    ],
    queryFn: async () => {
      // Преобразуем состояние из NavigationContext в параметры API
      const params: any = {
        page: currentPage,
        page_size: 50,
      }

      // Location из состояния
      const locations: string[] = []
      if (state.location) locations.push(state.location)
      locations.push(...state.cities)
      locations.push(...state.countries)
      if (locations.length > 0) {
        params.location = [...new Set(locations)].join(',')
      }

      // Themes
      if (state.themes.length > 0) {
        params.themes = state.themes.join(',')
      }

      // Landmarks
      if (state.landmarks.length > 0) {
        params.landmarks = state.landmarks.join(',')
      }

      // Tags
      if (state.tags.length > 0) {
        params.tags = state.tags.join(',')
      }

      // Price
      if (state.price) {
        if (state.price.min !== undefined) params.min_price = state.price.min
        if (state.price.max !== undefined) params.max_price = state.price.max
      }

      // Duration
      if (state.duration) {
        if (state.duration.min !== undefined) params.duration_min = state.duration.min
        if (state.duration.max !== undefined) params.duration_max = state.duration.max
      }

      // Rating
      if (state.rating && state.rating.min !== undefined) {
        params.min_rating = state.rating.min
      }

      // Guests
      if (state.guests !== null && state.guests !== undefined) {
        params.guests = state.guests
      }

      const response = await toursApi.getList(params)
      return response.data
    },
  })

  const tours = toursData?.tours || []
  
  // Сортировка (фильтрация теперь на бэкенде)
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
        // Формула популярности: бронирования * 2 + просмотры * 0.1 + рейтинг * 10
        const scoreA = (a.total_bookings || 0) * 2 + (a.views_count || 0) * 0.1 + (a.rating || 0) * 10
        const scoreB = (b.total_bookings || 0) * 2 + (b.views_count || 0) * 0.1 + (b.rating || 0) * 10
        return scoreB - scoreA
    }
  })

  // Получаем активную локацию для отображения CityHero и LandmarksSection
  const activeLocation = navigation.getActiveLocation()

  // Определяем город и страну из активной локации
  const getCityInfo = () => {
    if (!activeLocation) return null
    
    // Если есть туры, пытаемся определить страну из первого тура
    if (sortedTours.length > 0) {
      const firstTour = sortedTours[0]
      const parts = firstTour.location?.split(', ')
      if (parts && parts.length === 2 && parts[0].trim() === activeLocation) {
        return {
          city: parts[0].trim(),
          country: parts[1].trim(),
          toursCount: toursData?.total || sortedTours.length
        }
      }
    }
    
    // Если туров нет или формат другой, используем активную локацию как город
    // Определяем страну из маппинга
    let country = ''
    for (const [countryName, cities] of Object.entries(CITIES_BY_COUNTRY)) {
      if (cities.includes(activeLocation)) {
        country = countryName
        break
      }
    }
    
    return {
      city: activeLocation,
      country: country || '',
      toursCount: toursData?.total || 0
    }
  }

  const cityInfo = getCityInfo()

  // Формируем список категорий для чипсов из динамических данных
  const themeCategories = navigationData?.themes 
    ? navigationData.themes.map((item: any) => ({ name: item.name, count: item.count }))
    : []

  // Обработчики фильтров через NavigationContext
  const handleThemeSelect = (theme: string) => {
    navigation.toggleTheme(theme)
  }

  const handleFilterApply = (filters: any) => {
    console.log('Применить фильтры:', filters)
    // Здесь будет логика применения фильтров через NavigationContext
  }

  // Подсчет активных фильтров
  const activeFiltersCount = 
    state.countries.length + 
    state.cities.length + 
    state.themes.length + 
    state.landmarks.length +
    state.tags.length +
    (state.price ? 1 : 0) +
    (state.duration ? 1 : 0) +
    (state.rating ? 1 : 0) +
    (state.guests !== null ? 1 : 0)

  // Автоматически очищаем города при изменении стран
  const handleCountrySelect = (country: string) => {
    navigation.toggleCountry(country)
    
    // Убираем города, которые не принадлежат выбранным странам
    const validCities = navigation.state.countries.flatMap(c => CITIES_BY_COUNTRY[c] || [])
    const citiesToRemove = navigation.state.cities.filter(city => !validCities.includes(city))
    citiesToRemove.forEach(city => navigation.removeCity(city))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <PublicHeader />

      {/* CityHero - показываем всегда при наличии активной локации */}
      {cityInfo && (
        <CityHero 
          city={cityInfo.city} 
          country={cityInfo.country} 
          toursCount={cityInfo.toursCount}
        />
      )}

      {/* Breadcrumbs */}
      <div className="bg-gray-100">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600">
            <Link to="/" className="hover:underline">Главная</Link>
            {cityInfo ? (
              <>
                {' > '}
                <Link to={`/tours?location=${encodeURIComponent(cityInfo.country)}`} className="hover:underline">
                  {cityInfo.country}
                </Link>
                {' > '}
                <span className="text-gray-900 font-medium">{cityInfo.city}</span>
                {state.themes.length > 0 && (
                  <>
                    {' > '}
                    <span className="text-gray-900 font-medium">{state.themes[0]}</span>
                  </>
                )}
              </>
            ) : (
              <>
                {' > '}
                <span className="text-gray-900 font-medium">Все туры</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Landmarks Section - показываем только если есть активная локация и нет фильтра по landmarks */}
      {activeLocation && state.landmarks.length === 0 && (
        <LandmarksSection location={activeLocation} />
      )}

      {/* Заголовок страницы - показываем только если НЕТ cityInfo */}
      {!cityInfo && (
        <section className="bg-gray-100 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Авторские туры по всему миру
            </h1>
            <p className="text-xl text-gray-600">
              Необычные туры от местных жителей
            </p>
          </div>
        </section>
      )}

      {/* Секция категорий */}
      <div className="bg-gray-100">
        <div className="container mx-auto px-4 py-6 space-y-4">
          {/* Заголовок с кнопкой сброса */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Активных категорий: <span className="font-bold text-airbnb-rausch">{activeFiltersCount}</span>
              </p>
              <button
                onClick={navigation.resetFilters}
                className="text-sm text-airbnb-rausch hover:underline font-medium"
              >
                Сбросить все категории
              </button>
            </div>
          )}

          {/* Фильтр по странам */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">🌏 Страны</h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {ASIAN_COUNTRIES.map((country, index) => (
                <motion.button
                  key={country.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleCountrySelect(country.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                    state.countries.includes(country.name)
                      ? 'bg-airbnb-rausch text-white border-airbnb-rausch shadow-md scale-105'
                      : 'bg-[#111827] text-white border-[#111827] hover:bg-white hover:text-[#111827] hover:border-[#111827] hover:scale-105'
                  }`}
                >
                  {country.flag} {country.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Фильтр по городам - умная фильтрация */}
          {state.countries.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                📍 Города {state.countries.length === 1 ? `(${state.countries[0]})` : '(выбранных стран)'}
              </h3>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {(() => {
                  // Получаем города только из выбранных стран
                  const availableCities = state.countries.flatMap(country => CITIES_BY_COUNTRY[country] || [])
                  
                  return availableCities.map((city, index) => (
                    <motion.button
                      key={city}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => navigation.toggleCity(city)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                        state.cities.includes(city)
                          ? 'bg-airbnb-rausch text-white border-airbnb-rausch shadow-md scale-105'
                          : 'bg-[#111827] text-white border-[#111827] hover:bg-white hover:text-[#111827] hover:border-[#111827] hover:scale-105'
                      }`}
                    >
                      {city}
                    </motion.button>
                  ))
                })()}
              </div>
            </div>
          )}

          {/* Категории */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Категории</h3>
            <CategoryChips
              categories={themeCategories}
              selected={state.themes}
              onSelect={handleThemeSelect}
              maxVisible={12}
            />
          </div>

          {/* Фильтр по цене */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Цена</h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
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
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-airbnb-rausch text-white border-airbnb-rausch shadow-md'
                        : 'bg-[#111827] text-white border-[#111827] hover:bg-white hover:text-[#111827] hover:border-[#111827]'
                    }`}
                  >
                    {range}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Фильтр по длительности */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Длительность</h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {['1-3 часа', '4-6 часов', 'Полный день (7+ч)'].map((duration) => {
                const durationRange = stringToDurationRange(duration)
                const isSelected = state.duration?.min === durationRange.durationMin && 
                                  state.duration?.max === durationRange.durationMax
                
                return (
                  <button
                    key={duration}
                    onClick={() => {
                      if (isSelected) {
                        navigation.setDuration(null)
                      } else {
                        navigation.setDuration({ 
                          min: durationRange.durationMin, 
                          max: durationRange.durationMax 
                        })
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-airbnb-rausch text-white border-airbnb-rausch shadow-md'
                        : 'bg-[#111827] text-white border-[#111827] hover:bg-white hover:text-[#111827] hover:border-[#111827]'
                    }`}
                  >
                    {duration}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Фильтр по рейтингу */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Рейтинг</h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {['4.5+ звёзд', '4.7+', '4.9+ (топ)'].map((rating) => {
                const ratingRange = stringToRating(rating)
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
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-airbnb-rausch text-white border-airbnb-rausch shadow-md'
                        : 'bg-[#111827] text-white border-[#111827] hover:bg-white hover:text-[#111827] hover:border-[#111827]'
                    }`}
                  >
                    ⭐ {rating}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Активные категории - отображение выбранных */}
      {activeFiltersCount > 0 && (
        <div className="bg-gray-100">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-700">Активные категории:</span>
              
              {/* Landmarks */}
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

              {/* Tags */}
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

              {/* Themes */}
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

              {/* Countries */}
              {state.countries.map((country) => (
                <motion.div
                  key={country}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {country}
                  <button onClick={() => navigation.removeCountry(country)} className="hover:opacity-80">
                    <X size={16} />
                  </button>
                </motion.div>
              ))}

              {/* Cities */}
              {state.cities.map((city) => (
                <motion.div
                  key={city}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {city}
                  <button onClick={() => navigation.removeCity(city)} className="hover:opacity-80">
                    <X size={16} />
                  </button>
                </motion.div>
              ))}

              {/* Price */}
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

              {/* Duration */}
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

              {/* Rating */}
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

              {/* Guests */}
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
            </div>
          </div>
        </div>
      )}

      {/* Основной контент */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          {/* Заголовок и сортировка */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Все туры</h2>
              <p className="text-gray-600">
                {(() => {
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
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 cursor-pointer hover:border-gray-900 transition-colors"
            >
              <option value="popular">По популярности</option>
              <option value="price_asc">Сначала дешёвые</option>
              <option value="price_desc">Сначала дорогие</option>
              <option value="rating">По рейтингу</option>
              <option value="new">Сначала новые</option>
            </select>
          </div>

          {/* Пагинация сверху */}
          {toursData && toursData.total > 50 && sortedTours.length > 0 && (
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

          {/* Сетка туров */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <TourCardSkeleton key={i} />
              ))}
            </div>
          ) : sortedTours.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">Экскурсии не найдены</p>
              <p className="text-gray-500 mt-2">Попробуйте изменить категории</p>
            </div>
          ) : (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              {sortedTours.map((tour) => (
                <motion.div
                  key={tour.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <TourCard tour={tour} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Пагинация снизу */}
          {toursData && toursData.total > 50 && sortedTours.length > 0 && (
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
        onApply={handleFilterApply}
      />
      
      <PublicFooter />
    </div>
  )
}
