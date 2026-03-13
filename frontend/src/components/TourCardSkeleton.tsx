import { Card } from '@/components/ui/card'

export function TourCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-airbnb-sm">
      {/* Image skeleton */}
      <div className="relative aspect-[4/3] bg-gray-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Location */}
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
        
        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse" />
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse" />
        </div>
        
        {/* Divider */}
        <div className="h-px bg-gray-100" />
        
        {/* Meta info */}
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
        </div>
      </div>
    </Card>
  )
}

