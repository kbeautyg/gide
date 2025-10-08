import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterState) => void
}

interface FilterState {
  priceRange: [number, number]
  categories: string[]
  duration: string
  rating: number
  included: string[]
}

const CATEGORIES = [
  { id: 'culture', name: 'Культура', icon: '🏛️' },
  { id: 'nature', name: 'Природа', icon: '🏞️' },
  { id: 'food', name: 'Гастро', icon: '🍴' },
  { id: 'adventure', name: 'Приключения', icon: '⛰️' },
  { id: 'family', name: 'Для семей', icon: '👨‍👩‍👧' },
  { id: 'photo', name: 'Фотосессия', icon: '📸' },
]

const DURATIONS = [
  { id: 'short', label: 'До 3 часов' },
  { id: 'medium', label: '3-6 часов' },
  { id: 'long', label: '6+ часов' },
]

const INCLUDED = [
  { id: 'transfer', label: 'Трансфер' },
  { id: 'lunch', label: 'Обед' },
  { id: 'tickets', label: 'Входные билеты' },
  { id: 'guide', label: 'Гид' },
]

export function FilterPanel({ isOpen, onClose, onApply }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 10000],
    categories: [],
    duration: '',
    rating: 0,
    included: [],
  })

  const toggleCategory = (id: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    }))
  }

  const toggleIncluded = (id: string) => {
    setFilters((prev) => ({
      ...prev,
      included: prev.included.includes(id)
        ? prev.included.filter((i) => i !== id)
        : [...prev.included, id],
    }))
  }

  const resetFilters = () => {
    setFilters({
      priceRange: [0, 10000],
      categories: [],
      duration: '',
      rating: 0,
      included: [],
    })
  }

  const activeFiltersCount = 
    filters.categories.length + 
    (filters.duration ? 1 : 0) +
    (filters.rating > 0 ? 1 : 0) +
    filters.included.length

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Оверлей */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Панель */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-airbnb-lg z-50 flex flex-col"
          >
            {/* Заголовок */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <SlidersHorizontal size={20} />
                Фильтры
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Контент с прокруткой */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Диапазон цен */}
              <div>
                <h3 className="font-semibold mb-4">Диапазон цен</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="От"
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters({
                      ...filters,
                      priceRange: [Number(e.target.value), filters.priceRange[1]]
                    })}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="number"
                    placeholder="До"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({
                      ...filters,
                      priceRange: [filters.priceRange[0], Number(e.target.value)]
                    })}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Категории */}
              <div>
                <h3 className="font-semibold mb-4">Категории</h3>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left",
                        filters.categories.includes(cat.id)
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-400"
                      )}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Длительность */}
              <div>
                <h3 className="font-semibold mb-4">Длительность</h3>
                <div className="space-y-2">
                  {DURATIONS.map((dur) => (
                    <button
                      key={dur.id}
                      onClick={() => setFilters({ ...filters, duration: dur.id })}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg border transition-all",
                        filters.duration === dur.id
                          ? "border-gray-900 bg-gray-50 font-semibold"
                          : "border-gray-200 hover:border-gray-400"
                      )}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Рейтинг */}
              <div>
                <h3 className="font-semibold mb-4">Минимальный рейтинг</h3>
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5, 0].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setFilters({ ...filters, rating })}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg border transition-all",
                        filters.rating === rating
                          ? "border-gray-900 bg-gray-50 font-semibold"
                          : "border-gray-200 hover:border-gray-400"
                      )}
                    >
                      {rating > 0 ? `${rating}+ звёзд` : 'Любой рейтинг'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Что включено */}
              <div>
                <h3 className="font-semibold mb-4">Что включено в цену</h3>
                <div className="space-y-2">
                  {INCLUDED.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={filters.included.includes(item.id)}
                        onChange={() => toggleIncluded(item.id)}
                        className="w-5 h-5 rounded border-gray-300 text-airbnb-rausch focus:ring-airbnb-rausch"
                      />
                      <span className="text-sm group-hover:text-gray-900 transition-colors">
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Футер с кнопками */}
            <div className="p-6 border-t flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={resetFilters}
                className="underline"
              >
                Сбросить
              </Button>
              <Button
                onClick={() => {
                  onApply(filters)
                  onClose()
                }}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                Применить {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

