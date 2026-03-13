import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, MapPin, Calendar as CalendarIcon, Users, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface MobileSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
  const navigate = useNavigate()
  const [activeField, setActiveField] = useState<'where' | 'when' | 'who'>('where')
  const [searchData, setSearchData] = useState({
    where: '',
    adults: 1,
    children: 0,
  })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)

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
    if (selectedDate) {
      params.append('date', format(selectedDate, 'yyyy-MM-dd'))
    }
    const totalGuests = searchData.adults + searchData.children
    if (totalGuests > 1) {
      params.append('guests', totalGuests.toString())
    }
    
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
              <button onClick={onClose} aria-label="Закрыть поиск" className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
              <h2 className="text-lg font-semibold">Поиск экскурсий</h2>
              <div className="w-10" /> {/* Spacer */}
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto pb-24" style={{ height: 'calc(100vh - 80px)' }}>
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
                    aria-label="Поиск по городу или стране"
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
                        {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: ru }) : 'Любая дата'}
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
                  <div className="space-y-2 mt-3">
                    {/* Быстрый выбор дат */}
                    {[
                      { label: 'Сегодня', days: 0 },
                      { label: 'Завтра', days: 1 },
                      { label: 'Через 2 дня', days: 2 },
                      { label: 'Через 3 дня', days: 3 },
                      { label: 'Эта неделя', days: 7 },
                      { label: 'Следующая неделя', days: 14 },
                    ].map((option) => {
                      const date = new Date()
                      date.setDate(date.getDate() + option.days)
                      const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                      
                      return (
                        <button
                          key={option.label}
                          onClick={() => setSelectedDate(date)}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-xl transition-all",
                            isSelected
                              ? "bg-airbnb-rausch text-white shadow-md"
                              : "bg-white hover:bg-gray-100"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className={cn("font-semibold", isSelected ? "text-white" : "text-gray-900")}>
                                {option.label}
                              </div>
                              <div className={cn("text-sm", isSelected ? "text-white/90" : "text-gray-600")}>
                                {format(date, 'd MMMM, EEEE', { locale: ru })}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                    
                    {/* Кнопка показать календарь */}
                    <button 
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="w-full px-4 py-3 text-center text-sm font-medium bg-white border-2 border-gray-300 rounded-xl hover:border-airbnb-rausch hover:text-airbnb-rausch transition-colors"
                    >
                      {showCalendar ? 'Скрыть календарь' : 'Выбрать другую дату'}
                    </button>

                    {/* Календарь */}
                    {showCalendar && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white rounded-xl p-4 shadow-md mt-2"
                      >
                        {/* Навигация по месяцам */}
                        <div className="flex items-center justify-between mb-4">
                          <button
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <div className="font-semibold text-gray-900">
                            {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                          </div>
                          <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </div>

                        {/* Дни недели */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Дни месяца */}
                        <div className="grid grid-cols-7 gap-1">
                          {(() => {
                            const monthStart = startOfMonth(currentMonth)
                            const monthEnd = endOfMonth(currentMonth)
                            const startDate = startOfWeek(monthStart, { locale: ru })
                            const endDate = endOfWeek(monthEnd, { locale: ru })
                            const days = eachDayOfInterval({ start: startDate, end: endDate })
                            const today = new Date()

                            return days.map((day, i) => {
                              const isCurrentMonth = isSameMonth(day, currentMonth)
                              const isSelected = selectedDate && isSameDay(day, selectedDate)
                              const isToday = isSameDay(day, today)
                              const isPast = day < today && !isSameDay(day, today)

                              return (
                                <button
                                  key={i}
                                  onClick={() => {
                                    if (!isPast) {
                                      setSelectedDate(day)
                                      setShowCalendar(false)
                                    }
                                  }}
                                  disabled={isPast}
                                  className={cn(
                                    "aspect-square flex items-center justify-center text-sm rounded-lg transition-all",
                                    !isCurrentMonth && "text-gray-300",
                                    isCurrentMonth && !isSelected && !isPast && "text-gray-900 hover:bg-gray-100",
                                    isSelected && "bg-airbnb-rausch text-white font-semibold shadow-md",
                                    isToday && !isSelected && "bg-blue-50 text-blue-600 font-semibold",
                                    isPast && "text-gray-300 cursor-not-allowed"
                                  )}
                                >
                                  {format(day, 'd')}
                                </button>
                              )
                            })
                          })()}
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Сбросить */}
                    <button 
                      onClick={() => {
                        setSelectedDate(undefined)
                        setShowCalendar(false)
                      }}
                      className="w-full px-4 py-3 text-center text-sm font-medium text-gray-600 hover:text-airbnb-rausch transition-colors"
                    >
                      Любая дата
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

