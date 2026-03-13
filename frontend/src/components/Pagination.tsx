import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  // Генерируем массив номеров страниц для отображения
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7 // Максимум видимых номеров страниц

    if (totalPages <= maxVisible) {
      // Если страниц мало, показываем все
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Всегда показываем первую страницу
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Показываем страницы вокруг текущей
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Всегда показываем последнюю страницу
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {/* Кнопка "Предыдущая" */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all",
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white border border-gray-300 text-gray-700 hover:border-gray-900 hover:shadow-md"
        )}
      >
        <ChevronLeft size={18} />
        <span className="hidden sm:inline">Предыдущая</span>
      </motion.button>

      {/* Номера страниц */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                ...
              </span>
            )
          }

          const pageNum = page as number
          const isActive = pageNum === currentPage

          return (
            <motion.button
              key={pageNum}
              whileHover={{ scale: isActive ? 1 : 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                "w-10 h-10 rounded-lg font-medium transition-all",
                isActive
                  ? "bg-airbnb-rausch text-white shadow-md"
                  : "bg-white border border-gray-300 text-gray-700 hover:border-gray-900 hover:shadow-sm"
              )}
            >
              {pageNum}
            </motion.button>
          )
        })}
      </div>

      {/* Кнопка "Следующая" */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all",
          currentPage === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white border border-gray-300 text-gray-700 hover:border-gray-900 hover:shadow-md"
        )}
      >
        <span className="hidden sm:inline">Следующая</span>
        <ChevronRight size={18} />
      </motion.button>
    </div>
  )
}

