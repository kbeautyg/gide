import { useState } from 'react'
import { Car } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { QuickFilterButton } from './QuickFilterButton'
import { useNavigation } from '@/hooks/useNavigation'
import { cn } from '@/lib/utils'

const TRANSPORTATION_OPTIONS = [
  { id: 'Пешком', label: 'Пешком' },
  { id: 'На транспорте', label: 'На транспорте' },
  { id: 'На лодке', label: 'На лодке' },
  { id: 'На велосипеде', label: 'На велосипеде' },
]

export function TransportationFilterButton() {
  const navigation = useNavigation()
  const { state } = navigation
  const [isOpen, setIsOpen] = useState(false)

  const selectedTransportation = state.transportation || []
  const isActive = selectedTransportation.length > 0

  const formatLabel = () => {
    if (selectedTransportation.length === 0) {
      return 'Способ передвижения'
    }
    if (selectedTransportation.length === 1) {
      return selectedTransportation[0]
    }
    return `Способ: ${selectedTransportation.length}`
  }

  const handleToggle = (transportationId: string) => {
    navigation.toggleTransportation(transportationId)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div>
          <QuickFilterButton
            label={formatLabel()}
            icon={<Car size={16} />}
            isActive={isActive}
            count={selectedTransportation.length > 0 ? selectedTransportation.length : undefined}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 bg-white rounded-2xl shadow-lg" align="center">
        <div className="space-y-2">
          {TRANSPORTATION_OPTIONS.map((option) => {
            const isSelected = selectedTransportation.includes(option.id)
            return (
              <button
                key={option.id}
                onClick={() => handleToggle(option.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border transition-all",
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
        {selectedTransportation.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                selectedTransportation.forEach(t => navigation.toggleTransportation(t))
                setIsOpen(false)
              }}
              className="w-full text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Сбросить
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

