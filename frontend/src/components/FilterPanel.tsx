import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, SlidersHorizontal, Calendar as CalendarIcon, Users, Car, Minus, Plus } from 'lucide-react'
import { DayPicker, DateRange } from 'react-day-picker'
import { ru } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useNavigation } from '@/hooks/useNavigation'
import 'react-day-picker/dist/style.css'

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  onApply: () => void
}

const DURATIONS = [
  { id: 'short', label: 'До 3 часов', min: 0, max: 3 },
  { id: 'medium', label: '3-6 часов', min: 3, max: 6 },
  { id: 'long', label: '6+ часов', min: 6, max: undefined },
]

const FORMATS = [
  { id: 'Групповые туры', label: 'Групповые туры' },
  { id: 'Индивидуальные туры', label: 'Индивидуальные туры' },
]

const TRANSPORTATION_OPTIONS = [
  { id: 'Пешком', label: 'Пешком' },
  { id: 'На транспорте', label: 'На транспорте' },
  { id: 'На лодке', label: 'На лодке' },
  { id: 'На велосипеде', label: 'На велосипеде' },
]

export function FilterPanel({ 
  isOpen, 
  onClose, 
  onApply
}: FilterPanelProps) {
  const navigation = useNavigation()
  const { state } = navigation

  // Блокируем скролл body при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      // Сохраняем текущее значение overflow
      const originalOverflow = document.body.style.overflow
      const originalPosition = document.body.style.position
      
      // Блокируем скролл
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      
      return () => {
        // Восстанавливаем при закрытии
        document.body.style.overflow = originalOverflow
        document.body.style.position = originalPosition
        document.body.style.width = ''
      }
    }
  }, [isOpen])

  // Локальное состояние для фильтров панели
  const [priceRange, setPriceRange] = useState<[number, number]>([
    state.price?.min || 0,
    state.price?.max || 10000
  ])
  
  const [selectedDuration, setSelectedDuration] = useState<string>('')
  
  const [rating, setRating] = useState<number>(
    state.rating?.min || 0
  )
  
  const [guests, setGuests] = useState<number | null>(
    state.guests || null
  )

  const [localDateRange, setLocalDateRange] = useState<DateRange | undefined>(
    state.dateRange ? { from: state.dateRange.from, to: state.dateRange.to } : undefined
  )

  const [localFormats, setLocalFormats] = useState<string[]>(state.format || [])
  const [localTransportation, setLocalTransportation] = useState<string[]>(state.transportation || [])

  // Синхронизируем с navigation state при открытии
  useEffect(() => {
    if (isOpen) {
      setPriceRange([
        state.price?.min || 0,
        state.price?.max || 10000
      ])
      
      // Определяем выбранную длительность из state.duration
      if (state.duration) {
        if (state.duration.min === 0 && state.duration.max === 3) {
          setSelectedDuration('short')
        } else if (state.duration.min === 3 && state.duration.max === 6) {
          setSelectedDuration('medium')
        } else if (state.duration.min === 6 && !state.duration.max) {
          setSelectedDuration('long')
        } else {
          setSelectedDuration('')
        }
      } else {
        setSelectedDuration('')
      }
      
      setRating(state.rating?.min || 0)
      setGuests(state.guests || null)
      setLocalDateRange(state.dateRange ? { from: state.dateRange.from, to: state.dateRange.to } : undefined)
      setLocalFormats(state.format || [])
      setLocalTransportation(state.transportation || [])
    }
  }, [isOpen, state.price, state.duration, state.rating, state.guests, state.dateRange, state.format, state.transportation])

  const handleApply = () => {
    // Применяем фильтры через navigation
    const minPrice = priceRange[0] > 0 ? priceRange[0] : undefined
    const maxPrice = priceRange[1] < 10000 ? priceRange[1] : undefined
    
    // Если оба значения не заданы, сбрасываем фильтр
    if (minPrice === undefined && maxPrice === undefined) {
      navigation.setPrice(null)
    } else {
      navigation.setPrice({
        min: minPrice,
        max: maxPrice
      })
    }
    
    if (selectedDuration) {
      const durationOption = DURATIONS.find(d => d.id === selectedDuration)
      if (durationOption) {
        navigation.setDuration({
          min: durationOption.min,
          max: durationOption.max
        })
      }
    } else {
      navigation.setDuration(null)
    }
    
    if (rating > 0) {
      navigation.setRating({ min: rating })
    } else {
      navigation.setRating(null)
    }
    
    if (guests && guests > 0) {
      navigation.setGuests(guests)
    } else {
      navigation.setGuests(null)
    }

    // Применяем даты
    if (localDateRange?.from && localDateRange?.to) {
      navigation.setDateRange({ from: localDateRange.from, to: localDateRange.to })
    } else if (localDateRange?.from) {
      navigation.setDateRange({ from: localDateRange.from })
    } else {
      navigation.setDateRange(null)
    }

    // Применяем форматы
    navigation.setFormat(localFormats)

    // Применяем способы передвижения
    navigation.setTransportation(localTransportation)
    
    onApply()
  }

  const handleReset = () => {
    setPriceRange([0, 10000])
    setSelectedDuration('')
    setRating(0)
    setGuests(null)
    
    // Сбрасываем через navigation
    navigation.setPrice(null)
    navigation.setDuration(null)
    navigation.setRating(null)
    navigation.setGuests(null)
    navigation.setDateRange(null)
    navigation.setFormat([])
    navigation.setTransportation([])
    setLocalDateRange(undefined)
    setLocalFormats([])
    setLocalTransportation([])
    // Также сбрасываем рубрики и достопримечательности
    state.themes.forEach(theme => navigation.removeTheme(theme))
    state.landmarks.forEach(landmark => navigation.removeLandmark(landmark))
    state.tags.forEach(tag => navigation.removeTag(tag))
  }

  const activeFiltersCount = 
    state.themes.length +
    state.landmarks.length +
    state.tags.length +
    (state.price ? 1 : 0) +
    (state.duration ? 1 : 0) +
    (state.rating ? 1 : 0) +
    (state.guests !== null ? 1 : 0) +
    (state.dateRange ? 1 : 0) +
    state.format.length +
    state.transportation.length +
    (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0) +
    (selectedDuration ? 1 : 0) +
    (rating > 0 ? 1 : 0) +
    (guests !== null && guests > 0 ? 1 : 0)

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
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-airbnb-lg z-50 flex flex-col overflow-hidden"
          >
            {/* Заголовок */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <SlidersHorizontal size={20} />
                Фильтры
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
              >
                <X size={20} />
              </button>
            </div>

            {/* Контент с прокруткой */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-full">
              {/* Даты и гости */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <CalendarIcon size={18} />
                  Даты и количество гостей
                </h3>
                <div className="space-y-4">
                  <div className="w-full flex justify-center">
                    <DayPicker
                      mode="range"
                      selected={localDateRange}
                      onSelect={(range) => setLocalDateRange(range)}
                      locale={ru}
                      className="rounded-lg"
                      classNames={{
                        months: 'flex flex-col space-y-4',
                        month: 'space-y-4',
                        caption: 'flex justify-center pt-1 relative items-center',
                        caption_label: 'text-sm font-medium',
                        nav: 'space-x-1 flex items-center',
                        nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                        nav_button_previous: 'absolute left-1',
                        nav_button_next: 'absolute right-1',
                        table: 'w-full border-collapse space-y-1',
                        head_row: 'flex',
                        head_cell: 'text-gray-500 rounded-md w-9 font-normal text-[0.8rem]',
                        row: 'flex w-full mt-2',
                        cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-100 [&:has([aria-selected])]:bg-gray-200 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                        day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
                        day_range_end: 'day-range-end',
                        day_selected: 'bg-gray-900 text-white hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white',
                        day_today: 'bg-gray-100 text-gray-900',
                        day_outside: 'day-outside text-gray-400 opacity-50 aria-selected:bg-gray-100 aria-selected:text-gray-400 aria-selected:opacity-30',
                        day_disabled: 'text-gray-400 opacity-50',
                        day_range_middle: 'aria-selected:bg-gray-200 aria-selected:text-gray-900',
                        day_hidden: 'invisible',
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Гостей:</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setGuests(Math.max(1, (guests || 1) - 1))}
                        className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-lg font-semibold min-w-[3rem] text-center">{guests || 1}</span>
                      <button
                        onClick={() => setGuests((guests || 1) + 1)}
                        className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Формат проведения */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <Users size={18} />
                  Формат проведения
                </h3>
                <div className="space-y-2">
                  {FORMATS.map((format) => {
                    const isSelected = localFormats.includes(format.id)
                    return (
                      <button
                        key={format.id}
                        onClick={() => {
                          if (isSelected) {
                            setLocalFormats(localFormats.filter(f => f !== format.id))
                          } else {
                            setLocalFormats([...localFormats, format.id])
                          }
                        }}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-lg border transition-all min-h-[44px] touch-manipulation",
                          isSelected
                            ? "border-gray-900 bg-gray-50 font-semibold"
                            : "border-gray-200 hover:border-gray-400"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span>{format.label}</span>
                          {isSelected && (
                            <span className="text-gray-900">✓</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Способ передвижения */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <Car size={18} />
                  Способ передвижения
                </h3>
                <div className="space-y-2">
                  {TRANSPORTATION_OPTIONS.map((option) => {
                    const isSelected = localTransportation.includes(option.id)
                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          if (isSelected) {
                            setLocalTransportation(localTransportation.filter(t => t !== option.id))
                          } else {
                            setLocalTransportation([...localTransportation, option.id])
                          }
                        }}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-lg border transition-all min-h-[44px] touch-manipulation",
                          isSelected
                            ? "border-gray-900 bg-gray-50 font-semibold"
                            : "border-gray-200 hover:border-gray-400"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option.label}</span>
                          {isSelected && (
                            <span className="text-gray-900">✓</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Выбранные рубрики */}
              {state.themes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-sm text-gray-700">Выбранные рубрики</h3>
                  <div className="flex flex-wrap gap-2">
                    {state.themes.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => navigation.removeTheme(theme)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-airbnb-rausch text-white rounded-full text-sm font-medium hover:bg-airbnb-rausch/90 transition-colors"
                      >
                        {theme}
                        <X size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Выбранные достопримечательности */}
              {state.landmarks.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-sm text-gray-700">Выбранные достопримечательности</h3>
                  <div className="flex flex-wrap gap-2">
                    {state.landmarks.map((landmark) => (
                      <button
                        key={landmark}
                        onClick={() => navigation.removeLandmark(landmark)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-airbnb-rausch text-white rounded-full text-sm font-medium hover:bg-airbnb-rausch/90 transition-colors"
                      >
                        {landmark}
                        <X size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Выбранные форматы */}
              {state.format.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-sm text-gray-700">Выбранные форматы</h3>
                  <div className="flex flex-wrap gap-2">
                    {state.format.map((format) => (
                      <button
                        key={format}
                        onClick={() => navigation.toggleFormat(format)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-airbnb-rausch text-white rounded-full text-sm font-medium hover:bg-airbnb-rausch/90 transition-colors"
                      >
                        {format}
                        <X size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Выбранные способы передвижения */}
              {state.transportation.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-sm text-gray-700">Выбранные способы передвижения</h3>
                  <div className="flex flex-wrap gap-2">
                    {state.transportation.map((transportation) => (
                      <button
                        key={transportation}
                        onClick={() => navigation.toggleTransportation(transportation)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-airbnb-rausch text-white rounded-full text-sm font-medium hover:bg-airbnb-rausch/90 transition-colors"
                      >
                        {transportation}
                        <X size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Диапазон цен */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Диапазон цен</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="От"
                    value={priceRange[0] > 0 ? priceRange[0] : ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Number(e.target.value) || 0
                      setPriceRange([value, priceRange[1]])
                    }}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px]"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="number"
                    placeholder="До"
                    value={priceRange[1] < 10000 ? priceRange[1] : ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 10000 : Number(e.target.value) || 10000
                      setPriceRange([priceRange[0], value])
                    }}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px]"
                  />
                </div>
              </div>

              {/* Длительность */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Длительность</h3>
                <div className="space-y-2">
                  {DURATIONS.map((dur) => (
                    <button
                      key={dur.id}
                      onClick={() => setSelectedDuration(selectedDuration === dur.id ? '' : dur.id)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg border transition-all",
                        selectedDuration === dur.id
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
                <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Минимальный рейтинг</h3>
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5, 0].map((ratingValue) => (
                    <button
                      key={ratingValue}
                      onClick={() => setRating(rating === ratingValue ? 0 : ratingValue)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg border transition-all",
                        rating === ratingValue
                          ? "border-gray-900 bg-gray-50 font-semibold"
                          : "border-gray-200 hover:border-gray-400"
                      )}
                    >
                      {ratingValue > 0 ? `${ratingValue}+ звёзд` : 'Любой рейтинг'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Количество гостей */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Количество гостей</h3>
                <input
                  type="number"
                  placeholder="Количество гостей"
                  min="1"
                  value={guests || ''}
                  onChange={(e) => setGuests(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px]"
                />
              </div>
              </div>
            </div>

            {/* Футер с кнопками */}
            <div className="p-4 sm:p-6 border-t flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full sm:w-auto min-h-[48px] touch-manipulation font-semibold"
              >
                Сбросить
              </Button>
              <Button
                onClick={() => {
                  handleApply()
                  onClose()
                }}
                className="w-full flex-1 bg-gray-900 hover:bg-gray-800 text-white min-h-[48px] touch-manipulation font-bold text-base shadow-lg"
              >
                Показать {activeFiltersCount > 0 ? `(${activeFiltersCount})` : 'результаты'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
