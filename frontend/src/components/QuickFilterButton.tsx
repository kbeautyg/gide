import { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickFilterButtonProps {
  label: string
  icon?: ReactNode
  isActive?: boolean
  count?: number
  onClick?: () => void
  className?: string
}

export function QuickFilterButton({
  label,
  icon,
  isActive = false,
  count,
  onClick,
  className
}: QuickFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      data-filter-active={isActive ? "true" : "false"}
      className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-lg border transition-all whitespace-nowrap min-h-[44px]",
        "hover:border-gray-900 hover:shadow-sm active:scale-95 touch-manipulation",
        isActive
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white text-gray-900 border-gray-300",
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="text-sm font-medium">{label}</span>
      {count !== undefined && count > 0 && (
        <span className={cn(
          "px-2 py-0.5 rounded-md text-xs font-medium",
          isActive
            ? "bg-white/20 text-white"
            : "bg-gray-100 text-gray-700"
        )}>
          {count}
        </span>
      )}
      <ChevronDown size={16} className={cn(
        "flex-shrink-0 transition-transform",
        isActive && "rotate-180"
      )} />
    </button>
  )
}

