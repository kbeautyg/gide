import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Category {
  name: string
  count: number
}

interface CategoryChipsProps {
  categories: Category[]
  selected: string[]
  onSelect: (category: string) => void
  maxVisible?: number
}

export function CategoryChips({ 
  categories, 
  selected, 
  onSelect,
  maxVisible = 12 
}: CategoryChipsProps) {
  const [showAll, setShowAll] = useState(false)
  
  const visibleCategories = showAll ? categories : categories.slice(0, maxVisible)
  const hasMore = categories.length > maxVisible

  return (
    <div className="relative">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
        {visibleCategories.map((category) => {
          const isSelected = selected.includes(category.name)
          
          return (
            <motion.button
              key={category.name}
              onClick={() => onSelect(category.name)}
              className={cn(
                "inline-flex items-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all shrink-0",
                isSelected
                  ? "bg-airbnb-rausch text-white shadow-md"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:shadow-sm"
              )}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {category.name} <span className="ml-1.5 opacity-70">{category.count}</span>
            </motion.button>
          )
        })}
        
        {hasMore && !showAll && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(true)}
            className="shrink-0 rounded-full"
          >
            Ещё <ChevronRight className="ml-1" size={14} />
          </Button>
        )}
      </div>
      
      {/* Градиент затухания справа */}
      {!showAll && hasMore && (
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      )}
    </div>
  )
}

