import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MapPin, Star, Heart, Clock, ChevronLeft, ChevronRight, User,
  DollarSign, Trophy, Sparkles
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ViewersCount } from '@/components/ViewersCount'
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

  return (
    <Link to={`/tours/${tour.id}`}>
      <motion.div
        className={cn("group", className)}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3, type: "spring" }}
      >
        <Card className="overflow-hidden border-2 border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm">
          {/* Галерея изображений */}
          <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            <motion.img
              key={currentPhotoIndex}
              src={photos[currentPhotoIndex]}
              alt={tour.title}
              loading="lazy"
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ objectFit: 'cover' }}
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Бейдж */}
            {getBadge() && (
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="absolute top-3 left-3 z-10"
              >
                {getBadge()}
              </motion.div>
            )}
            
            {/* Viewers Count */}
            <div className="absolute bottom-3 left-3 z-10">
              <ViewersCount tourId={tour.id} />
            </div>

            {/* Heart иконка */}
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFavorite}
              className="absolute top-3 right-3 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
            >
              <Heart
                size={20}
                className={cn(
                  "transition-all",
                  isFavorite 
                    ? "fill-red-500 stroke-red-500" 
                    : "stroke-gray-700"
                )}
              />
            </motion.button>
            
            {/* Кнопки навигации по фото */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className={cn(
                    "absolute left-2 top-1/2 -translate-y-1/2 bg-white/95 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-white hover:scale-110",
                    currentPhotoIndex === 0 && "hidden"
                  )}
                >
                  <ChevronLeft size={18} className="text-gray-800" />
                </button>
                <button
                  onClick={nextPhoto}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 bg-white/95 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-white hover:scale-110",
                    currentPhotoIndex === photos.length - 1 && "hidden"
                  )}
                >
                  <ChevronRight size={18} className="text-gray-800" />
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
                      "rounded-full transition-all",
                      index === currentPhotoIndex
                        ? "bg-white w-6 h-2"
                        : "bg-white/60 w-2 h-2 hover:bg-white/80"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Контент карточки */}
          <div className="p-4 space-y-4">
            {/* Название */}
            <h3 className="font-bold text-gray-900 line-clamp-2 text-lg min-h-[56px] leading-tight">
              {tour.title}
            </h3>

            {/* Блочная информация */}
            <div className="grid grid-cols-2 gap-2">
              {/* Локация */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-blue-700 font-semibold uppercase">Локация</p>
                  <p className="text-sm font-bold text-blue-900 truncate">{tour.location}</p>
                </div>
              </div>

              {/* Длительность */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-xl p-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-green-700 font-semibold uppercase">Время</p>
                  <p className="text-sm font-bold text-green-900">{tour.duration}ч</p>
                </div>
              </div>

              {/* Рейтинг */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-yellow-200 rounded-xl p-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-white fill-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-yellow-700 font-semibold uppercase">Рейтинг</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-sm font-bold text-yellow-900">{tour.rating.toFixed(1)}</p>
                    <p className="text-[10px] text-yellow-700">({tour.reviews_count})</p>
                  </div>
                </div>
              </div>

              {/* Цена */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 rounded-xl p-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-purple-700 font-semibold uppercase">Цена</p>
                  {tour.has_discount && tour.original_price ? (
                    <div className="flex flex-col">
                      <p className="text-[10px] text-purple-600 line-through">{formatRUB(tour.original_price)}</p>
                      <p className="text-sm font-bold text-purple-900">{formatRUB(tour.price)}</p>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-purple-900">{formatRUB(tour.price)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Гид */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-airbnb-rausch to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-600 font-semibold uppercase">Ваш гид</p>
                <p className="text-sm font-bold text-gray-900 truncate">{tour.guide_name || 'Профессиональный гид'}</p>
              </div>
              {tour.total_bookings && tour.total_bookings > 0 && (
                <div className="text-right">
                  <p className="text-[10px] text-gray-600 uppercase">Заказов</p>
                  <p className="text-sm font-bold text-airbnb-rausch">{tour.total_bookings}</p>
                </div>
              )}
            </div>

            {/* Кнопка "Подробнее" */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-airbnb-rausch to-pink-600 text-white rounded-xl p-3 text-center font-bold shadow-lg group-hover:shadow-xl transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Подробнее
              </span>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}
