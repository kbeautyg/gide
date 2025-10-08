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

export default function ToursPage() {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('popular')

  // Загрузка категорий
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/v1/tours/categories').then(res => res.json()),
  })

  // Загрузка экскурсий
  const { data: toursData, isLoading } = useQuery({
    queryKey: ['tours', selectedThemes],
    queryFn: () => toursApi.getList({
      page: 1,
      page_size: 50,
      // Добавим фильтрацию по темам и форматам когда бэк будет готов
    }),
  })

  const tours = toursData?.data?.tours || []

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
        <div className="container mx-auto px-4 py-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Рубрики</h2>
          <CategoryChips
            categories={themeCategories}
            selected={selectedThemes}
            onSelect={handleThemeSelect}
            maxVisible={12}
          />
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
                {tours.length} предложени{tours.length === 1 ? 'е' : tours.length < 5 ? 'я' : 'й'}
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
                <div key={i} className="skeleton rounded-xl h-[400px]" />
              ))}
            </div>
          ) : tours.length === 0 ? (
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
              {tours.map((tour) => (
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
