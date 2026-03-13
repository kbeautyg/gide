import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { getImageUrl } from '@/lib/utils'

interface CountryCardProps {
  name: string
  toursCount: number
  image: string
  index: number
  description?: string
  highlights?: readonly string[]
}

// Fallback изображение
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e24d5e?w=800&h=600&fit=crop'

export function CountryCard({ name, toursCount, image, index, description, highlights }: CountryCardProps) {
  const [imgSrc, setImgSrc] = useState(getImageUrl(image) || FALLBACK_IMAGE)
  const [isLoading, setIsLoading] = useState(true)

  const handleImageError = () => {
    setImgSrc(FALLBACK_IMAGE)
    setIsLoading(false)
  }


  const handleImageLoad = () => {
    setIsLoading(false)
  }

  // Склонение слова "экскурсия"
  const getToursWord = (count: number) => {
    if (count === 1) return 'экскурсия'
    if (count >= 2 && count <= 4) return 'экскурсии'
    return 'экскурсий'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={`/tours?location=${encodeURIComponent(name)}`} className="block">
        <div className="group relative rounded-2xl overflow-hidden bg-gray-900 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          {/* Изображение */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {/* Skeleton loader */}
            {isLoading && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse" />
            )}
            
            <img
              src={imgSrc}
              alt={name}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
            
            {/* Градиент снизу */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>

          {/* Контент поверх изображения */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
            {/* Название страны */}
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 group-hover:text-[#FF385C] transition-colors">
                  {name}
                </h3>
                
            {/* Описание */}
            {description && (
              <p className="text-white/70 text-xs sm:text-sm line-clamp-2 mb-2">
                {description}
              </p>
            )}
            
            {/* Города */}
            {highlights && highlights.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {highlights.slice(0, 3).map((city, idx) => (
                  <span 
                    key={idx} 
                    className="text-[10px] sm:text-xs bg-white/20 px-2 py-0.5 rounded-full text-white/90"
                  >
                    {city}
                  </span>
                ))}
                </div>
            )}
            
            {/* Количество туров и кнопка */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-white/80">
                <MapPin size={14} />
                <span className="text-xs sm:text-sm font-medium">
                  {toursCount} {getToursWord(toursCount)}
                </span>
              </div>

              <div className="flex items-center gap-1 text-white/60 group-hover:text-[#FF385C] transition-colors">
                <span className="text-xs sm:text-sm hidden sm:inline">Смотреть</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
