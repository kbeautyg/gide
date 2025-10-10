import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, MapPin, Calendar as CalendarIcon, Users, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DayPicker, DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

type Tab = 'tours' | 'experiences'

interface MobileSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('tours')
  const [activeField, setActiveField] = useState<'where' | 'when' | 'who'>('where')
  const [searchData, setSearchData] = useState({
    where: '',
    adults: 1,
    children: 0,
  })
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // Загрузка городов
  const { data: destinationsData } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => api.get('/destinations/').then(res => res.data),
  })

  const destinations = destinationsData || []
  const filteredDestinations = destinations.filter((dest: any) => 
    dest.name?.toLowerCase().includes(searchData.where.toLowerCase()) ||
    dest.country?.toLowerCase().includes(searchData.where.toLowerCase())
  ).slice(0, 8)

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    if (searchData.where) {
      params.append('location', searchData.where)
    }
    if (dateRange?.from) {
      params.append('date_start', format(dateRange.from, 'yyyy-MM-dd'))
    }
    if (dateRange?.to) {
      params.append('date_end', format(dateRange.to, 'yyyy-MM-dd'))
    }
    const totalGuests = searchData.adults + searchData.children
    if (totalGuests > 1) {
      params.append('guests', totalGuests.toString())
    }
    params.append('type', activeTab)
    
    navigate(`/tours${params.toString() ? '?' + params.toString() : ''}`)
    onClose()
  }

  const totalGuests = searchData.adults + searchData.children

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-white md:hidden"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b">
            <div className="flex items-center justify-between p-4">
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
              <h2 className="text-lg font-semibold">Поиск</h2>
              <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('tours')}
                className={cn(
                  "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === 'tours'
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500"
                )}
              >
                🏛️ Экскурсии
              </button>
              <button
                onClick={() => setActiveTab('experiences')}
                className={cn(
                  "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === 'experiences'
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500"
                )}
              >
                🎭 Впечатления
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto pb-24" style={{ height: 'calc(100vh - 140px)' }}>
            {/* Field: Куда */}
            <div className="border-b">
              <button
                onClick={() => setActiveField('where')}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-gray-400" />
                    <div>
                      <div className="text-xs font-semibold text-gray-500">Куда</div>
                      <div className="text-sm text-gray-900 mt-0.5">
                        {searchData.where || 'Поиск направлений'}
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded: Куда */}
              {activeField === 'where' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4 bg-gray-50"
                >
                  <Input
                    placeholder="Введите город или страну"
                    value={searchData.where}
                    onChange={(e) => setSearchData({ ...searchData, where: e.target.value })}
                    className="mb-3"
                    autoFocus
                  />
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {filteredDestinations.length > 0 ? (
                      filteredDestinations.map((dest: any) => (
                        <button
                          key={dest.id}
                          onClick={() => {
                            setSearchData({ ...searchData, where: dest.name })
                            setActiveField('when')
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-white rounded-lg flex items-center gap-3 transition-colors"
                        >
                          <MapPin size={18} className="text-airbnb-rausch" />
                          <div>
                            <div className="text-gray-900 font-medium">{dest.name}</div>
                            <div className="text-xs text-gray-500">{dest.country}</div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-sm text-center">
                        {searchData.where ? 'Нет результатов' : 'Начните вводить название'}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Field: Когда */}
            <div className="border-b">
              <button
                onClick={() => setActiveField('when')}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarIcon size={20} className="text-gray-400" />
                    <div>
                      <div className="text-xs font-semibold text-gray-500">Когда</div>
                      <div className="text-sm text-gray-900 mt-0.5">
                        {dateRange?.from ? (
                          dateRange.to ? (
                            `${format(dateRange.from, 'd MMM', { locale: ru })} - ${format(dateRange.to, 'd MMM', { locale: ru })}`
                          ) : (
                            format(dateRange.from, 'd MMM yyyy', { locale: ru })
                          )
                        ) : (
                          'Любые даты'
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded: Когда */}
              {activeField === 'when' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4 bg-gray-50"
                >
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                    locale={ru}
                    disabled={{ before: new Date() }}
                    className="mx-auto"
                  />
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button 
                      onClick={() => {
                        const today = new Date()
                        const nextWeek = new Date(today)
                        nextWeek.setDate(today.getDate() + 7)
                        setDateRange({ from: today, to: nextWeek })
                      }}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded-full hover:border-gray-900 transition-colors"
                    >
                      Эта неделя
                    </button>
                    <button 
                      onClick={() => setDateRange(undefined)}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded-full hover:border-gray-900 transition-colors"
                    >
                      Сбросить
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Field: Кто */}
            <div className="border-b">
              <button
                onClick={() => setActiveField('who')}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users size={20} className="text-gray-400" />
                    <div>
                      <div className="text-xs font-semibold text-gray-500">Кто</div>
                      <div className="text-sm text-gray-900 mt-0.5">
                        {totalGuests} гост{totalGuests === 1 ? 'ь' : totalGuests < 5 ? 'я' : 'ей'}
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded: Кто */}
              {activeField === 'who' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4 bg-gray-50 space-y-4"
                >
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
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-900"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-8 text-center font-medium text-gray-900">{searchData.adults}</span>
                      <button
                        onClick={() => setSearchData({ ...searchData, adults: searchData.adults + 1 })}
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors text-gray-900"
                      >
                        <Plus size={18} />
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
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-900"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-8 text-center font-medium text-gray-900">{searchData.children}</span>
                      <button
                        onClick={() => setSearchData({ ...searchData, children: searchData.children + 1 })}
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors text-gray-900"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Fixed Bottom Button */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 md:hidden">
            <Button
              onClick={handleSearch}
              className="w-full bg-airbnb-rausch hover:bg-airbnb-rausch/90 h-12 text-base flex items-center justify-center gap-2"
            >
              <Search size={20} />
              Искать
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

