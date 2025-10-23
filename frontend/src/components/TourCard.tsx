import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Tour } from '@/types/tour'

interface TourCardProps {
  tour: Tour
  className?: string
}

export function TourCard({ tour, className = '' }: TourCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  
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

  return (
    <Link to={`/tours/${tour.id}`} className={`block group ${className}`}>
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        {/* Изображение */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={photos[currentPhotoIndex]}
            alt={tour.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e24d5e?w=800&h=600&fit=crop'
            }}
          />
          
          {/* Навигация по фото */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={16} />
              </button>
              
              {/* Индикаторы */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {photos.slice(0, 5).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      idx === currentPhotoIndex ? 'bg-white w-4' : 'bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Информация */}
        <div className="p-4">
          {/* Локация и категория */}
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
            <MapPin size={14} className="text-gray-400" />
            <span>{tour.location}</span>
            <span className="text-gray-300">•</span>
            <span>{tour.category}</span>
          </div>

          {/* Название */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-airbnb-rausch transition-colors">
            {tour.title}
          </h3>

          {/* Детали */}
          <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock size={14} className="text-gray-400" />
              <span>{tour.duration}ч</span>
            </div>
            {tour.rating > 0 && (
              <>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{tour.rating.toFixed(1)}</span>
                  {tour.reviews_count > 0 && (
                    <span className="text-gray-500">({tour.reviews_count})</span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Цена */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('ru-RU').format(tour.price)} ₽
              </span>
              <span className="text-sm text-gray-500 ml-1">/ чел</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
