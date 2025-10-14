import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, MapPin, Minus, Plus, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DayPicker, DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { MobileSearchModal } from './MobileSearchModal'
import 'react-day-picker/dist/style.css'

type Tab = 'tours' | 'experiences'

interface SearchBarProps {
  variant?: 'hero' | 'sticky'
  className?: string
}

export function SearchBar({ variant = 'hero', className }: SearchBarProps) {
  const navigate = useNavigate()
  const [expandedField, setExpandedField] = useState<string | null>(null)
  const [searchData, setSearchData] = useState({
    where: '',
    adults: 1,
    children: 0,
  })
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [showMobileModal, setShowMobileModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
    
    navigate(`/tours${params.toString() ? '?' + params.toString() : ''}`)
    setExpandedField(null)
  }

  const isHero = variant === 'hero'

  // Мобильная версия - показать упрощённый поиск
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setShowMobileModal(true)}
          className={cn(
            "w-full bg-white border border-gray-300 rounded-full shadow-md flex items-center gap-3 transition-all hover:shadow-lg",
            isHero ? "px-6 py-4" : "px-4 py-3"
          )}
        >
          <Search size={20} className="text-gray-600" />
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-gray-900">
              {searchData.where || 'Куда вы хотите?'}
            </div>
            <div className="text-xs text-gray-500">
              {dateRange?.from ? format(dateRange.from, 'd MMM', { locale: ru }) : 'Любые даты'} • {searchData.adults + searchData.children} гост.
            </div>
          </div>
        </button>
        <MobileSearchModal isOpen={showMobileModal} onClose={() => setShowMobileModal(false)} />
      </>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {/* Поисковая панель */}
      <motion.div
        className={cn(
          "bg-white border border-gray-300 rounded-full shadow-airbnb flex items-center overflow-hidden",
          isHero ? "p-2" : "py-1.5 px-3"
        )}
        layout
      >
        {/* Поле "Куда" */}
        <div className="flex-1">
          <Popover open={expandedField === 'where'} onOpenChange={(open) => setExpandedField(open ? 'where' : null)}>
            <PopoverTrigger asChild>
              <button
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
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-4 bg-white rounded-2xl shadow-airbnb-lg" align="start" side="bottom">
              <Input
                placeholder="Введите город или страну"
                value={searchData.where}
                onChange={(e) => setSearchData({ ...searchData, where: e.target.value })}
                className="mb-3 border-gray-300"
                autoFocus
              />
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
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
            </PopoverContent>
          </Popover>
        </div>

        {/* Разделитель */}
        <div className="h-8 w-px bg-gray-300" />

        {/* Поле "Даты" с календарём */}
        <div className="flex-1 relative">
          <Popover open={expandedField === 'dates'} onOpenChange={(open) => setExpandedField(open ? 'dates' : null)}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full text-left px-4 py-3 rounded-full hover:bg-gray-100 transition-colors",
                  expandedField === 'dates' && "bg-white shadow-md"
                )}
              >
                <div className="text-xs font-semibold text-gray-900 flex items-center gap-1">
                  <CalendarIcon size={14} />
                  Даты
                </div>
                <div className="text-sm text-gray-600">
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
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white rounded-2xl shadow-airbnb-lg" align="start">
              <DayPicker
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={ru}
                disabled={{ before: new Date() }}
                className="p-4"
              />
              {/* Гибкие даты */}
              <div className="border-t border-gray-200 p-4">
                <div className="text-xs font-semibold text-gray-600 mb-2">Гибкие даты</div>
                <div className="flex gap-2 flex-wrap">
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
                    onClick={() => {
                      const today = new Date()
                      const saturday = new Date(today)
                      saturday.setDate(today.getDate() + (6 - today.getDay()))
                      const sunday = new Date(saturday)
                      sunday.setDate(saturday.getDate() + 1)
                      setDateRange({ from: saturday, to: sunday })
                    }}
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded-full hover:border-gray-900 transition-colors"
                  >
                    Выходные
                  </button>
                  <button 
                    onClick={() => setDateRange(undefined)}
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded-full hover:border-gray-900 transition-colors"
                  >
                    Сбросить
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Разделитель */}
        <div className="h-8 w-px bg-gray-300" />

        {/* Поле "Гости" */}
        <div className="flex-1">
          <Popover open={expandedField === 'guests'} onOpenChange={(open) => setExpandedField(open ? 'guests' : null)}>
            <PopoverTrigger asChild>
              <button
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
            </PopoverTrigger>
            <PopoverContent className="w-[380px] p-6 bg-white rounded-2xl shadow-airbnb-lg" align="end">
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
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-900"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium text-gray-900">{searchData.adults}</span>
                    <button
                      onClick={() => setSearchData({ ...searchData, adults: searchData.adults + 1 })}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors text-gray-900"
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
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-900"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium text-gray-900">{searchData.children}</span>
                    <button
                      onClick={() => setSearchData({ ...searchData, children: searchData.children + 1 })}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors text-gray-900"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Кнопка поиска - увеличенная, полупрозрачная */}
        <Button
          onClick={handleSearch}
          className="rounded-full bg-airbnb-rausch/90 backdrop-blur-sm hover:bg-airbnb-rausch hover:scale-110 hover:shadow-2xl text-white flex items-center justify-center transition-all w-16 h-16 p-0 ml-2"
        >
          <Search size={28} strokeWidth={2.5} />
        </Button>
      </motion.div>
    </div>
  )
}

