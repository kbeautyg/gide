import { useState, useEffect } from 'react'
import { DollarSign } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { QuickFilterButton } from './QuickFilterButton'
import { useNavigation } from '@/hooks/useNavigation'
import { cn } from '@/lib/utils'

const QUICK_PRICE_RANGES = [
  { label: 'До 1000₽', min: undefined, max: 1000 },
  { label: '1000-3000₽', min: 1000, max: 3000 },
  { label: '3000-5000₽', min: 3000, max: 5000 },
  { label: '5000+₽', min: 5000, max: undefined },
]

export function PriceFilterButton() {
  const navigation = useNavigation()
  const { state } = navigation
  const [isOpen, setIsOpen] = useState(false)
  const [localMin, setLocalMin] = useState<string>('')
  const [localMax, setLocalMax] = useState<string>('')

  // Синхронизируем локальное состояние с глобальным при открытии
  useEffect(() => {
    if (isOpen) {
      setLocalMin(state.price?.min?.toString() || '')
      setLocalMax(state.price?.max?.toString() || '')
    }
  }, [isOpen, state.price])

  const isActive = !!(state.price && (state.price.min !== undefined || state.price.max !== undefined))

  const formatLabel = () => {
    if (!state.price || (state.price.min === undefined && state.price.max === undefined)) {
      return 'Цена'
    }
    
    if (state.price.min !== undefined && state.price.max !== undefined) {
      return `${state.price.min}-${state.price.max}₽`
    }
    
    if (state.price.min !== undefined) {
      return `от ${state.price.min}₽`
    }
    
    if (state.price.max !== undefined) {
      return `до ${state.price.max}₽`
    }
    
    return 'Цена'
  }

  const handleQuickRange = (min: number | undefined, max: number | undefined) => {
    navigation.setPrice({
      min,
      max
    })
    setIsOpen(false)
  }

  const handleApply = () => {
    const min = localMin ? parseFloat(localMin) : undefined
    const max = localMax ? parseFloat(localMax) : undefined

    if (min === undefined && max === undefined) {
      navigation.setPrice(null)
    } else {
      navigation.setPrice({
        min: min !== undefined && min >= 0 ? min : undefined,
        max: max !== undefined && max >= 0 ? max : undefined
      })
    }
    setIsOpen(false)
  }

  const handleReset = () => {
    navigation.setPrice(null)
    setLocalMin('')
    setLocalMax('')
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div>
          <QuickFilterButton
            label={formatLabel()}
            icon={<DollarSign size={16} />}
            isActive={isActive}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[calc(100vw-32px)] sm:w-80 max-w-[320px] p-4 bg-white rounded-2xl shadow-lg" 
        align="start" 
        sideOffset={8}
        collisionPadding={16}
      >
        <div className="space-y-4">
          {/* Быстрые диапазоны */}
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-2">Быстрый выбор</div>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PRICE_RANGES.map((range) => {
                const isSelected = 
                  state.price?.min === range.min && 
                  state.price?.max === range.max
                
                return (
                  <button
                    key={range.label}
                    onClick={() => handleQuickRange(range.min, range.max)}
                    className={cn(
                      "px-3 py-2 text-sm rounded-lg border transition-all",
                      isSelected
                        ? "border-gray-900 bg-gray-50 font-semibold"
                        : "border-gray-200 hover:border-gray-400"
                    )}
                  >
                    {range.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Ручной ввод */}
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-2">Диапазон цен</div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="От"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                className="flex-1 w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:border-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="0"
              />
              <span className="text-gray-400 flex-shrink-0">—</span>
              <input
                type="number"
                placeholder="До"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                className="flex-1 w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:border-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="0"
              />
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            {isActive && (
              <button
                onClick={handleReset}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Сбросить
              </button>
            )}
            <button
              onClick={handleApply}
              className="ml-auto px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
            >
              Применить
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

