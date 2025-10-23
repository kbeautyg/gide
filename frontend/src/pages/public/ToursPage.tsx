import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { toursApi, api } from '@/lib/api'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { SearchBar } from '@/components/SearchBar'
import { CategoryChips } from '@/components/CategoryChips'
import { FilterPanel } from '@/components/FilterPanel'
import { TourCard } from '@/components/TourCard'
import { TourCardSkeleton } from '@/components/TourCardSkeleton'
import { CityHero } from '@/components/CityHero'
import { LandmarksSection } from '@/components/LandmarksSection'
import { Pagination } from '@/components/Pagination'

// Азиатские страны и города (ТОЛЬКО АЗИЯ!)
const ASIAN_COUNTRIES = [
  { name: 'Таиланд', flag: '🇹🇭' },
  { name: 'ОАЭ', flag: '🇦🇪' },
  { name: 'Япония', flag: '🇯🇵' },
  { name: 'Корея', flag: '🇰🇷' },
  { name: 'Индонезия', flag: '🇮🇩' },
  { name: 'Вьетнам', flag: '🇻🇳' },
  { name: 'Сингапур', flag: '🇸🇬' },
]

const ASIAN_CITIES = [
  'Бангкок', 'Пхукет', 'Паттайя', 'Краби', 'Чиангмай', 'Ко Тао',
  'Токио', 'Киото', 'Осака',
  'Убуд', 'Семиньяк', 'Нуса-Дуа',
  'Ханой', 'Хошимин', 'Халонг',
  'Сеул', 'Пусан',
  'Сингапур', 'Дубай',
]

