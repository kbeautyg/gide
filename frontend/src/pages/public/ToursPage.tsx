import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toursApi } from '@/lib/api'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { SearchBar } from '@/components/SearchBar'
import { CategoryChips } from '@/components/CategoryChips'
import { FilterPanel } from '@/components/FilterPanel'
import { TourCard } from '@/components/TourCard'
import { TourCardSkeleton } from '@/components/TourCardSkeleton'

// Азиатские страны и города
const ASIAN_COUNTRIES = [
  { name: 'Таиланд', flag: '🇹🇭' },
  { name: 'Грузия', flag: '🇬🇪' },
  { name: 'Турция', flag: '🇹🇷' },
  { name: 'ОАЭ', flag: '🇦🇪' },
  { name: 'Япония', flag: '🇯🇵' },
  { name: 'Корея', flag: '🇰🇷' },
  { name: 'Китай', flag: '🇨🇳' },
  { name: 'Индия', flag: '🇮🇳' },
  { name: 'Индонезия', flag: '🇮🇩' },
  { name: 'Вьетнам', flag: '🇻🇳' },
  { name: 'Малайзия', flag: '🇲🇾' },
  { name: 'Сингапур', flag: '🇸🇬' },
]

const ASIAN_CITIES = [
  'Тбилиси', 'Стамбул', 'Бангкок', 'Пхукет', 'Дубай', 
  'Токио', 'Сеул', 'Бали', 'Паттайя', 'Ханой', 'Куала-Лумпур',
]

export default function ToursPage() {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([])
  const [selectedDurations, setSelectedDurations] = useState<string[]>([])
  const [selectedRatings, setSelectedRatings] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('popular')

  // Загрузка категорий
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/v1/tours/categories').then(res => res.json()),
  })

  // Загрузка экскурсий с фильтрами
  const { data: toursData, isLoading } = useQuery({
    queryKey: ['tours', selectedThemes, selectedCountries, selectedCities, selectedPriceRanges, selectedDurations, selectedRatings],
    queryFn: async () => {
      // Преобразуем фильтры в параметры API
      const params: any = {
        page: 1,
        page_size: 50,
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
  
  // Клиентская фильтрация (страны, города, длительность и рейтинг)
  const filteredTours = tours.filter((tour: any) => {
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

    // Длительность
    if (selectedDurations.length > 0) {
      const matchesDuration = selectedDurations.some(dur => {
        if (dur === '1-3 часа') return tour.duration >= 1 && tour.duration <= 3
        if (dur === '4-6 часов') return tour.duration >= 4 && tour.duration <= 6
        if (dur === 'Полный день (7+ч)') return tour.duration >= 7
        return false
      })
      if (!matchesDuration) return false
    }

    // Рейтинг
    if (selectedRatings.length > 0) {
      const matchesRating = selectedRatings.some(rating => {
        if (rating === '4.5+ звёзд') return tour.rating >= 4.5
        if (rating === '4.7+') return tour.rating >= 4.7
        if (rating === '4.9+ (топ)') return tour.rating >= 4.9
        return false
      })
      if (!matchesRating) return false
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

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Sticky поисковая панель */}
      <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <SearchBar variant="sticky" />
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600">
            <span className="hover:underline cursor-pointer">Главная</span>
            {' > '}
            <span className="text-gray-900 font-medium">Все туры</span>
          </div>
        </div>
      </div>

      {/* Заголовок страницы */}
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

      {/* Фильтры и сортировка */}
      <div className="bg-white border-b sticky top-[72px] z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Быстрые фильтры */}
            <div className="flex items-center gap-3 flex-wrap">
              <button className="px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-900 transition-colors flex items-center gap-2">
                Любые даты
                <ChevronDown size={16} />
              </button>
              <button className="px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-900 transition-colors flex items-center gap-2">
                Длительность
                <ChevronDown size={16} />
              </button>
              <button className="px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-900 transition-colors flex items-center gap-2">
                Цена
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Кнопка фильтров */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              className="rounded-lg flex items-center gap-2"
            >
              <SlidersHorizontal size={18} />
              Фильтры
            </Button>
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

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Категории</h2>
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
                {sortedTours.length} предложени{sortedTours.length === 1 ? 'е' : sortedTours.length < 5 ? 'я' : 'й'}
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
