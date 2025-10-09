import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Star, Heart, Clock, ChevronLeft, ChevronRight, User } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRUB } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Tour } from '@/types/tour'

interface TourCardProps {
  tour: Tour
  className?: string
}

export function TourCard({ tour, className }: TourCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  
  // Избранное из localStorage
  const [isFavorite, setIsFavorite] = useState(() => {
    const favorites = JSON.parse(localStorage.getItem('tour_favorites') || '[]')
    return favorites.includes(tour.id)
  })
  
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('tour_favorites') || '[]')
    if (isFavorite && !favorites.includes(tour.id)) {
      localStorage.setItem('tour_favorites', JSON.stringify([...favorites, tour.id]))
    } else if (!isFavorite && favorites.includes(tour.id)) {
      localStorage.setItem('tour_favorites', JSON.stringify(favorites.filter((id: number) => id !== tour.id)))
    }
  }, [isFavorite, tour.id])
  
  const photos = tour.photos?.length > 0 
    ? tour.photos 
    : ['https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&h=600&fit=crop']

  const nextPhoto = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  // Определяем бейдж (приоритет: скидка > хит > популярное > новое)
  const getBadge = () => {
    if (tour.has_discount && tour.discount_percentage) {
      return <Badge variant="discount">💰 Скидка {tour.discount_percentage}%</Badge>
    }
    if (tour.total_bookings && tour.total_bookings > 100) {
      return <Badge variant="popular">⭐ Хит продаж</Badge>
    }
    if (tour.total_bookings && tour.total_bookings > 50) {
      return <Badge variant="popular">🔥 Популярное</Badge>
    }
    // Новое - если создано менее 7 дней назад
    const createdDate = new Date(tour.created_at)
    const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceCreation < 7) {
      return <Badge variant="new">🆕 Новое</Badge>
    }
    return null
  }

  return (
    <Link to={`/tours/${tour.id}`}>
      <motion.div
        className={cn("group", className)}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="overflow-hidden border-0 shadow-airbnb-sm hover:shadow-2xl transition-all duration-300">
          {/* Галерея изображений */}
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
            <motion.img
              key={currentPhotoIndex}
              src={photos[currentPhotoIndex]}
              alt={tour.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Бейдж */}
            {getBadge() && (
              <div className="absolute top-3 left-3 z-10">
                {getBadge()}
              </div>
            )}
            
            {/* Heart иконка */}
            <button
              onClick={toggleFavorite}
              className="absolute top-3 right-3 z-10 p-2 hover:scale-110 transition-transform"
            >
              <Heart
                size={20}
                className={cn(
                  "transition-all",
                  isFavorite 
                    ? "fill-airbnb-rausch stroke-airbnb-rausch" 
                    : "fill-white/80 stroke-white/90"
                )}
              />
            </button>
            
            {/* Кнопки навигации по фото */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className={cn(
                    "absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white",
                    currentPhotoIndex === 0 && "hidden"
                  )}
                >
                  <ChevronLeft size={16} className="text-gray-800" />
                </button>
                <button
                  onClick={nextPhoto}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white",
                    currentPhotoIndex === photos.length - 1 && "hidden"
                  )}
                >
                  <ChevronRight size={16} className="text-gray-800" />
                </button>
              </>
            )}
            
            {/* Точки навигации */}
            {photos.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setCurrentPhotoIndex(index)
                    }}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      index === currentPhotoIndex
                        ? "bg-white w-2 h-2"
                        : "bg-white/60"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Контент карточки */}
          <div className="p-4">
            {/* Локация и длительность */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{tour.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{tour.duration}ч</span>
              </div>
            </div>

            {/* Название */}
            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[48px]">
              {tour.title}
            </h3>

            {/* Рейтинг и гид */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-gray-900 text-gray-900" />
                <span className="font-semibold text-sm">{tour.rating.toFixed(2)}</span>
                <span className="text-gray-600 text-sm">({tour.reviews_count})</span>
              </div>
              
              {/* Гид */}
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className="w-5 h-5 bg-airbnb-rausch/10 rounded-full flex items-center justify-center">
                  <User size={12} className="text-airbnb-rausch" />
                </div>
                <span className="truncate max-w-[100px]">{tour.guide_name || 'Гид'}</span>
              </div>
            </div>

            {/* Цена */}
            <div className="flex items-baseline gap-2">
              {tour.has_discount && tour.original_price ? (
                <>
                  <span className="text-gray-400 line-through text-sm">
                    {formatRUB(tour.original_price)}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatRUB(tour.price)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  {formatRUB(tour.price)}
                </span>
              )}
              <span className="text-sm text-gray-600">за человека</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}

