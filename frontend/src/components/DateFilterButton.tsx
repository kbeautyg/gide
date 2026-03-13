import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Minus, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { DayPicker, DateRange } from 'react-day-picker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { QuickFilterButton } from './QuickFilterButton'
import { useNavigation } from '@/hooks/useNavigation'
import 'react-day-picker/dist/style.css'

export function DateFilterButton() {
  const navigation = useNavigation()
  const { state } = navigation
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])


  const dateRange: DateRange | undefined = state.dateRange
    ? {
        from: state.dateRange.from,
        to: state.dateRange.to
      }
    : undefined

  const guests = state.guests || 1

  const formatDateRange = () => {
    if (!dateRange?.from) {
      return `Любые даты, ${guests} ${guests === 1 ? 'чел.' : 'чел.'}`
    }
    
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'd MMM', { locale: ru })} - ${format(dateRange.to, 'd MMM', { locale: ru })}, ${guests} ${guests === 1 ? 'чел.' : 'чел.'}`
    }
    
    if (dateRange.from) {
      return `${format(dateRange.from, 'd MMM', { locale: ru })}, ${guests} ${guests === 1 ? 'чел.' : 'чел.'}`
    }
    
    return `Любые даты, ${guests} ${guests === 1 ? 'чел.' : 'чел.'}`
  }

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      navigation.setDateRange({ from: range.from, to: range.to })
    } else if (range?.from) {
      navigation.setDateRange({ from: range.from })
    } else {
      navigation.setDateRange(null)
    }
  }

  const handleGuestsChange = (delta: number) => {
    const newGuests = Math.max(1, Math.min(20, guests + delta))
    navigation.setGuests(newGuests)
  }

  const isActive = !!dateRange?.from || guests !== 1

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div>
          <QuickFilterButton
            label={formatDateRange()}
            icon={<CalendarIcon size={16} />}
            isActive={isActive}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white rounded-2xl shadow-lg" align="center">
        <div className="p-4">
          {/* Календарь */}
          <DayPicker
            mode="range"
            selected={dateRange}
            onSelect={handleDateSelect}
            numberOfMonths={isMobile ? 1 : 2}
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
                  handleDateSelect({ from: today, to: nextWeek })
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
                  handleDateSelect({ from: saturday, to: sunday })
                }}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-full hover:border-gray-900 transition-colors"
              >
                Выходные
              </button>
              <button 
                onClick={() => handleDateSelect(undefined)}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-full hover:border-gray-900 transition-colors"
              >
                Очистить
              </button>
            </div>
          </div>

          {/* Количество участников */}
          <div className="border-t border-gray-200 p-4">
            <div className="text-xs font-semibold text-gray-600 mb-3">Участники</div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleGuestsChange(-1)}
                disabled={guests <= 1}
                className="p-2 rounded-full border border-gray-300 hover:border-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="text-lg font-semibold min-w-[2rem] text-center">{guests}</span>
              <button
                onClick={() => handleGuestsChange(1)}
                disabled={guests >= 20}
                className="p-2 rounded-full border border-gray-300 hover:border-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Кнопка применить */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Применить
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

