import { motion } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Category {
  name: string
  count: number
}

interface CategoryChipsProps {
  categories: Category[]
  selected: string[]
  onSelect: (category: string) => void
}

export function CategoryChips({ 
  categories, 
  selected, 
  onSelect
}: CategoryChipsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
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

  // Автоцентрирование выбранных рубрик
  useEffect(() => {
    if (!containerRef.current || selected.length === 0) return

    // Находим первую выбранную рубрику
    const firstSelected = selected[0]
    const selectedButton = selectedRefs.current.get(firstSelected)

    if (selectedButton && containerRef.current) {
      selectedButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }, [selected])

  // Рендерим категорию-кнопку
  const renderCategoryButton = (category: Category, index: number) => {
    const isSelected = selected.includes(category.name)
    
    return (
      <motion.button
        key={category.name}
        ref={(el) => {
          if (el) {
            selectedRefs.current.set(category.name, el)
          } else {
            selectedRefs.current.delete(category.name)
          }
        }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        onClick={() => onSelect(category.name)}
        className={cn(
          "inline-flex items-center whitespace-nowrap rounded-full px-5 py-3 text-sm md:text-base font-medium transition-all shrink-0 border min-h-[44px] touch-manipulation",
          "active:scale-95",
          isSelected
            ? "bg-airbnb-rausch text-white border-airbnb-rausch shadow-md scale-105"
            : "bg-white text-gray-900 border-gray-300 hover:border-gray-900 hover:scale-105"
        )}
        style={{ scrollSnapAlign: 'center' }}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-sm md:text-base">{category.name}</span>
        {category.count > 0 && (
          <span className={cn(
            "ml-2 px-2.5 py-1 rounded-full text-xs md:text-sm font-semibold",
            isSelected ? "bg-white/20" : "bg-gray-100"
          )}>
            {category.count}
          </span>
        )}
      </motion.button>
    )
  }

  // На мобиле - 3 горизонтальные строки со свайпом, на десктопе - перенос на новую строку
  if (isMobile) {
    // Разделяем категории на 3 равные части
    const itemsPerRow = Math.ceil(categories.length / 3)
    const rows = [
      categories.slice(0, itemsPerRow),
      categories.slice(itemsPerRow, itemsPerRow * 2),
      categories.slice(itemsPerRow * 2)
    ]
    
    return (
      <div className="relative space-y-2">
        {rows.map((rowCategories, rowIndex) => (
          <div 
            key={rowIndex}
            className="overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            <div className="flex items-center justify-start gap-2">
              {rowCategories.map((category, index) => renderCategoryButton(category, rowIndex * itemsPerRow + index))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // На десктопе - обычный flex с переносом
  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className="flex flex-wrap items-center justify-start gap-2 pb-2"
      >
        {categories.map((category, index) => renderCategoryButton(category, index))}
      </div>
    </div>
  )
}
