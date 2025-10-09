import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

type Tab = 'tours' | 'experiences'

interface SearchBarProps {
  variant?: 'hero' | 'sticky'
  className?: string
}

export function SearchBar({ variant = 'hero', className }: SearchBarProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('tours')
  const [expandedField, setExpandedField] = useState<string | null>(null)
  const [searchData, setSearchData] = useState({
    where: '',
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
  })

  // Загрузка городов из API
  const { data: destinationsData } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => api.get('/destinations/').then(res => res.data),
  })

  const destinations = destinationsData || []
  
  // Фильтрация городов по вводу
  const filteredDestinations = destinations.filter((dest: any) => 
    dest.name?.toLowerCase().includes(searchData.where.toLowerCase()) ||
    dest.country?.toLowerCase().includes(searchData.where.toLowerCase())
  ).slice(0, 5)

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    if (searchData.where) {
      params.append('location', searchData.where)
    }
    if (searchData.checkIn) {
      params.append('date_from', searchData.checkIn)
    }
    if (searchData.checkOut) {
      params.append('date_to', searchData.checkOut)
    }
    const totalGuests = searchData.adults + searchData.children
    if (totalGuests > 1) {
      params.append('guests', totalGuests.toString())
    }
    
    navigate(`/tours${params.toString() ? '?' + params.toString() : ''}`)
    setExpandedField(null)
  }

  const isHero = variant === 'hero'

  return (
    <div className={cn("relative", className)}>
      {/* Табы с фонами */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setActiveTab('tours')}
          className={cn(
            "px-6 py-2.5 text-base font-semibold transition-all rounded-full",
            activeTab === 'tours' 
              ? "bg-airbnb-rausch text-white shadow-md" 
              : "bg-white/90 backdrop-blur-sm text-white/95 border border-white/40 hover:bg-white/95 hover:text-gray-900"
          )}
        >
          Экскурсии
        </button>
        
        <button
          onClick={() => setActiveTab('experiences')}
          className={cn(
            "px-6 py-2.5 text-base font-semibold transition-all rounded-full",
            activeTab === 'experiences' 
              ? "bg-airbnb-rausch text-white shadow-md" 
              : "bg-white/90 backdrop-blur-sm text-white/95 border border-white/40 hover:bg-white/95 hover:text-gray-900"
          )}
        >
          Впечатления
        </button>
      </div>

      {/* Поисковая панель */}
      <motion.div
        className={cn(
          "bg-white border border-gray-300 rounded-full shadow-airbnb flex items-center overflow-hidden",
          isHero ? "p-2" : "py-1.5 px-3"
        )}
        layout
      >
        {/* Поле "Куда" */}
        <div className="flex-1 relative">
          <button
            onClick={() => setExpandedField(expandedField === 'where' ? null : 'where')}
            className={cn(
              "w-full text-left px-4 py-3 rounded-full hover:bg-gray-100 transition-colors",
              expandedField === 'where' && "bg-white shadow-md"
            )}
          >
            <div className="text-xs font-semibold text-gray-900">Куда</div>
            <div className="text-sm text-gray-600 truncate">
              {searchData.where || 'Поиск направлений'}
            </div>
          </button>

          {/* Dropdown с подсказками */}
          <AnimatePresence>
            {expandedField === 'where' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-airbnb-lg p-4 z-50 min-w-[400px]"
              >
                <Input
                  placeholder="Введите город или страну"
                  value={searchData.where}
                  onChange={(e) => setSearchData({ ...searchData, where: e.target.value })}
                  className="mb-3 border-gray-300"
                  autoFocus
                />
                <div className="space-y-1">
                  {filteredDestinations.length > 0 ? (
                    filteredDestinations.map((dest: any) => (
                      <button
                        key={dest.id}
                        onClick={() => {
                          setSearchData({ ...searchData, where: dest.name })
                          setExpandedField(null)
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors"
                      >
                        <MapPin size={18} className="text-airbnb-rausch" />
                        <div>
                          <div className="text-gray-900 font-medium">{dest.name}</div>
                          <div className="text-xs text-gray-500">{dest.country}</div>
                        </div>
                      </button>
                    ))
                  ) : searchData.where ? (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      Нет результатов
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      Начните вводить название города
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Разделитель */}
        <div className="h-8 w-px bg-gray-300" />

        {/* Поле "Даты" */}
        <div className="flex-1">
          <button
            onClick={() => setExpandedField(expandedField === 'dates' ? null : 'dates')}
            className={cn(
              "w-full text-left px-4 py-3 rounded-full hover:bg-gray-100 transition-colors",
              expandedField === 'dates' && "bg-white shadow-md"
            )}
          >
            <div className="text-xs font-semibold text-gray-900">Даты</div>
            <div className="text-sm text-gray-600">
              {searchData.checkIn && searchData.checkOut 
                ? `${new Date(searchData.checkIn).toLocaleDateString('ru')} - ${new Date(searchData.checkOut).toLocaleDateString('ru')}`
                : 'Когда?'
              }
            </div>
          </button>
        </div>

        {/* Разделитель */}
        <div className="h-8 w-px bg-gray-300" />

        {/* Поле "Гости" */}
        <div className="flex-1">
          <button
            onClick={() => setExpandedField(expandedField === 'guests' ? null : 'guests')}
            className={cn(
              "w-full text-left px-4 py-3 rounded-full hover:bg-gray-100 transition-colors",
              expandedField === 'guests' && "bg-white shadow-md"
            )}
          >
            <div className="text-xs font-semibold text-gray-900">Гости</div>
            <div className="text-sm text-gray-600">
              {searchData.adults + searchData.children > 0 
                ? `${searchData.adults + searchData.children} гост${searchData.adults + searchData.children === 1 ? 'ь' : searchData.adults + searchData.children < 5 ? 'я' : 'ей'}` 
                : 'Кто едет?'}
            </div>
          </button>

          {/* Dropdown с степпером */}
          <AnimatePresence>
            {expandedField === 'guests' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-airbnb-lg p-6 z-50 min-w-[380px]"
              >
                <div className="space-y-6">
                  {/* Взрослые */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">Взрослые</div>
                      <div className="text-sm text-gray-600">От 13 лет</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSearchData({ ...searchData, adults: Math.max(1, searchData.adults - 1) })}
                        disabled={searchData.adults === 1}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium">{searchData.adults}</span>
                      <button
                        onClick={() => setSearchData({ ...searchData, adults: searchData.adults + 1 })}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Дети */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">Дети</div>
                      <div className="text-sm text-gray-600">0-12 лет</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSearchData({ ...searchData, children: Math.max(0, searchData.children - 1) })}
                        disabled={searchData.children === 0}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium">{searchData.children}</span>
                      <button
                        onClick={() => setSearchData({ ...searchData, children: searchData.children + 1 })}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Кнопка поиска - только иконка, увеличенная */}
        <Button
          onClick={handleSearch}
          className="rounded-full bg-airbnb-rausch hover:bg-airbnb-rausch/90 hover:scale-110 hover:shadow-xl text-white flex items-center justify-center transition-all w-14 h-14 p-0"
        >
          <Search size={24} />
        </Button>
      </motion.div>
    </div>
  )
}

