import { useState } from 'react'
import { Users } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { QuickFilterButton } from './QuickFilterButton'
import { useNavigation } from '@/hooks/useNavigation'
import { cn } from '@/lib/utils'

const FORMATS = [
  { id: 'Групповые туры', label: 'Групповые туры' },
  { id: 'Индивидуальные туры', label: 'Индивидуальные туры' },
]

export function FormatFilterButton() {
  const navigation = useNavigation()
  const { state } = navigation
  const [isOpen, setIsOpen] = useState(false)

  const selectedFormats = state.format || []
  const isActive = selectedFormats.length > 0

  const formatLabel = () => {
    if (selectedFormats.length === 0) {
      return 'Формат проведения'
    }
    if (selectedFormats.length === 1) {
      return selectedFormats[0]
    }
    return `Формат: ${selectedFormats.length}`
  }

  const handleToggle = (formatId: string) => {
    navigation.toggleFormat(formatId)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div>
          <QuickFilterButton
            label={formatLabel()}
            icon={<Users size={16} />}
            isActive={isActive}
            count={selectedFormats.length > 0 ? selectedFormats.length : undefined}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 bg-white rounded-2xl shadow-lg" align="center">
        <div className="space-y-2">
          {FORMATS.map((format) => {
            const isSelected = selectedFormats.includes(format.id)
            return (
              <button
                key={format.id}
                onClick={() => handleToggle(format.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border transition-all",
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
        {selectedFormats.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                selectedFormats.forEach(format => navigation.toggleFormat(format))
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

