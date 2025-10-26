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
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('popular')
  const [dateFilter, setDateFilter] = useState('any')
  const [durationFilter, setDurationFilter] = useState('any')
  const [priceFilter, setPriceFilter] = useState('any')
  const [currentPage, setCurrentPage] = useState(1)
  
  // Читаем параметры из URL при загрузке
  const locationParam = searchParams.get('location')
  const guestsParam = searchParams.get('guests')
  const landmarksParam = searchParams.get('landmarks')
  // const dateStartParam = searchParams.get('date_start')  // TODO: использовать для фильтрации по датам
  // const dateEndParam = searchParams.get('date_end')  // TODO: использовать для фильтрации по датам

  // Загрузка динамических категорий из navigation API
  const { data: navigationData } = useQuery({
    queryKey: ['dynamic-navigation'],
    queryFn: () => api.get('/tours/dynamic-navigation').then(res => res.data.data),
  })

  // Загрузка экскурсий с фильтрами
  const { data: toursData, isLoading } = useQuery({
    queryKey: ['tours', selectedThemes, selectedCountries, selectedCities, selectedPriceRanges, selectedDurations, selectedRatings, currentPage, landmarksParam, locationParam, guestsParam, dateFilter, durationFilter, priceFilter],
    queryFn: async () => {
      // Преобразуем фильтры в параметры API
      const params: any = {
        page: currentPage,
        page_size: 50,  // 50 туров на страницу
      }

      // Добавляем landmarks параметр если есть
      if (landmarksParam) {
        params.landmarks = landmarksParam
      }

      // Location из URL или выбранные города/страны
      if (locationParam) {
        params.location = locationParam
      } else if (selectedCities.length > 0) {
        // Если выбраны города, используем первый город для location
        params.location = selectedCities[0]
      } else if (selectedCountries.length > 0) {
        // Если выбраны страны, используем первую страну для location
        params.location = selectedCountries[0]
      }

      // Guests из URL
      if (guestsParam) {
        params.guests = parseInt(guestsParam)
      }

      // Темы/категории
      if (selectedThemes.length > 0) {
        params.themes = selectedThemes.join(',')
      }

      // Цена из чипсов
      if (selectedPriceRanges.includes('До 5000₽')) params.max_price = 5000
      if (selectedPriceRanges.includes('5000-10000₽')) {
        params.min_price = 5000
        params.max_price = 10000
      }
      if (selectedPriceRanges.includes('10000+₽')) params.min_price = 10000

      // Цена из select
      if (priceFilter === 'cheap') params.max_price = 3000
      if (priceFilter === 'medium') {
        params.min_price = 3000
        params.max_price = 7000
      }
      if (priceFilter === 'expensive') {
        params.min_price = 7000
        params.max_price = 15000
      }
      if (priceFilter === 'luxury') params.min_price = 15000

      // Длительность из select
      if (durationFilter === 'short') params.duration_max = 2
      if (durationFilter === 'medium') {
        params.duration_min = 2
        params.duration_max = 4
      }
      if (durationFilter === 'long') {
        params.duration_min = 4
        params.duration_max = 8
      }
      if (durationFilter === 'fullday') params.duration_min = 7

      const response = await toursApi.getList(params)
      console.log('Tours API response:', response.data)
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

  console.log('Sorted tours:', sortedTours.length, 'Sort by:', sortBy)

  // Формируем список категорий для чипсов из динамических данных
  const themeCategories = navigationData?.themes 
    ? navigationData.themes.map((item: any) => ({ name: item.name, count: item.count }))
    : []

  const handleThemeSelect = (theme: string) => {
    setSelectedThemes(prev =>
      prev.includes(theme)
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    )
  }

  const handleFilterApply = (filters: any) => {
    console.log('Применить фильтры:', filters)
    // Здесь будет логика применения фильтров
  }

  // Подсчет активных категорий (только видимые в блоке "Активные категории")
  const activeFiltersCount = 
    selectedCountries.length + 
    selectedCities.length + 
    selectedThemes.length + 
    (landmarksParam ? 1 : 0)

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

      {/* Поисковая панель */}
      <div className="sticky top-[72px] z-50 bg-white border-b shadow-sm will-change-transform">
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
      <div className="bg-white border-b">
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

      {/* Секция категорий */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 space-y-4">
          {/* Заголовок с кнопкой сброса */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Активных категорий: <span className="font-bold text-airbnb-rausch">{activeFiltersCount}</span>
              </p>
              <button
                onClick={handleResetFilters}
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

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Категории</h3>
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

          {/* Сброс категорий */}
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
              Сбросить все категории
            </button>
          )}
        </div>
      </div>

      {/* Активные категории - отображение выбранных */}
      {(selectedThemes.length > 0 || selectedCountries.length > 0 || selectedCities.length > 0 || landmarksParam) && (
        <div className="bg-gray-50 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-700">Активные категории:</span>
              
              {/* Landmarks из URL */}
              {landmarksParam && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {landmarksParam}
                  <button onClick={removeLandmarksFilter} className="hover:opacity-80">
                    <X size={16} />
                  </button>
                </motion.div>
              )}

              {/* Выбранные темы */}
              {selectedThemes.map((theme) => (
                <motion.div
                  key={theme}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {theme}
                  <button onClick={() => handleThemeSelect(theme)} className="hover:opacity-80">
                    <X size={16} />
                  </button>
                </motion.div>
              ))}

              {/* Выбранные страны */}
              {selectedCountries.map((country) => (
                <motion.div
                  key={country}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {country}
                  <button
                    onClick={() => setSelectedCountries(prev => prev.filter(c => c !== country))}
                    className="hover:opacity-80"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ))}

              {/* Выбранные города */}
              {selectedCities.map((city) => (
                <motion.div
                  key={city}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-airbnb-rausch text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {city}
                  <button
                    onClick={() => setSelectedCities(prev => prev.filter(c => c !== city))}
                    className="hover:opacity-80"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Основной контент */}
      <section className="py-8 bg-gray-50">
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
