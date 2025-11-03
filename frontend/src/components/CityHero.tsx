import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Globe } from 'lucide-react'
import { useState, useEffect } from 'react'

interface CityHeroProps {
  city?: string
  country?: string
  toursCount: number
  image?: string
}

export function CityHero({ city, country, toursCount, image }: CityHeroProps) {
  // Маппинг городов на изображения
  const cityImages: Record<string, string> = {
    'Бангкок': 'https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?w=1920&h=600&fit=crop',
    'Пхукет': 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1920&h=600&fit=crop',
    'Токио': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&h=600&fit=crop',
    'Дубай': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&h=600&fit=crop',
    'Киото': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&h=600&fit=crop',
    'Сеул': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1920&h=600&fit=crop',
    'Убуд': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&h=600&fit=crop',
    'Ханой': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1920&h=600&fit=crop',
    'Сингапур': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1920&h=600&fit=crop',
    'Осака': 'https://images.unsplash.com/photo-1590253230532-a67f6bc61c9e?w=1920&h=600&fit=crop',
    'Семиньяк': 'https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=1920&h=600&fit=crop',
    'Хошимин': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1920&h=600&fit=crop',
  }

  // Маппинг стран на изображения
  const countryImages: Record<string, string> = {
    'Таиланд': 'https://images.unsplash.com/photo-1573992559682-77889a5e9e67?w=1920&h=600&fit=crop',
    'ОАЭ': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&h=600&fit=crop',
    'Япония': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&h=600&fit=crop',
    'Корея': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1920&h=600&fit=crop',
    'Индонезия': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&h=600&fit=crop',
    'Вьетнам': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1920&h=600&fit=crop',
    'Сингапур': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1920&h=600&fit=crop',
    'Китай': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1920&h=600&fit=crop',
    'Индия': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1920&h=600&fit=crop',
    'Малайзия': 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1920&h=600&fit=crop',
  }

  const hasLocation = city || country
  const heroImage = image || (city ? cityImages[city] : country ? countryImages[country] : null)
  
  // Состояние для отслеживания загрузки изображения
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageKey, setImageKey] = useState(0)

  // Сбрасываем состояние загрузки при смене изображения
  useEffect(() => {
    if (heroImage) {
      setImageLoaded(false)
      setImageKey(prev => prev + 1)
    }
  }, [heroImage])

  const displayLocation = city || country || 'Весь мир'
  const displayTitle = city ? `Экскурсии в ${city}` : country ? `Экскурсии в ${country}` : 'Авторские туры по всему миру'

  return (
    <section className="relative h-[400px] overflow-hidden">
      <AnimatePresence mode="wait">
        {hasLocation && heroImage ? (
          <motion.div
            key={`image-${imageKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <motion.img
              src={heroImage}
              alt={displayLocation}
              className="w-full h-full object-cover"
              initial={{ scale: 1.05 }}
              animate={{ scale: imageLoaded ? 1 : 1.05 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              onLoad={() => setImageLoaded(true)}
            />
          </motion.div>
        ) : (
          // Анимация для случая без локации
          <motion.div
            key="animation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500"
          >
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  'linear-gradient(45deg, #667eea, #764ba2)',
                  'linear-gradient(45deg, #f093fb, #f5576c)',
                  'linear-gradient(45deg, #4facfe, #00f2fe)',
                  'linear-gradient(45deg, #667eea, #764ba2)',
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 180, 270, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10 text-center px-4">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="mb-4"
                >
                  <Globe size={80} className="text-white mx-auto drop-shadow-lg" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0">
        <div className="container mx-auto px-4 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {hasLocation ? (
              <>
                <div className="flex items-center gap-2 text-white/90 mb-3">
                  <MapPin size={20} />
                  <span className="text-lg">{country || city}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                  {displayTitle}
                </h1>
                <p className="text-xl text-white/90">
                  {toursCount} {toursCount === 1 ? 'экскурсия' : toursCount < 5 ? 'экскурсии' : 'экскурсий'} на русском языке
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-white/90 mb-3 justify-center">
                  <Globe size={24} />
                  <span className="text-lg">Весь мир</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 text-center">
                  Авторские туры по всему миру
                </h1>
                <p className="text-xl text-white/90 text-center">
                  {toursCount} {toursCount === 1 ? 'экскурсия' : toursCount < 5 ? 'экскурсии' : 'экскурсий'} на русском языке
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

