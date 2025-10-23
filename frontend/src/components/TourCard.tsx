import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MapPin, Star, Heart, Clock, ChevronLeft, ChevronRight, User,
  DollarSign, Users, Calendar, Trophy, Gift, Sparkles
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
          <Gift className="w-3 h-3 mr-1" />
          Скидка {tour.discount_percentage}%
        </Badge>
      )
    }
    if (tour.total_bookings && tour.total_bookings > 100) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
          <Trophy className="w-3 h-3 mr-1" />
          Хит продаж
        </Badge>
      )
    }
    if (tour.total_bookings && tour.total_bookings > 50) {
      return (
        <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0">
          <Sparkles className="w-3 h-3 mr-1" />
          Популярное
        </Badge>
      )
    }
    // Новое - если создано менее 7 дней назад
    if (tour.created_at) {
      const createdDate = new Date(tour.created_at)
      const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceCreation < 7) {
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Новое
          </Badge>
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
        <Card className="overflow-hidden border-2 border-gray-100 hover:border-airbnb-rausch/30 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white">
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
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Бейдж */}
            {getBadge() && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
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
              onClick={toggleFavorite}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-3 right-3 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            >
              <Heart
                size={20}
                className={cn(
                  "transition-all",
                  isFavorite 
                    ? "fill-airbnb-rausch stroke-airbnb-rausch" 
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
                    "absolute left-2 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-white hover:scale-110",
                    currentPhotoIndex === 0 && "hidden"
                  )}
                >
                  <ChevronLeft size={18} className="text-gray-800" />
                </button>
                <button
                  onClick={nextPhoto}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-white hover:scale-110",
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
          <div className="p-5">
            {/* Название */}
            <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-4 min-h-[56px] group-hover:text-airbnb-rausch transition-colors">
              {tour.title}
            </h3>

            {/* Блочная информация - 2x2 сетка */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Цена */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-xl p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-blue-900 uppercase">Цена</span>
                </div>
                <div className="flex flex-col">
                  {tour.has_discount && tour.original_price ? (
                    <>
                      <span className="text-xs text-gray-400 line-through">
                        {formatRUB(tour.original_price)}
                      </span>
                      <span className="text-lg font-bold text-blue-900">
                        {formatRUB(tour.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-blue-900">
                      {formatRUB(tour.price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Длительность */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 rounded-xl p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-green-900 uppercase">Время</span>
                </div>
                <span className="text-lg font-bold text-green-900">{tour.duration}ч</span>
              </div>

              {/* Рейтинг */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-100 rounded-xl p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-white fill-white" />
                  </div>
                  <span className="text-xs font-semibold text-yellow-900 uppercase">Рейтинг</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-yellow-900">{tour.rating.toFixed(1)}</span>
                  <span className="text-xs text-yellow-700">({tour.reviews_count})</span>
                </div>
              </div>

              {/* Бронирований */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100 rounded-xl p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-purple-900 uppercase">Заказов</span>
                </div>
                <span className="text-lg font-bold text-purple-900">{tour.total_bookings || 0}</span>
              </div>
            </div>

            {/* Локация и Гид */}
            <div className="space-y-2">
              {/* Локация */}
              <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                <MapPin size={16} className="text-airbnb-rausch flex-shrink-0" />
                <span className="font-medium truncate">{tour.location}</span>
              </div>
              
              {/* Гид */}
              <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                <div className="w-6 h-6 bg-gradient-to-br from-airbnb-rausch to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-white" />
                </div>
                <span className="font-medium truncate">{tour.guide_name || 'Профессиональный гид'}</span>
              </div>
            </div>

            {/* Дата если есть */}
            {tour.start_date && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg">
                <Calendar size={16} className="text-blue-600 flex-shrink-0" />
                <span className="font-medium">
                  {new Date(tour.start_date).toLocaleDateString('ru-RU')}
                </span>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}
