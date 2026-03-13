import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { getImageUrl } from '@/lib/utils'

interface CityCardProps {
  name: string
  country: string
  toursCount: number
  image: string
  index: number
  isPopular?: boolean
}

// Fallback изображение для городов
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop'

export function CityCard({ name, country, toursCount, image, index, isPopular }: CityCardProps) {
  const [imgSrc, setImgSrc] = useState(getImageUrl(image) || FALLBACK_IMAGE)
  const [isLoading, setIsLoading] = useState(true)

  const handleImageError = () => {
    setImgSrc(FALLBACK_IMAGE)
    setIsLoading(false)
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        delay: index * 0.06,
        duration: 0.4,
        ease: "easeOut"
      }}
      whileHover={{ y: -6, scale: 1.02 }}
    >
      <Link to={`/tours?location=${encodeURIComponent(name)}`}>
        <div className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-400 bg-white">
          {/* Badge для популярных - адаптивный */}
          {isPopular && (
            <motion.div
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-lg"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.06 + 0.3, type: "spring" }}
            >
              <TrendingUp size={10} className="sm:w-3 sm:h-3" />
              ТОП
            </motion.div>
          )}

          {/* Изображение */}
          <div className="relative h-full overflow-hidden">
            {/* Skeleton loader */}
            {isLoading && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 animate-pulse" />
            )}
            
            <motion.img
              src={imgSrc}
              alt={name}
              className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
            
            {/* Градиентный оверлей */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 transition-all duration-300" />
          </div>

          {/* Контент - адаптивный */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 space-y-1 sm:space-y-2">
            {/* Страна */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-white/70 text-xs sm:text-sm">
              <Building2 size={12} className="sm:w-3.5 sm:h-3.5" />
              <span>{country}</span>
            </div>
            
            {/* Название города */}
            <h3 className="font-bold text-lg sm:text-2xl md:text-3xl text-white group-hover:text-airbnb-rausch transition-colors duration-300">
              {name}
            </h3>
            
            {/* Количество туров */}
            <div className="flex items-center justify-between">
              <span className="text-white/90 text-xs sm:text-base">
                {toursCount} {toursCount === 1 ? 'экскурсия' : toursCount < 5 ? 'экскурсии' : 'экскурсий'}
              </span>
              
              {/* Стрелка - скрыта на мобильных */}
              <motion.div
                className="hidden sm:block text-white/70 text-xl opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.div>
            </div>
          </div>

          {/* Световой эффект при hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
