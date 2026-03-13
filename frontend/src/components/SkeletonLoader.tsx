import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SkeletonLoaderProps {
  variant?: 'card' | 'text' | 'avatar' | 'image'
  className?: string
  count?: number
}

export function SkeletonLoader({ variant = 'card', className, count = 1 }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={cn("bg-white rounded-xl overflow-hidden shadow-airbnb-sm", className)}>
            <div className="skeleton aspect-[4/3] rounded-t-xl" />
            <div className="p-4 space-y-3">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="skeleton h-6 w-1/3 rounded" />
            </div>
          </div>
        )
      
      case 'text':
        return <div className={cn("skeleton h-4 rounded", className)} />
      
      case 'avatar':
        return <div className={cn("skeleton rounded-full", className)} />
      
      case 'image':
        return <div className={cn("skeleton rounded-xl", className)} />
      
      default:
        return <div className={cn("skeleton rounded-lg", className)} />
    }
  }

  if (count === 1) {
    return renderSkeleton()
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          {renderSkeleton()}
        </motion.div>
      ))}
    </>
  )
}

// Компонент для скелетона карточки тура
export function TourCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-xl overflow-hidden shadow-airbnb-sm", className)}>
      <div className="skeleton aspect-[4/3] rounded-t-xl" />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
        <div className="skeleton h-5 w-full rounded" />
        <div className="skeleton h-5 w-4/5 rounded" />
        <div className="flex items-center justify-between mt-4">
          <div className="skeleton h-4 w-16 rounded" />
          <div className="skeleton h-6 w-24 rounded" />
        </div>
      </div>
    </div>
  )
}

// Компонент для скелетона отзыва
export function ReviewSkeleton() {
  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-3 w-32 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
      </div>
    </div>
  )
}