export default function ToursPage() {
  const [searchParams] = useSearchParams()
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([])
  const [selectedDurations, setSelectedDurations] = useState<string[]>([])
  const [selectedRatings, setSelectedRatings] = useState<string[]>([])
  const [selectedLandmarks, setSelectedLandmarks] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('popular')
  const [dateFilter, setDateFilter] = useState('any')
  const [durationFilter, setDurationFilter] = useState('any')
  const [priceFilter, setPriceFilter] = useState('any')
  const [currentPage, setCurrentPage] = useState(1)
  const TOURS_PER_PAGE = 50
  
  // Читаем параметры из URL при загрузке
  const locationParam = searchParams.get('location')
  const guestsParam = searchParams.get('guests')
  const landmarksParam = searchParams.get('landmarks')
  // const dateStartParam = searchParams.get('date_start')  // TODO: использовать для фильтрации по датам
  // const dateEndParam = searchParams.get('date_end')  // TODO: использовать для фильтрации по датам

  // Загрузка категорий
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/v1/tours/categories').then(res => res.json()),
  })
  
  // Загрузка динамической навигации (достопримечательности и тд)
  const { data: navigationData } = useQuery({
    queryKey: ['dynamic-navigation'],
    queryFn: () => api.get('/tours/dynamic-navigation').then(res => res.data.data),
  })

  // Загрузка экскурсий с фильтрами
  const { data: toursData, isLoading } = useQuery({
    queryKey: ['tours', selectedThemes, selectedCountries, selectedCities, selectedPriceRanges, selectedDurations, selectedRatings, currentPage, landmarksParam],
    queryFn: async () => {
      // Преобразуем фильтры в параметры API
      const params: any = {
        page: currentPage,
        page_size: 500,  // Получаем все для клиентской пагинации
      }

      // Добавляем landmarks параметр если есть
      if (landmarksParam) {
        params.landmarks = landmarksParam
      }

      // Цена
      if (selectedPriceRanges.includes('До 5000₽')) params.max_price = 5000
      if (selectedPriceRanges.includes('5000-10000₽')) {
        params.min_price = 5000
        params.max_price = 10000
      }
      if (selectedPriceRanges.includes('10000+₽')) params.min_price = 10000

      const response = await toursApi.getList(params)
      console.log('Tours API response:', response.data)
      return response.data
    },
  })

  const tours = toursData?.tours || []
  
  // Клиентская фильтрация (страны, города, select фильтры + URL параметры)
  const filteredTours = tours.filter((tour: any) => {
    // Фильтр по location из URL
    if (locationParam) {
      const locationLower = tour.location?.toLowerCase() || ''
      if (!locationLower.includes(locationParam.toLowerCase())) {
        return false
      }
    }
    
    // Фильтр по guests из URL
    if (guestsParam) {
      const guests = parseInt(guestsParam)
      if (tour.max_group_size && tour.max_group_size < guests) {
        return false
      }
    }
    
    // Страны
    if (selectedCountries.length > 0) {
      const matchesCountry = selectedCountries.some(country => 
        tour.country === country || tour.location?.includes(country)
      )
      if (!matchesCountry) return false
    }

    // Города
    if (selectedCities.length > 0) {
      const matchesCity = selectedCities.some(city => 
        tour.location === city || tour.location?.includes(city)
      )
      if (!matchesCity) return false
    }
    
    // Достопримечательности
    if (selectedLandmarks.length > 0) {
      const tourLandmarks = tour.landmarks || []
      const matchesLandmark = selectedLandmarks.some(landmark =>
        tourLandmarks.includes(landmark)
      )
      if (!matchesLandmark) return false
    }

    // Фильтр длительности из select
    if (durationFilter !== 'any') {
      if (durationFilter === 'short' && tour.duration > 2) return false
      if (durationFilter === 'medium' && (tour.duration < 2 || tour.duration > 4)) return false
      if (durationFilter === 'long' && (tour.duration < 4 || tour.duration > 8)) return false
      if (durationFilter === 'fullday' && tour.duration < 7) return false
    }

    // Фильтр цены из select
    if (priceFilter !== 'any') {
      if (priceFilter === 'cheap' && tour.price > 3000) return false
      if (priceFilter === 'medium' && (tour.price < 3000 || tour.price > 7000)) return false
      if (priceFilter === 'expensive' && (tour.price < 7000 || tour.price > 15000)) return false
      if (priceFilter === 'luxury' && tour.price < 15000) return false
    }

    return true
  })

  // Сортировка
  const sortedTours = [...filteredTours].sort((a: any, b: any) => {
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

  console.log('Sorted tours:', sortedTours.length, 'Sort by:', sortBy)

  // Пагинация - разбиваем на страницы
  const totalPages = Math.ceil(sortedTours.length / TOURS_PER_PAGE)
  const startIndex = (currentPage - 1) * TOURS_PER_PAGE
  const endIndex = startIndex + TOURS_PER_PAGE
  const paginatedTours = sortedTours.slice(startIndex, endIndex)

  // Формируем список категорий для чипсов
  const themeCategories = categoriesData?.themes 
    ? Object.entries(categoriesData.themes).map(([name, count]) => ({ name, count: count as number }))
    : []

  const handleThemeSelect = (theme: string) => {
    setSelectedThemes(prev =>
      prev.includes(theme)
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    )
    setCurrentPage(1)  // Сброс на первую страницу
  }
  
  const handleLandmarkSelect = (landmark: string) => {
    setSelectedLandmarks(prev =>
      prev.includes(landmark)
        ? prev.filter(l => l !== landmark)
        : [...prev, landmark]
    )
    setCurrentPage(1)
  }

  const handleFilterApply = (filters: any) => {
    console.log('Применить фильтры:', filters)
    // Здесь будет логика применения фильтров
  }

  // Подсчет активных фильтров
  const activeFiltersCount = 
    selectedCountries.length + 
    selectedCities.length + 
    selectedThemes.length + 
    selectedPriceRanges.length + 
    selectedDurations.length + 
    selectedRatings.length

  // Сброс всех фильтров
  const handleResetFilters = () => {
    setSelectedCountries([])
    setSelectedCities([])
    setSelectedThemes([])
    setSelectedPriceRanges([])
    setSelectedDurations([])
    setSelectedRatings([])
  }

  // Определяем город и страну из первого тура (если есть locationParam)
  const cityInfo = locationParam && sortedTours.length > 0 ? (() => {
    const firstTour = sortedTours[0]
    const parts = firstTour.location?.split(', ')
    if (parts && parts.length === 2) {
      return {
        city: parts[0].trim(),
        country: parts[1].trim(),
        toursCount: sortedTours.length
      }
    }
    return null
  })() : null

  // Функция для удаления landmarks фильтра
  const removeLandmarksFilter = () => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.delete('landmarks')
    window.history.pushState({}, '', `?${newParams.toString()}`)
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Sticky поисковая панель */}
      <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <SearchBar variant="sticky" />
        </div>
      </div>

      {/* CityHero - показываем только если есть locationParam */}
      {cityInfo && (
        <CityHero 
          city={cityInfo.city} 
          country={cityInfo.country} 
          toursCount={cityInfo.toursCount}
        />
      )}

      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600">
            <Link to="/" className="hover:underline">Главная</Link>
            {cityInfo ? (
              <>
                {' > '}
                <span className="text-gray-700">{cityInfo.country}</span>
                {' > '}
                <span className="text-gray-900 font-medium">{cityInfo.city}</span>
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

      {/* Активный фильтр по достопримечательности */}
      {landmarksParam && (
        <div className="bg-blue-50 border-b border-blue-100">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Фильтр по достопримечательности:</span>
              <div className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1 rounded-full text-sm font-medium">
                {landmarksParam}
                <button onClick={removeLandmarksFilter} className="hover:opacity-80">
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Landmarks Section - показываем только если есть locationParam и нет активного фильтра по landmarks */}
      {locationParam && !landmarksParam && (
        <LandmarksSection location={locationParam} />
      )}

      {/* Заголовок страницы - показываем только если НЕТ cityInfo */}
      {!cityInfo && (
        <section className="bg-white py-12 border-b">
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

      {/* Фильтры и сортировка */}
      <div className="bg-white border-b sticky top-[72px] z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Быстрые фильтры в виде select */}
            <div className="flex items-center gap-3 flex-wrap">
              <select 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-900 transition-colors bg-white cursor-pointer"
              >
                <option value="any">Любые даты</option>
                <option value="today">Сегодня</option>
                <option value="tomorrow">Завтра</option>
                <option value="weekend">Эти выходные</option>
                <option value="thisweek">На этой неделе</option>
              </select>

              <select 
                value={durationFilter} 
                onChange={(e) => setDurationFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-900 transition-colors bg-white cursor-pointer"
              >
                <option value="any">Любая длительность</option>
                <option value="short">До 2 часов</option>
                <option value="medium">2-4 часа</option>
                <option value="long">4-8 часов</option>
                <option value="fullday">Полный день</option>
              </select>

              <select 
                value={priceFilter} 
                onChange={(e) => setPriceFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-900 transition-colors bg-white cursor-pointer"
              >
                <option value="any">Любая цена</option>
                <option value="cheap">До 3000₽</option>
                <option value="medium">3000-7000₽</option>
                <option value="expensive">7000-15000₽</option>
                <option value="luxury">15000+₽</option>
              </select>
            </div>
          </div>
                  </div>
                </div>

      {/* Секция категорий (Рубрики) */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 space-y-4">
          {/* Заголовок с кнопкой сброса */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Активных фильтров: <span className="font-bold text-airbnb-rausch">{activeFiltersCount}</span>
              </p>
              <button
                onClick={handleResetFilters}
                className="text-sm text-airbnb-rausch hover:underline font-medium"
              >
                Сбросить всё
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
                  onClick={() => {
                    setSelectedCountries(prev =>
                      prev.includes(country.name) ? prev.filter(c => c !== country.name) : [...prev, country.name]
                    )
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCountries.includes(country.name)
                      ? 'bg-airbnb-rausch text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  {country.flag} {country.name}
                </motion.button>
              ))}
            </div>
                </div>

          {/* Фильтр по городам */}
                <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">📍 Города</h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {ASIAN_CITIES.map((city, index) => (
                <motion.button
                  key={city}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    setSelectedCities(prev =>
                      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
                    )
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCities.includes(city)
                      ? 'bg-airbnb-rausch text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  {city}
                </motion.button>
              ))}
                  </div>
                </div>

          {/* Достопримечательности как категории */}
          {navigationData?.landmarks && navigationData.landmarks.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">🏛️ Достопримечательности</h2>
              <CategoryChips
                categories={navigationData.landmarks.map((l: any) => ({ name: l.name, count: l.count }))}
                selected={selectedLandmarks}
                onSelect={handleLandmarkSelect}
                maxVisible={12}
              />
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">🎨 Категории</h2>
            <CategoryChips
              categories={themeCategories}
              selected={selectedThemes}
              onSelect={handleThemeSelect}
              maxVisible={12}
            />
          </div>

          {/* Фильтр по цене */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Цена</h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {['До 5000₽', '5000-10000₽', '10000+₽'].map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setSelectedPriceRanges(prev =>
                      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
                    )
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedPriceRanges.includes(range)
                      ? 'bg-airbnb-rausch text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range}
                </button>
              ))}
              </div>
                </div>

          {/* Фильтр по длительности */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Длительность</h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {['1-3 часа', '4-6 часов', 'Полный день (7+ч)'].map((duration) => (
                <button
                  key={duration}
                  onClick={() => {
                    setSelectedDurations(prev =>
                      prev.includes(duration) ? prev.filter(d => d !== duration) : [...prev, duration]
                    )
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedDurations.includes(duration)
                      ? 'bg-airbnb-rausch text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {duration}
                </button>
              ))}
                          </div>
                        </div>

          {/* Фильтр по рейтингу */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Рейтинг</h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {['4.5+ звёзд', '4.7+', '4.9+ (топ)'].map((rating) => (
                <button
                  key={rating}
                  onClick={() => {
                    setSelectedRatings(prev =>
                      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
                    )
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedRatings.includes(rating)
                      ? 'bg-airbnb-rausch text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⭐ {rating}
                </button>
                  ))}
                </div>
          </div>

          {/* Сброс фильтров */}
          {(selectedThemes.length > 0 || selectedPriceRanges.length > 0 || selectedDurations.length > 0 || selectedRatings.length > 0) && (
            <button
              onClick={() => {
                setSelectedThemes([])
                setSelectedPriceRanges([])
                setSelectedDurations([])
                setSelectedRatings([])
              }}
              className="text-sm text-airbnb-rausch hover:underline font-medium"
            >
              Сбросить все фильтры
            </button>
          )}
        </div>
      </div>

      {/* Основной контент */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Заголовок и сортировка */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Все туры</h2>
              <p className="text-gray-600">
                Показано {paginatedTours.length} из {sortedTours.length} {(() => {
                  const count = sortedTours.length;
                  if (count === 1) return 'экскурсии';
                  if (count < 5) return 'экскурсий';
                  return 'экскурсий';
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
              <p className="text-gray-500 mt-2">Попробуйте изменить фильтры</p>
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
              {paginatedTours.map((tour) => (
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
          {!isLoading && sortedTours.length > 0 && (
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                totalItems={sortedTours.length}
                itemsPerPage={TOURS_PER_PAGE}
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
