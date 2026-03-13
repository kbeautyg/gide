import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MapPin, Star, Heart, Clock, ChevronLeft, ChevronRight,
  Trophy, Sparkles, MessageCircle
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ViewersCount } from '@/components/ViewersCount'
import { formatRUB } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Tour } from '@/types/tour'
import { useFavorites } from '@/lib/favorites'
import { useAuthStore } from '@/lib/store'
import { ImageWithFallback } from '@/components/ImageWithFallback'
import { toast } from '@/lib/toast'

interface TourCardProps {
  tour: Tour
  className?: string
}

export function TourCard({ tour, className }: TourCardProps) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  
  const { isFavorite: checkIsFavorite, toggleFavorite: toggleFav } = useFavorites()
  const isFavorite = checkIsFavorite(tour.id)
  
  const photos = tour.photos?.length > 0 
    ? tour.photos 
    : []

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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFav(tour.id)
  }

  const handleMessageClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
        navigate('/login')
        return
    }
    // Переход на страницу тура с якорем к форме бронирования
    toast.info('Отправьте запрос на бронирование — гид свяжется с вами в чате')
    navigate(`/tours/${tour.id}`)
  }

  // ... (badge logic is the same)
  const getBadge = () => {
    if (tour.has_discount && tour.discount_percentage) {
      return (
        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Скидка {tour.discount_percentage}%
        </div>
      )
    }
    if (tour.total_bookings && tour.total_bookings > 100) {
      return (
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <Trophy className="w-3 h-3" />
          Хит продаж
        </div>
      )
    }
    if (tour.total_bookings && tour.total_bookings > 50) {
      return (
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Популярное
        </div>
      )
    }
    // Новое - если создано менее 7 дней назад
    if (tour.created_at) {
      const createdDate = new Date(tour.created_at)
      const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceCreation < 7) {
        return (
          <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Новое
          </div>
        )
      }
    }
    return null
  }

  const formatDuration = (hours: number) => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24)
      return `${days} ${days === 1 ? 'день' : (days < 5 ? 'дня' : 'дней')}`
    }
    return `${hours} ч`
  }

  const formatLocation = (loc: string) => {
    if (loc?.includes('Куала-Лумпур') && loc?.includes('Индонезия')) {
      return loc.replace('Индонезия', 'Малайзия')
    }
    return loc
  }

  return (
    <Link to={`/tours/${tour.id}`}>
      <motion.div
        className={cn("group", className)}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Card className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-white h-full flex flex-col">
          {/* Галерея изображений с фиксированным соотношением сторон */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
            <div className="absolute inset-0 w-full h-full">
                <ImageWithFallback
              key={currentPhotoIndex}
              src={photos[currentPhotoIndex]}
              alt={tour.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
            </div>
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />
            
            {/* Бейдж */}
            {getBadge() && (
              <div className="absolute top-3 left-3 z-10 pointer-events-none">
                {getBadge()}
              </div>
            )}
            
            {/* Viewers Count */}
            <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
              <ViewersCount tourId={tour.id} />
            </div>

            {/* Heart иконка */}
            <button
              onClick={handleFavoriteClick}
              aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all active:scale-95"
            >
              <Heart
                size={16}
                className={cn(
                  "transition-colors duration-300",
                  isFavorite 
                    ? "fill-red-500 stroke-red-500" 
                    : "stroke-gray-600 hover:stroke-gray-900"
                )}
              />
            </button>
            
            {/* Кнопки навигации по фото */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className={cn(
                    "absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-sm z-20",
                    currentPhotoIndex === 0 && "hidden"
                  )}
                >
                  <ChevronLeft size={16} className="text-gray-700" />
                </button>
                <button
                  onClick={nextPhoto}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-sm z-20",
                    currentPhotoIndex === photos.length - 1 && "hidden"
                  )}
                >
                  <ChevronRight size={16} className="text-gray-700" />
                </button>
              </>
            )}
            
            {/* Точки навигации */}
            {photos.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20 pointer-events-none">
                {photos.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "rounded-full transition-all backdrop-blur-sm shadow-sm",
                      index === currentPhotoIndex
                        ? "bg-white w-4 h-1.5"
                        : "bg-white/50 w-1.5 h-1.5"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Контент карточки */}
          <div className="p-4 flex flex-col flex-1">
            {/* Название */}
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-[15px] md:text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors">
              {tour.title}
            </h3>

            {/* Информация */}
            <div className="space-y-1.5 mb-2">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{formatLocation(tour.location)}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{formatDuration(tour.duration)}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-900 font-medium bg-yellow-50 px-2 py-0.5 rounded">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  <span>{tour.rating.toFixed(1)}</span>
                  <span className="text-gray-400 font-normal text-xs">({tour.reviews_count})</span>
                </div>
              </div>
            </div>

            {/* Цена и кнопка — прижаты к низу */}
            <div className="mt-auto pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    {tour.has_discount && tour.original_price ? (
                      <>
                        <span className="text-base md:text-lg font-bold text-gray-900">{formatRUB(tour.price)}</span>
                        <span className="text-xs text-gray-400 line-through">{formatRUB(tour.original_price)}</span>
                      </>
                    ) : (
                      <span className="text-base md:text-lg font-bold text-gray-900">{formatRUB(tour.price)}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">за человека</p>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-3 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 -mr-1"
                  onClick={handleMessageClick}
                >
                  <MessageCircle size={14} className="mr-1" />
                  Написать
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}
