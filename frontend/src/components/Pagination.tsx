import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  itemsPerPage?: number
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  itemsPerPage
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = []
  const maxVisiblePages = 7

  // Логика отображения страниц
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, -1, totalPages)
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages)
    }
  }

  const startItem = (currentPage - 1) * (itemsPerPage || 0) + 1
  const endItem = Math.min(currentPage * (itemsPerPage || 0), totalItems || 0)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Информация */}
      {totalItems && itemsPerPage && (
        <p className="text-sm text-gray-600">
          Показано <span className="font-medium">{startItem}-{endItem}</span> из{' '}
          <span className="font-medium">{totalItems}</span> экскурсий
        </p>
      )}

      {/* Кнопки пагинации */}
      <div className="flex items-center gap-1">
        {/* Назад */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg"
        >
          <ChevronLeft size={16} />
        </Button>

        {/* Номера страниц */}
        {pages.map((page, index) => {
          if (page === -1) {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                ...
              </span>
            )
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className={`rounded-lg min-w-[40px] ${
                currentPage === page
                  ? 'bg-airbnb-rausch hover:bg-airbnb-rausch/90 text-white'
                  : ''
              }`}
            >
              {page}
            </Button>
          )
        })}

        {/* Вперед */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-lg"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}

